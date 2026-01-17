// admin.js

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. AUTHENTICATION & SETUP ---
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    // Security check: Redirect if not a logged-in admin
    if (!token || !user || user.role !== 'admin') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
        return;
    }
        // --- START: CHANGE PASSWORD MODAL LOGIC ---
    const changePasswordBtn = document.getElementById('change-password-btn');
    const passwordModal = document.getElementById('password-modal');
    const cancelBtn = document.getElementById('cancel-btn');
    const changePasswordForm = document.getElementById('change-password-form');
    const passwordFormMessage = document.getElementById('password-form-message');

    changePasswordBtn.addEventListener('click', () => {
        passwordModal.classList.remove('hidden');
        changePasswordForm.reset();
        passwordFormMessage.textContent = '';
    });
    cancelBtn.addEventListener('click', () => {
        passwordModal.classList.add('hidden');
    });
    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        passwordFormMessage.textContent = '';
        const oldPassword = document.getElementById('old-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            passwordFormMessage.className = 'text-red-500 text-sm text-center mt-4 h-4';
            passwordFormMessage.textContent = 'New passwords do not match.';
            return;
        }
        try {
            const response = await fetch('http://localhost:5000/api/auth/changepassword', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ oldPassword, newPassword })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            
            passwordFormMessage.className = 'text-green-600 text-sm text-center mt-4 h-4';
            passwordFormMessage.textContent = 'Password changed successfully!';
            setTimeout(() => passwordModal.classList.add('hidden'), 2000);
        } catch (error) {
            passwordFormMessage.className = 'text-red-500 text-sm text-center mt-4 h-4';
            passwordFormMessage.textContent = error.message || 'An error occurred.';
        }
    });
    // --- END: CHANGE PASSWORD MODAL LOGIC ---


    // --- 2. ELEMENT SELECTIONS ---
    // General elements
    document.getElementById('welcome-message').textContent = `Welcome, ${user.name}!`;
    const logoutBtn = document.getElementById('logout-btn');
    
    // Event management elements
    const createEventForm = document.getElementById('create-event-form');
    const eventsTableBody = document.getElementById('events-table-body');
    const formMessage = document.getElementById('form-message');
    
    // Delete modal elements
    const deleteModal = document.getElementById('delete-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    let eventToDeleteId = null;

    // Report elements
    const summaryTableBody = document.getElementById('summary-table-body');
    const detailsTableContainer = document.getElementById('details-table-container');
    const exportCsvBtn = document.getElementById('export-csv-btn');
    let summaryDataForExport = []; // To hold data for the CSV export

    // --- 3. DATA FETCHING FUNCTIONS ---

    /**
     * Fetches all events and displays them in the 'Manage Events' table.
     */
    const fetchAndDisplayEvents = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/events', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch events.');
            
            const events = await response.json();
            eventsTableBody.innerHTML = ''; // Clear loading message

            if (events.length === 0) {
                eventsTableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4">No events found. Create one to get started!</td></tr>';
                return;
            }

            events.forEach(event => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">${event.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${new Date(event.event_date).toLocaleDateString()}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${event.hours}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <a href="mark_attendance.html?eventId=${event.id}&eventName=${encodeURIComponent(event.name)}" class="text-green-600 hover:text-green-900 mr-4">Mark Attendance</a>
                        <button data-id="${event.id}" class="text-red-600 hover:text-red-900 delete-btn">Delete</button>
                    </td>
                `;
                eventsTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error:', error);
            eventsTableBody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-red-500">Error loading events.</td></tr>`;
        }
    };

    /**
     * Fetches the group attendance report and populates both the summary and detailed tables.
     */
    const fetchGroupReport = async () => {
        summaryTableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4">Loading report...</td></tr>';
        detailsTableContainer.innerHTML = '<p class="p-4 text-center">Loading details...</p>';
        try {
            const response = await fetch('http://localhost:5000/api/attendance/group-report', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch report.');
            
            const report = await response.json();
            
            // Render Summary Table
            summaryDataForExport = report.summary;
            summaryTableBody.innerHTML = '';
            report.summary.forEach(user => {
       const row = `
        <tr>
            <td class="px-6 py-4">${user.id}</td>
            <td class="px-6 py-4 font-medium">${user.name}</td>
            <td class="px-6 py-4">${user.username}</td>
            <td class="px-6 py-4">${user.totalHoursAttended}</td>
            <td class="px-6 py-4 font-semibold">${user.attendancePercentage}%</td>
        </tr>
    `;
                summaryTableBody.innerHTML += row;
            });

            // Render Detailed Pivot Table
            renderDetailsTable(report.details);

        } catch (error) {
            console.error('Report Error:', error);
            summaryTableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-red-500">Error loading report.</td></tr>';
        }
    };

    // --- 4. HELPER FUNCTIONS ---

    /**
     * Renders the complex pivot table for detailed attendance.
     * @param {Array} details - The detailed attendance records from the API.
     */
    const renderDetailsTable = (details) => {
        if (details.length === 0) {
            detailsTableContainer.innerHTML = '<p class="p-4 text-center">No detailed attendance records found.</p>';
            return;
        }

        const users = {}; // { userId: userName, userId_events: { eventId: status } }
        const events = {}; // { eventId: { name, date } }

        details.forEach(rec => {
            users[rec.userId] = rec.userName;
            events[rec.eventId] = { name: rec.eventName, date: rec.eventDate };
            if (!users[rec.userId + '_events']) users[rec.userId + '_events'] = {};
            users[rec.userId + '_events'][rec.eventId] = rec.status;
        });
        
        const sortedEventIds = Object.keys(events).sort((a, b) => new Date(events[b].date) - new Date(events[a].date));

        let tableHTML = '<table class="min-w-full divide-y divide-gray-200"><thead class="bg-gray-100"><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member Name</th>';
        sortedEventIds.forEach(eventId => {
            tableHTML += `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">${events[eventId].name}</th>`;
        });
        tableHTML += '</tr></thead><tbody class="bg-white divide-y divide-gray-200">';

        Object.keys(users).forEach(userId => {
            if (userId.includes('_events')) return; // Skip our helper properties
            tableHTML += `<tr><td class="px-6 py-4 font-medium">${users[userId]}</td>`;
            sortedEventIds.forEach(eventId => {
                const status = users[userId + '_events'][eventId] || 'N/A';
                const statusClass = status === 'present' ? 'text-green-600' : (status === 'absent' ? 'text-red-600' : 'text-gray-400');
                tableHTML += `<td class="px-6 py-4 ${statusClass}">${status.charAt(0).toUpperCase() + status.slice(1)}</td>`;
            });
            tableHTML += '</tr>';
        });

        tableHTML += '</tbody></table>';
        detailsTableContainer.innerHTML = tableHTML;
    };

   /**
 * Exports the summary data to a downloadable CSV file.
 * @param {Array} data - The summary data to export.
 */
const exportToCsv = (data) => {
    // Updated headers
    const headers = "ID,Name,Username,TotalHoursAttended,AttendancePercentage\n";
    // Updated row mapping
    const rows = data.map(user => 
        `${user.id},"${user.name}","${user.username}",${user.totalHoursAttended},${user.attendancePercentage}`
    ).join("\n");
    
    const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "group_attendance_summary.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

    // --- 5. EVENT LISTENERS ---

    // Listener for creating an event
    createEventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const eventData = {
            name: document.getElementById('event-name').value,
            event_date: document.getElementById('event-date').value,
            hours: parseInt(document.getElementById('event-hours').value)
        };

        try {
            const response = await fetch('http://localhost:5000/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(eventData)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to create event.');
            
            formMessage.textContent = 'Event created successfully!';
            formMessage.className = 'text-green-600 text-sm text-center mt-2 h-4';
            createEventForm.reset();
            fetchAndDisplayEvents(); // Refresh the list
        } catch (error) {
            formMessage.textContent = error.message;
            formMessage.className = 'text-red-500 text-sm text-center mt-2 h-4';
        }
        setTimeout(() => formMessage.textContent = '', 3000);
    });

    // Listener for delete button clicks (using event delegation)
    eventsTableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            eventToDeleteId = e.target.getAttribute('data-id');
            deleteModal.classList.remove('hidden');
        }
    });

    // Listeners for the delete modal buttons
    cancelDeleteBtn.addEventListener('click', () => {
        deleteModal.classList.add('hidden');
        eventToDeleteId = null;
    });

    confirmDeleteBtn.addEventListener('click', async () => {
        if (!eventToDeleteId) return;
        try {
            const response = await fetch(`http://localhost:5000/api/events/${eventToDeleteId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to delete event.');
            
            deleteModal.classList.add('hidden');
            eventToDeleteId = null;
            fetchAndDisplayEvents(); // Refresh the list
        } catch (error) {
            console.error('Delete error:', error);
            alert('Could not delete the event.');
        }
    });
    
    // Listener for CSV export button
    exportCsvBtn.addEventListener('click', () => exportToCsv(summaryDataForExport));
    
    // Listener for logout button
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });

    // --- 6. INITIAL PAGE LOAD ---
    fetchAndDisplayEvents();
    fetchGroupReport();
});