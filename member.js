// member.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Authentication Check ---
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
        // If no token or user data, redirect to login
        window.location.href = 'login.html';
        return;
    }

    // --- Welcome Message and Logout ---
    document.getElementById('welcome-message').textContent = `Welcome, ${user.name}!`;

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });

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


    // --- Fetch and Display Attendance Data ---
    async function fetchAttendanceData() {
        try {
            const response = await fetch('http://localhost:5000/api/attendance/my-records', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                // Token is invalid or expired
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch attendance data.');
            }

            const data = await response.json();
            
            // Populate the summary cards
            document.getElementById('total-hours').textContent = data.totalHoursAttended;
            document.getElementById('attendance-percentage').textContent = `${data.attendancePercentage}%`;

            // Populate the attendance table
            const tableBody = document.getElementById('attendance-table-body');
            tableBody.innerHTML = ''; // Clear the "Loading..." message

            if (data.records.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4">No attendance records found.</td></tr>';
                return;
            }
            
            data.records.forEach(record => {
                const statusClass = record.status === 'present' ? 'text-green-600 font-semibold' : 'text-red-600';
                const row = `
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap">${record.name}</td>
                        <td class="px-6 py-4 whitespace-nowrap">${new Date(record.event_date).toLocaleDateString()}</td>
                        <td class="px-6 py-4 whitespace-nowrap">${record.hours}</td>
                        <td class="px-6 py-4 whitespace-nowrap ${statusClass}">${record.status.charAt(0).toUpperCase() + record.status.slice(1)}</td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });

        } catch (error) {
            console.error('Error fetching attendance:', error);
            const tableBody = document.getElementById('attendance-table-body');
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-red-500">Could not load data.</td></tr>';
        }
    }

    fetchAttendanceData();
});