document.addEventListener('DOMContentLoaded', () => {
    const userName = localStorage.getItem('userName');
    const userAge = localStorage.getItem('userAge');
    
    // Redirect to login if no username is found in local storage
    if (!userName) {
        window.location.href = 'index.html';
        return;
    }

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
    const navItems = document.querySelectorAll('.nav-item');
    const logoutBtn = document.querySelector('.logout-btn');
    const collectedPhotosGrid = document.getElementById('collected-photos-grid');
    const breedCountsTable = document.getElementById('breed-counts');

    // These variables will store the data fetched from the backend
    let collectedData = [];
    let breedStatistics = {};
    
    // This function fetches data from the backend when the page loads
    fetch(`http://127.0.0.1:5000/data?name=${userName}`)
    .then(response => response.json())
    .then(data => {
        // The backend now sends the whole user object
        collectedData = data.data;
        // Recalculate stats from the fetched data
        collectedData.forEach(record => {
            breedStatistics[record.breed] = (breedStatistics[record.breed] || 0) + 1;
        });
        loadCollectedData();
        updateStats();
    })
    .catch(error => console.error('Error fetching data:', error));

    // This function updates the user's name and age in the sidebar
    updateUserInfo();

    function updateUserInfo() {
        document.getElementById('userName').textContent = userName;
        document.getElementById('userAge').textContent = `Age: ${userAge}`;
    }

    // --- Image Upload and Enhancement ---
    if (uploadFileLabel) {
        uploadFileLabel.addEventListener('click', () => { imageInput.removeAttribute('capture'); });
    }

    if (capturePhotoLabel) {
        capturePhotoLabel.addEventListener('click', () => { imageInput.setAttribute('capture', 'camera'); });
    }

    if (imageInput) {
        imageInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.src = e.target.result;
                    imagePreview.classList.remove('hidden');
                    if (enhanceControls) enhanceControls.classList.add('hidden');
                    imagePreview.style.filter = 'brightness(100%) contrast(100%)';
                    if (brightnessControl) brightnessControl.value = 100;
                    if (contrastControl) contrastControl.value = 100;
                    showPrediction(file);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (enhanceBtn) {
        enhanceBtn.addEventListener('click', () => {
            if (!imagePreview.src || imagePreview.src === '#') {
                alert('Please take or upload a photo first.');
                return;
            }
            if (enhanceControls) enhanceControls.classList.toggle('hidden');
        });
    }

    if (brightnessControl) {
        brightnessControl.addEventListener('input', () => {
            imagePreview.style.filter = `brightness(${brightnessControl.value}%) contrast(${contrastControl.value}%)`;
        });
    }

    if (contrastControl) {
        contrastControl.addEventListener('input', () => {
            imagePreview.style.filter = `brightness(${brightnessControl.value}%) contrast(${contrastControl.value}%)`;
        });
    }

    // --- AI Prediction and Data Saving ---
    function showPrediction(file) {
        if (predictionCard) {
            predictionCard.style.display = 'block';
            if (loadingSpinner) loadingSpinner.classList.remove('hidden');
            if (predictionResultDiv) predictionResultDiv.classList.add('hidden');
            
            // This is the simulated AI response
            setTimeout(() => {
                if (loadingSpinner) loadingSpinner.classList.add('hidden');
                if (predictionResultDiv) predictionResultDiv.classList.remove('hidden');
                const breeds = ['Sahiwal', 'Gir', 'Murrah', 'Jaffarabadi'];
                const randomBreed = breeds[Math.floor(Math.random() * breeds.length)];
                const randomConfidence = (Math.random() * 20 + 80).toFixed(2);
                if (breedNameElement) breedNameElement.textContent = randomBreed;
                if (confidenceValueElement) confidenceValueElement.textContent = randomConfidence;
                if (confirmBtn) {
                    confirmBtn.onclick = () => {
                        saveData(file, randomBreed);
                        alert(`Successfully registered a ${randomBreed}.`);
                        predictionCard.style.display = 'none';
                    };
                }
            }, 2000);
        }
    }
    
    // This function saves data to the backend
    function saveData(file, breed) {
        const newRecord = {
            image: URL.createObjectURL(file),
            breed: breed,
            date: new Date().toLocaleDateString()
        };
        
        fetch('http://127.0.0.1:5000/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: userName, record: newRecord })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Backend response:', data.message);
            collectedData.push(newRecord);
            breedStatistics[breed] = (breedStatistics[breed] || 0) + 1;
            loadCollectedData();
            updateStats();
        })
        .catch(error => console.error('Error saving data:', error));
    }

    // --- Sidebar Navigation and Data Display ---
    function loadCollectedData() {
        if (collectedPhotosGrid) {
            collectedPhotosGrid.innerHTML = '';
            if (collectedData.length === 0) {
                collectedPhotosGrid.innerHTML = '<p style="text-align:center;">No photos have been collected yet.</p>';
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
    }

    function updateStats() {
        if (breedCountsTable) {
            let tableHTML = `
                <h3>Total Breeds Identified</h3>
                <table>
                    <thead>
                        <tr><th>Breed</th><th>Count</th></tr>
                    </thead>
                    <tbody>
            `;
            for (const breed in breedStatistics) {
                tableHTML += `<tr><td>${breed}</td><td>${breedStatistics[breed]}</td></tr>`;
            }
            tableHTML += '</tbody></table>';
            breedCountsTable.innerHTML = tableHTML;
        }
    }

    // Handles showing/hiding different sections based on nav clicks
    if (navItems) {
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                const target = item.getAttribute('data-target');
                document.querySelectorAll('.content-section').forEach(section => {
                    if (section.id === target) {
                        section.classList.remove('hidden');
                    } else {
                        section.classList.add('hidden');
                    }
                });
            });
        });
    }

    // Handles the logout functionality
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }
});