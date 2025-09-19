document.addEventListener('DOMContentLoaded', () => {
    // ----------------- USER INFO -----------------
    const userName = localStorage.getItem('userName');
    const userAge = localStorage.getItem('userAge');

    if (!userName) {
        window.location.href = 'index.html';
        return;
    }

    // Update dashboard with user info
    const userNameEl = document.getElementById('userName');
    const userAgeEl = document.getElementById('userAge');
    if (userNameEl) userNameEl.textContent = `Name: ${userName}`;
    if (userAgeEl) userAgeEl.textContent = `Age: ${userAge}`;

    // ----------------- CONFIG -----------------
    const backendURL = "https://bpa-backend-1.onrender.com";

    // DOM elements
    const uploadFileLabel = document.getElementById('uploadFileLabel');
    const capturePhotoLabel = document.getElementById('capturePhotoLabel');
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
    const collectedPhotosGrid = document.getElementById('collected-photos-grid');
    const breedCountsTable = document.getElementById('breed-counts');
    const logoutBtn = document.querySelector('.logout-btn');
    const navItems = document.querySelectorAll('.nav-item');

    let collectedData = [];
    let breedStatistics = {};

    // ----------------- FETCH USER DATA -----------------
    fetch(`${backendURL}/data?name=${userName}`)
        .then(res => res.json())
        .then(data => {
            collectedData = data.data || [];
            collectedData.forEach(r => {
                breedStatistics[r.breed] = (breedStatistics[r.breed] || 0) + 1;
            });
            loadCollectedData();
            updateStats();
        })
        .catch(err => console.error('Error fetching data:', err));

    // ----------------- IMAGE UPLOAD & CAPTURE -----------------
    if (uploadFileLabel) uploadFileLabel.addEventListener('click', () => imageInput.removeAttribute('capture'));
    if (capturePhotoLabel) capturePhotoLabel.addEventListener('click', () => imageInput.setAttribute('capture', 'camera'));

    if (imageInput) {
        imageInput.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = e => {
                imagePreview.src = e.target.result;
                imagePreview.classList.remove('hidden');
                if (enhanceControls) enhanceControls.classList.add('hidden');
                imagePreview.style.filter = 'brightness(100%) contrast(100%)';
                brightnessControl.value = 100;
                contrastControl.value = 100;
                showPrediction(file);
            };
            reader.readAsDataURL(file);
        });
    }

    if (enhanceBtn) enhanceBtn.addEventListener('click', () => {
        if (!imagePreview.src) return alert('Upload or capture a photo first.');
        if (enhanceControls) enhanceControls.classList.toggle('hidden');
    });

    if (brightnessControl && contrastControl) {
        const applyFilter = () => {
            imagePreview.style.filter = `brightness(${brightnessControl.value}%) contrast(${contrastControl.value}%)`;
        };
        brightnessControl.addEventListener('input', applyFilter);
        contrastControl.addEventListener('input', applyFilter);
    }

    // ----------------- AI PREDICTION -----------------
    function showPrediction(file) {
        if (!predictionCard) return;
        predictionCard.style.display = 'block';
        if (loadingSpinner) loadingSpinner.classList.remove('hidden');
        if (predictionResultDiv) predictionResultDiv.classList.add('hidden');

        const formData = new FormData();
        formData.append('file', file);

        fetch(`${backendURL}/predict`, { method: 'POST', body: formData })
            .then(res => res.json())
            .then(result => {
                if (loadingSpinner) loadingSpinner.classList.add('hidden');
                if (predictionResultDiv) predictionResultDiv.classList.remove('hidden');

                breedNameElement.textContent = result.breed;
                confidenceValueElement.textContent = result.confidence.toFixed(2);

                confirmBtn.onclick = () => {
                    saveData(file, result.breed);
                    alert(`Successfully registered a ${result.breed}.`);
                    predictionCard.style.display = 'none';
                };
            })
            .catch(err => {
                console.error('Prediction error:', err);
                if (loadingSpinner) loadingSpinner.classList.add('hidden');
                alert('Prediction failed. Try again.');
            });
    }

    // ----------------- SAVE DATA -----------------
    function saveData(file, breed) {
        const newRecord = {
            image: URL.createObjectURL(file),
            breed: breed,
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

    // ----------------- LOAD COLLECTED DATA -----------------
    function loadCollectedData() {
        if (!collectedPhotosGrid) return;
        collectedPhotosGrid.innerHTML = '';
        if (collectedData.length === 0) {
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

    // ----------------- UPDATE STATS -----------------
    function updateStats() {
        if (!breedCountsTable) return;
        let html = `<h3>Total Breeds Identified</h3><table><thead><tr><th>Breed</th><th>Count</th></tr></thead><tbody>`;
        for (const breed in breedStatistics) {
            html += `<tr><td>${breed}</td><td>${breedStatistics[breed]}</td></tr>`;
        }
        html += '</tbody></table>';
        breedCountsTable.innerHTML = html;
    }

    // ----------------- NAVIGATION -----------------
    if (navItems) {
        navItems.forEach(item => {
            item.addEventListener('click', e => {
                e.preventDefault();
                navItems.forEach(n => n.classList.remove('active'));
                item.classList.add('active');
                const target = item.dataset.target;
                document.querySelectorAll('.content-section').forEach(section => {
                    section.classList.toggle('hidden', section.id !== target);
                });
            });
        });
    }

    // ----------------- LOGOUT -----------------
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }
});



