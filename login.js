document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    // 🔹 Use deployed backend instead of localhost
const backendURL = "https://bpa-backend-1.onrender.com";

    if (!loginForm) return;

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const age = document.getElementById('age').value.trim();
        const password = document.getElementById('password').value;

        if (!name || !age || !password) return alert('Please fill in all fields.');

        // Clear old local storage
        localStorage.clear();

        fetch(`${backendURL}/login`, {
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
            console.error('Error connecting to backend:', error);
            alert('Could not connect to the server. Please try again later.');
        });
    });
});

