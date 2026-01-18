// auth.js - Shared script for dashboard pages

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    // If no token, redirect to login page
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Handle logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault(); // 🛑 STOP the button from redirecting immediately

            try {
                // 📡 Tell the backend to log the logout time
                await fetch('http://localhost:5000/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log("Logout signal sent to server");
            } catch (error) {
                console.error("Logout failed:", error);
            } finally {
                // 🧹 Clear local storage and redirect AFTER the server knows
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
            }
        });
    }
});