document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async e => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const age = document.getElementById('age').value.trim();
        const password = document.getElementById('password').value;

        if (!name || !age || !password) {
            alert('All fields are required!');
            return;
        }

        const backendURL = "https://bpa-backend-1.onrender.com";

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
                window.location.href = 'dashboard.html';
            } else {
                alert(data.message || 'Invalid credentials.');
            }
        } catch (err) {
            console.error(err);
            alert('Could not connect to server. Try again in a few seconds.');
        }
    });
});





