// mark_attendance.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Auth Check & Element Selections ---
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user || user.role !== 'admin') {
        window.location.href = 'login.html';
        return;
    }

    const eventNameHeader = document.getElementById('event-name-header');
    const membersTableBody = document.getElementById('members-table-body');
    const attendanceForm = document.getElementById('attendance-form');
    const formMessage = document.getElementById('form-message');
    const logoutBtn = document.getElementById('logout-btn');
    let groupMembers = [];

    // --- Get Event Info from URL ---
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');
    const eventName = urlParams.get('eventName');

    if (!eventId || !eventName) {
        // If event details are missing, go back to the dashboard
        window.location.href = 'admin_dashboard.html';
        return;
    }
    eventNameHeader.textContent = decodeURIComponent(eventName);

    // --- Fetch Group Members and Saved Attendance Data ---
    const fetchDataAndBuildTable = async () => {
        try {
            // Make two API calls in parallel for efficiency
            const [membersRes, attendanceRes] = await Promise.all([
                fetch('http://localhost:5000/api/users/my-group', { 
                    headers: { 'Authorization': `Bearer ${token}` } 
                }),
                fetch(`http://localhost:5000/api/attendance/event/${eventId}/group`, { 
                    headers: { 'Authorization': `Bearer ${token}` } 
                })
            ]);

            if (!membersRes.ok || !attendanceRes.ok) {
                throw new Error('Failed to fetch required page data.');
            }
            
            groupMembers = await membersRes.json();
            const savedAttendance = await attendanceRes.json();

            // Create a simple map for quick lookups of saved statuses
            const savedStatusMap = new Map();
            savedAttendance.forEach(record => {
                savedStatusMap.set(record.user_id, record.status);
            });
            
            // Render table
            membersTableBody.innerHTML = '';
            groupMembers.forEach(member => {
                const savedStatus = savedStatusMap.get(member.id) || 'absent'; // Default to 'absent' if not marked yet
                
                const isPresentChecked = savedStatus === 'present' ? 'checked' : '';
                const isAbsentChecked = savedStatus === 'absent' ? 'checked' : '';

                const row = document.createElement('tr');
                row.setAttribute('data-user-id', member.id);
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">${member.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${member.username}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <label class="mr-4">
                            <input type="radio" name="status_${member.id}" value="present" required class="mr-1" ${isPresentChecked}> Present
                        </label>
                        <label>
                            <input type="radio" name="status_${member.id}" value="absent" class="mr-1" ${isAbsentChecked}> Absent
                        </label>
                    </td>
                `;
                membersTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            membersTableBody.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-red-500">Error loading data.</td></tr>';
        }
    };

    // --- Form Submission Handler ---
    attendanceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const attendees = groupMembers.map(member => ({
            userId: member.id,
            status: document.querySelector(`input[name="status_${member.id}"]:checked`).value
        }));
        
        const payload = { 
            eventId: parseInt(eventId), 
            attendees: attendees 
        };

        try {
            const response = await fetch('http://localhost:5000/api/attendance/mark', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(payload)
            });
            
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            
            formMessage.textContent = 'Attendance updated successfully!';
            formMessage.className = 'text-green-600 text-sm text-center mt-2 h-4';
            setTimeout(() => formMessage.textContent = '', 3000);

        } catch (error) {
            formMessage.textContent = error.message;
            formMessage.className = 'text-red-500 text-sm text-center mt-2 h-4';
        }
    });
    
    // --- Logout Button ---
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });
    
    // --- Initial Load ---
    fetchDataAndBuildTable();
});