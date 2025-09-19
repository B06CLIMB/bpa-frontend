// login.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    // Render backend URL
    const backendURL = "https://bpa-backend-1.onrender.com";

    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const age = document.getElementById('age').value.trim();
        const password = document.getElementById('password').value;

        if (!name || !age || !password) {
            alert('Please fill in all fields.');
            return;
        }

        // Clear any previous login info
        localStorage.clear();

        try {
            const res = await fetch(`${backendURL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, age, password })
            });

            const data = await res.json();

            if (res.ok && (data.message.includes('Login successful') || data.message.includes('New user registered'))) {
                localStorage.setItem('userName', name);
                localStorage.setItem('userAge', age);

                alert(data.message);
                window.location.href = 'dashboard.html';
            } else if (res.status === 401) {
                alert('Invalid password. Try again.');
            } else {
                alert(data.message || 'Login failed. Try again.');
            }

        } catch (err) {
            console.error('Login error:', err);
            alert('Could not connect to server. Wait a few seconds if the backend is waking up.');
        }
    });
});



