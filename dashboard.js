document.addEventListener('DOMContentLoaded', () => {
    // Get user info from localStorage
    const userName = localStorage.getItem('userName');
    const userAge = localStorage.getItem('userAge');

    if (!userName) {
        // Redirect to login if not logged in
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('userInfo').textContent = `Name: ${userName}, Age: ${userAge}`;

    // Elements
    const backendURL = "https://bpa-backend-1.onrender.com"; // Deployed backend URL
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('image-preview');
    const predictionCard = document.getElementById('prediction-card');
    const predictionResultDiv = document.getElementById('prediction-result');
    const breedNameEl = document.getElementById('breed-name');
    const confidenceEl = document.getElementById('confidence-value');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const logoutBtn = document.getElementById('logoutBtn');

    // Image upload & prediction
    imageInput.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;

        // Show preview
        const reader = new FileReader();
        reader.onload = e => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';

            predictionCard.style.display = 'block';
            predictionResultDiv.style.display = 'none';
            loadingSpinner.style.display = 'block';

            const formData = new FormData();
            formData.append('file', file);

            fetch(`${backendURL}/predict`, { method: 'POST', body: formData })
                .then(res => res.json())
                .then(result => {
                    loadingSpinner.style.display = 'none';
                    if (result.error) {
                        alert('Prediction failed: ' + result.error);
                        return;
                    }
                    breedNameEl.textContent = result.breed;
                    confidenceEl.textContent = result.confidence.toFixed(2) + '%';
                    predictionResultDiv.style.display = 'block';
                })
                .catch(err => {
                    loadingSpinner.style.display = 'none';
                    console.error('Prediction error:', err);
                    alert('Prediction failed. Try again.');
                });
        };
        reader.readAsDataURL(file);
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });
});
