// login.js
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const captchaDisplay = document.getElementById('captcha-display');
const captchaInput = document.getElementById('captcha-input');
const refreshCaptchaBtn = document.getElementById('refresh-captcha');
const errorMessage = document.getElementById('error-message');

let correctCaptcha = '';

// Function to generate a random captcha string
function generateCaptcha() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    correctCaptcha = result;
    captchaDisplay.textContent = result;
}

// Event listener for the refresh button
refreshCaptchaBtn.addEventListener('click', generateCaptcha);

// Event listener for the form submission
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the form from reloading the page
    errorMessage.textContent = ''; // Clear previous errors

    const username = usernameInput.value;
    const password = passwordInput.value;
    const captcha = captchaInput.value;

    // 1. Validate the captcha
    if (captcha.toLowerCase() !== correctCaptcha.toLowerCase()) {
        errorMessage.textContent = 'Verification failed. Please try again.';
        generateCaptcha(); // Generate a new captcha
        captchaInput.value = ''; // Clear the input field
        return;
    }

    // 2. Send login request to the backend
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) { // Check if the HTTP status is 2xx
            // 3. Handle successful login
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect based on user role
            if (data.user.role === 'admin') {
                window.location.href = 'admin_dashboard.html';
            } else if (data.user.role === 'faculty') {
                window.location.href = 'faculty_dashboard.html';
            } else {
                window.location.href = 'member_dashboard.html';
            }

        } else {
            // 4. Handle failed login
            errorMessage.textContent = data.message || 'An error occurred.';
            generateCaptcha();
            captchaInput.value = '';
        }
    } catch (error) {
        console.error('Login request failed:', error);
        errorMessage.textContent = 'Cannot connect to the server.';
    }
});

// Generate the first captcha when the page loads
window.onload = generateCaptcha;