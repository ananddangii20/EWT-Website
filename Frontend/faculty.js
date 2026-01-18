// faculty.js
document.addEventListener('DOMContentLoaded', () => {
    // --- Authentication and Setup ---
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user || user.role !== 'faculty') {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('welcome-message').textContent = `Welcome, ${user.name}!`;
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });

    const groupsContainer = document.getElementById('groups-container');
    const reportContainer = document.getElementById('report-container');
    let activeGroupBtn = null;
    let summaryDataForExport = [];

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


    // --- Data Fetching ---
    const fetchGroups = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/groups', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Could not fetch teams.');
            
            const groups = await response.json();
            groupsContainer.innerHTML = '';
            groups.forEach(group => {
                const button = document.createElement('button');
                button.className = 'bg-white px-5 py-2 rounded-lg shadow font-semibold text-amber-800 hover:bg-amber-100 transition border border-amber-200';
                button.textContent = group.name;
                button.onclick = () => {
                    if (activeGroupBtn) activeGroupBtn.classList.remove('bg-amber-200', 'border-amber-400');
                    button.classList.add('bg-amber-200', 'border-amber-400');
                    activeGroupBtn = button;
                    fetchAndDisplayReport(group.id, group.name);
                };
                groupsContainer.appendChild(button);
            });
        } catch (error) {
            groupsContainer.innerHTML = `<p class="text-red-500">${error.message}</p>`;
        }
    };

    const fetchAndDisplayReport = async (groupId, groupName) => {
        reportContainer.classList.remove('hidden');
        reportContainer.innerHTML = `<p class="text-center mt-8">Loading report for ${groupName}...</p>`;
        try {
            const response = await fetch(`http://localhost:5000/api/attendance/group-report/${groupId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`Could not load report for ${groupName}.`);

            const report = await response.json();

            summaryDataForExport = report.summary;

            const summaryTableHTML = renderSummaryTable(report.summary, groupName);
            const detailsTableHTML = renderDetailsTable(report.details);
            reportContainer.innerHTML = summaryTableHTML + detailsTableHTML;

            document.getElementById('export-csv-btn').addEventListener('click', () => {
                const filename = `${groupName.replace(/ /g, "_")}_summary.csv`;
                exportToCsv(summaryDataForExport, filename);
            });
        } catch (error) {
            reportContainer.innerHTML = `<p class="text-center text-red-500 mt-8">${error.message}</p>`;
        }
    };

    // --- Table Rendering Functions ---
    const renderSummaryTable = (summaryData, groupName) => {
        let rows = summaryData.map(user => `
            <tr>
                <td class="px-6 py-4">${user.id}</td>
                <td class="px-6 py-4 font-medium">${user.name}</td>
                <td class="px-6 py-4">${user.username}</td>
                <td class="px-6 py-4">${user.totalHoursAttended}</td>
                <td class="px-6 py-4 font-semibold">${user.attendancePercentage}%</td>
            </tr>
        `).join('');

        return `
            <div class="bg-white shadow-md rounded-lg overflow-hidden mt-8">
                <div class="px-6 py-4 flex justify-between items-center">
                    <h2 class="text-2xl font-bold text-amber-800">${groupName} - Summary</h2>
                    <button id="export-csv-btn" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-semibold text-sm">Export to CSV</button>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Hours</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance %</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">${rows}</tbody>
                    </table>
                </div>
            </div>`;
    };

    const renderDetailsTable = (details) => {
        if (details.length === 0) {
            return '<div class="bg-white shadow-md rounded-lg p-6 mt-8"><h2 class="text-2xl font-bold text-amber-800 mb-4">Detailed Report</h2><p>No detailed attendance records found for this team.</p></div>';
        }
        
        const users = {};
        const events = {};
        details.forEach(rec => {
            users[rec.userId] = rec.userName;
            events[rec.eventId] = { name: rec.eventName, date: rec.eventDate };
            if (!users[rec.userId + '_events']) users[rec.userId + '_events'] = {};
            users[rec.userId + '_events'][rec.eventId] = rec.status;
        });

        const sortedEventIds = Object.keys(events).sort((a, b) => new Date(events[b].date) - new Date(events[a].date));
        
        let headerHTML = '<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member Name</th>';
        sortedEventIds.forEach(eventId => headerHTML += `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">${events[eventId].name}</th>`);

        let bodyHTML = '';
        Object.keys(users).forEach(userId => {
            if (userId.includes('_events')) return;
            let rowHTML = `<tr><td class="px-6 py-4 font-medium">${users[userId]}</td>`;
            sortedEventIds.forEach(eventId => {
                const status = users[userId + '_events'][eventId] || 'N/A';
                const statusClass = status === 'present' ? 'text-green-600' : (status === 'absent' ? 'text-red-600' : 'text-gray-400');
                rowHTML += `<td class="px-6 py-4 ${statusClass}">${status.charAt(0).toUpperCase() + status.slice(1)}</td>`;
            });
            rowHTML += '</tr>';
            bodyHTML += rowHTML;
        });

        return `
            <div class="bg-white shadow-md rounded-lg overflow-hidden mt-8">
                <div class="px-6 py-4"><h2 class="text-2xl font-bold text-amber-800">Detailed Report</h2></div>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-100"><tr>${headerHTML}</tr></thead>
                        <tbody class="bg-white divide-y divide-gray-200">${bodyHTML}</tbody>
                    </table>
                </div>
            </div>`;
    };
    
    // --- Helper Function for CSV Export ---
    const exportToCsv = (data, filename) => {
        const headers = "ID,Name,Username,TotalHoursAttended,AttendancePercentage\n";
        const rows = data.map(user => 
            `${user.id},"${user.name}","${user.username}",${user.totalHoursAttended},${user.attendancePercentage}`
        ).join("\n");
        
        const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- Initial Load ---
    fetchGroups();
});