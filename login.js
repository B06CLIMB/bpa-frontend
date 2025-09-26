const backendURL = "https://bpa-backend-j1z3.onrender.com";

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (!username || !password) {
                loginError.textContent = 'Username and password are required.';
                return;
            }

            try {
                const res = await fetch(`${backendURL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password, age: 0 })
                });
                const data = await res.json();

                if (res.ok && data.success) {
                    localStorage.setItem('isLoggedIn', 'true');
                    window.location.href = 'dashboard.html';
                } else {
                    loginError.textContent = data.message || 'Login failed. Please check your credentials.';
                }
            } catch (err) {
                console.error("Login Error:", err);
                loginError.textContent = 'Could not connect to the server.';
            }
        });
    }
});

