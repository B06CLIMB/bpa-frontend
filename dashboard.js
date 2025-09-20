document.addEventListener('DOMContentLoaded', () => {
    const userName = localStorage.getItem('userName');
    const userAge = localStorage.getItem('userAge');

    if (!userName) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('userInfo').textContent = `Name: ${userName}, Age: ${userAge}`;

    const backendURL = "https://bpa-backend-1.onrender.com";
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('image-preview');
    const predictionCard = document.getElementById('prediction-card');
    const predictionResultDiv = document.getElementById('prediction-result');
    const breedNameEl = document.getElementById('breed-name');
    const confidenceEl = document.getElementById('confidence-value');
    const logoutBtn = document.getElementById('logoutBtn');

    imageInput.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = e => {
            imagePreview.src = e.target.result;
            imagePreview.classList.remove('hidden');

            predictionCard.style.display = 'block';
            predictionResultDiv.classList.add('hidden');

            const formData = new FormData();
            formData.append('file', file);

            fetch(`${backendURL}/predict`, { method: 'POST', body: formData })
                .then(res => res.json())
                .then(result => {
                    breedNameEl.textContent = result.breed;
                    // Backend already returns percentage
                    confidenceEl.textContent = result.confidence.toFixed(2) + '%';
                    predictionResultDiv.classList.remove('hidden');
                })
                .catch(err => {
                    console.error('Prediction error:', err);
                    alert('Prediction failed. Try again.');
                });
        };
        reader.readAsDataURL(file);
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });
});
