document.addEventListener('DOMContentLoaded', () => {
    // ---------------- User Info ----------------
    const userName = localStorage.getItem('userName');
    const userAge = localStorage.getItem('userAge');
    const backendURL = "https://bpa-backend-j4ck.onrender.com";

    if (!userName) {
        window.location.href = 'index.html';
        return;
    }

    // DOM Elements
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
    const uploadFileLabel = document.getElementById('uploadFileLabel');
    const capturePhotoLabel = document.getElementById('capturePhotoLabel');

    // Data
    let collectedData = [];
    let breedStatistics = {};

    // ---------------- User Sidebar ----------------
    document.getElementById('userName').textContent = userName;
    document.getElementById('userAge').textContent = `Age: ${userAge}`;

    // ---------------- Fetch User Data ----------------
    fetch(`${backendURL}/data?name=${userName}`)
        .then(res => res.json())
        .then(data => {
            collectedData = data.data || [];
            collectedData.forEach(record => {
                breedStatistics[record.breed] = (breedStatistics[record.breed] || 0) + 1;
            });
            loadCollectedData();
            updateStats();
        })
        .catch(err => console.error('Error fetching data:', err));

    // ---------------- Image Upload & Capture ----------------
    if (uploadFileLabel) uploadFileLabel.addEventListener('click', () => imageInput.removeAttribute('capture'));
    if (capturePhotoLabel) capturePhotoLabel.addEventListener('click', () => imageInput.setAttribute('capture', 'camera'));

    if (imageInput) {
        imageInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file || !file.type.startsWith('image/')) {
                alert('Please select a valid image.');
                return;
            }
            const reader = new FileReader();
            reader.onload = e => {
                imagePreview.src = e.target.result;
                imagePreview.classList.remove('hidden');
                if (enhanceControls) enhanceControls.classList.add('hidden');
                imagePreview.style.filter = 'brightness(100%) contrast(100%)';
                if (brightnessControl) brightnessControl.value = 100;
                if (contrastControl) contrastControl.value = 100;
                showPrediction(file);
            };
            reader.readAsDataURL(file);
        });
    }

    // ---------------- Image Enhancement ----------------
    if (enhanceBtn) enhanceBtn.addEventListener('click', () => {
        if (!imagePreview.src || imagePreview.src === '#') return alert('Upload a photo first.');
        if (enhanceControls) enhanceControls.classList.toggle('hidden');
    });

    if (brightnessControl) brightnessControl.addEventListener('input', () => {
        imagePreview.style.filter = `brightness(${brightnessControl.value}%) contrast(${contrastControl.value}%)`;
    });
    if (contrastControl) contrastControl.addEventListener('input', () => {
        imagePreview.style.filter = `brightness(${brightnessControl.value}%) contrast(${contrastControl.value}%)`;
    });

    // ---------------- AI Prediction ----------------
    function showPrediction(file) {
        if (!file) return;
        if (predictionCard) predictionCard.style.display = 'block';
        if (loadingSpinner) loadingSpinner.classList.remove('hidden');
        if (predictionResultDiv) predictionResultDiv.classList.add('hidden');

        const formData = new FormData();
        formData.append('file', file);

        fetch(`${backendURL}/predict`, {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (loadingSpinner) loadingSpinner.classList.add('hidden');
            if (predictionResultDiv) predictionResultDiv.classList.remove('hidden');

            if (data.error) {
                alert(data.error);
                predictionCard.style.display = 'none';
                return;
            }

            if (breedNameElement) breedNameElement.textContent = data.breed;
            if (confidenceValueElement) confidenceValueElement.textContent = data.confidence.toFixed(2);

            if (confirmBtn) {
                confirmBtn.onclick = () => {
                    saveData(file, data.breed);
                    alert(`Successfully registered a ${data.breed}.`);
                    predictionCard.style.display = 'none';
                };
            }
        })
        .catch(err => {
            console.error(err);
            alert('Error predicting breed. Please try again.');
            if (predictionCard) predictionCard.style.display = 'none';
        });
    }

    // ---------------- Save Data ----------------
    function saveData(file, breed) {
        const reader = new FileReader();
        reader.onload = e => {
            const newRecord = {
                image: e.target.result,  // Base64 for persistence
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
                console.log('Backend response:', data.message);
                collectedData.push(newRecord);
                breedStatistics[breed] = (breedStatistics[breed] || 0) + 1;
                loadCollectedData();
                updateStats();
            })
            .catch(err => console.error('Error saving data:', err));
        };
        reader.readAsDataURL(file);
    }

    // ---------------- Load Gallery ----------------
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
                <p style="font-size:0.8rem;color:#888;">${item.date}</p>
            `;
            collectedPhotosGrid.appendChild(card);
        });
    }

    // ---------------- Update Stats ----------------
    function updateStats() {
        if (!breedCountsTable) return;
        let html = `<h3>Total Breeds Identified</h3><table>
                        <thead><tr><th>Breed</th><th>Count</th></tr></thead><tbody>`;
        for (const breed in breedStatistics) {
            html += `<tr><td>${breed}</td><td>${breedStatistics[breed]}</td></tr>`;
        }
        html += '</tbody></table>';
        breedCountsTable.innerHTML = html;
    }

    // ---------------- Navigation ----------------
    if (navItems) {
        navItems.forEach(item => {
            item.addEventListener('click', e => {
                e.preventDefault();
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                const target = item.getAttribute('data-target');
                document.querySelectorAll('.content-section').forEach(sec => {
                    sec.classList.toggle('hidden', sec.id !== target);
                });
            });
        });
    }

    // ---------------- Logout ----------------
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }
});

