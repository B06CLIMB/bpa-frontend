document.addEventListener('DOMContentLoaded', () => {
    const userName = localStorage.getItem('userName');
    const userAge = localStorage.getItem('userAge');
    const backendURL = "https://bpa-backend-j4ck.onrender.com";

    if (!userName) {
        window.location.href = 'index.html';
        return;
    }

    // Sidebar user info
    document.getElementById('userName').textContent = userName;
    document.getElementById('userAge').textContent = `Age: ${userAge}`;

    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('image-preview');
    const enhanceBtn = document.querySelector('.enhance-btn');
    const enhanceControls = document.getElementById('image-enhancement-controls');
    const brightnessControl = document.getElementById('brightness');
    const contrastControl = document.getElementById('contrast');
    const predictionCard = document.getElementById('prediction-card');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const predictionResultDiv = document.getElementById('prediction-result');
    const breedNameElement = document.getElementById('breed-name');
    const confidenceValueElement = document.getElementById('confidence-value');
    const confirmBtn = document.querySelector('.confirm-btn');
    const logoutBtn = document.querySelector('.logout-btn');
    const collectedPhotosGrid = document.getElementById('collected-photos-grid');
    const breedCountsTable = document.getElementById('breed-counts');

    let collectedData = [];
    let breedStatistics = {};

    // Fetch existing user data
    fetch(`${backendURL}/data?name=${userName}`)
    .then(res => res.json())
    .then(data => {
        collectedData = data.data || [];
        collectedData.forEach(r => breedStatistics[r.breed] = (breedStatistics[r.breed] || 0) + 1);
        loadCollectedData();
        updateStats();
    })
    .catch(err => console.error('Error fetching data:', err));

    // Image preview and AI prediction
    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (ev) => {
                imagePreview.src = ev.target.result;
                imagePreview.classList.remove('hidden');
                if (enhanceControls) enhanceControls.classList.add('hidden');
                imagePreview.style.filter = 'brightness(100%) contrast(100%)';
                if (brightnessControl) brightnessControl.value = 100;
                if (contrastControl) contrastControl.value = 100;

                predictBreed(file); // Call backend AI
            };
            reader.readAsDataURL(file);
        });
    }

    // Image enhancement
    if (enhanceBtn) enhanceBtn.addEventListener('click', () => {
        if (!imagePreview.src || imagePreview.src === '#') return alert('Upload a photo first.');
        if (enhanceControls) enhanceControls.classList.toggle('hidden');
    });

    [brightnessControl, contrastControl].forEach(control => {
        if (!control) return;
        control.addEventListener('input', () => {
            imagePreview.style.filter = `brightness(${brightnessControl.value}%) contrast(${contrastControl.value}%)`;
        });
    });

    // Predict breed using backend AI
    function predictBreed(file) {
        if (!predictionCard) return;

        predictionCard.style.display = 'block';
        loadingSpinner.classList.remove('hidden');
        predictionResultDiv.classList.add('hidden');

        const formData = new FormData();
        formData.append('file', file);

        fetch(`${backendURL}/predict`, { method: 'POST', body: formData })
        .then(res => res.json())
        .then(data => {
            loadingSpinner.classList.add('hidden');
            predictionResultDiv.classList.remove('hidden');

            breedNameElement.textContent = data.breed;
            confidenceValueElement.textContent = data.confidence.toFixed(2);

            if (confirmBtn) {
                confirmBtn.onclick = () => {
                    saveData(file, data.breed);
                    alert(`Successfully registered a ${data.breed}.`);
                    predictionCard.style.display = 'none';
                };
            }
        })
        .catch(err => {
            loadingSpinner.classList.add('hidden');
            console.error('Prediction error:', err);
            alert('Failed to predict breed. Try again.');
        });
    }

    // Save data to backend
    function saveData(file, breed) {
        const newRecord = {
            image: URL.createObjectURL(file),
            breed,
            date: new Date().toLocaleDateString()
        };

        fetch(`${backendURL}/data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: userName, record: newRecord })
        })
        .then(res => res.json())
        .then(data => {
            collectedData.push(newRecord);
            breedStatistics[breed] = (breedStatistics[breed] || 0) + 1;
            loadCollectedData();
            updateStats();
        })
        .catch(err => console.error('Error saving data:', err));
    }

    // Load collected photos
    function loadCollectedData() {
        if (!collectedPhotosGrid) return;
        collectedPhotosGrid.innerHTML = '';
        if (!collectedData.length) {
            collectedPhotosGrid.innerHTML = '<p style="text-align:center;">No photos collected yet.</p>';
            return;
        }

        collectedData.forEach(item => {
            const card = document.createElement('div');
            card.className = 'collected-photo-card';
            card.innerHTML = `
                <img src="${item.image}" alt="${item.breed}">
                <p>${item.breed}</p>
                <p style="font-size:0.8rem; color:#888;">${item.date}</p>
            `;
            collectedPhotosGrid.appendChild(card);
        });
    }

    // Update breed stats table
    function updateStats() {
        if (!breedCountsTable) return;

        let tableHTML = `
            <h3>Total Breeds Identified</h3>
            <table>
                <thead><tr><th>Breed</th><th>Count</th></tr></thead>
                <tbody>
        `;
        for (const breed in breedStatistics) {
            tableHTML += `<tr><td>${breed}</td><td>${breedStatistics[breed]}</td></tr>`;
        }
        tableHTML += '</tbody></table>';
        breedCountsTable.innerHTML = tableHTML;
    }

    // Logout
    if (logoutBtn) logoutBtn.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });
});


