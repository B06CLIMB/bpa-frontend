document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const age = document.getElementById('age').value;
            const password = document.getElementById('password').value;

            localStorage.clear();

            const backendURL = "https://bpa-backend-1.onrender.com";

            fetch(`${backendURL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, age, password })
            })
            .then(res => res.json())
            .then(data => {
                if (data.message.includes('Login successful') || data.message.includes('New user registered')) {
                    localStorage.setItem('userName', name);
                    localStorage.setItem('userAge', age);
                    window.location.href = 'dashboard.html';
                } else {
                    alert(data.message || 'Invalid login');
                }
            })
            .catch(err => {
                console.error(err);
                alert('Could not connect to the server. Wait a minute if the backend is cold.');
            });
        });
    }
});


