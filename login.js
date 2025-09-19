document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const age = document.getElementById('age').value;
            const password = document.getElementById('password').value;

            // Crucial step: Clear all old data before a new login
            localStorage.clear();

            fetch('http://127.0.0.1:5000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, age, password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.message.includes('Login successful') || data.message.includes('New user registered')) {
                    localStorage.setItem('userName', name);
                    localStorage.setItem('userAge', age);
                    window.location.href = 'dashboard.html';
                } else {
                    alert('Invalid name or password.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Could not connect to the server. Please ensure the backend is running.');
            });
        });
    }
});