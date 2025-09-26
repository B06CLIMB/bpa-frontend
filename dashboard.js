const backendURL = "https://bpa-backend-j1z3.onrender.com";

document.addEventListener('DOMContentLoaded', () => {
    // Check for login and redirect if not logged in
    setTimeout(() => {
        if (localStorage.getItem('isLoggedIn') !== 'true') {
            window.location.href = 'index.html';
        }
    }, 100);

    const navBtns = document.querySelectorAll('.nav-btn');
    const contentSections = document.querySelectorAll('.content-section');
    const imageUpload = document.getElementById('image-upload');
    const predictionCard = document.getElementById('prediction-card');
    const loadingSpinner = predictionCard.querySelector('.loading-spinner');
    const predictionResultDiv = document.getElementById('prediction-result');
    const uploadedImagePreview = document.getElementById('uploaded-image-preview');
    const imageGallery = document.getElementById('image-gallery');
    const breedCountsTableBody = document.querySelector('#breed-counts tbody');
    const logoutBtn = document.getElementById('logout-btn');

    let collectedPhotos = JSON.parse(localStorage.getItem('collectedPhotos')) || [];
    let breedStatistics = JSON.parse(localStorage.getItem('breedStats')) || {};

    function showSection(target) {
        contentSections.forEach(section => {
            section.classList.add('hidden');
        });
        document.getElementById(target).classList.remove('hidden');
    }

    function updateStatsTable() {
        breedCountsTableBody.innerHTML = '';
        for (const breed in breedStatistics) {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${breed}</td><td>${breedStatistics[breed]}</td>`;
            breedCountsTableBody.appendChild(row);
        }
    }

    function updateGallery() {
        imageGallery.innerHTML = '';
        if (collectedPhotos.length === 0) {
            imageGallery.innerHTML = '<p>No photos collected yet.</p>';
            return;
        }
        collectedPhotos.forEach(dataUrl => {
            const img = document.createElement('img');
            img.src = dataUrl;
            img.classList.add('gallery-item');
            imageGallery.appendChild(img);
        });
    }

    // Initial load
    showSection('photo-gallery');
    updateStatsTable();
    updateGallery();

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const target = btn.getAttribute('data-target');
            showSection(target);
            // Refresh content if needed
            if (target === 'stats-section') updateStatsTable();
            if (target === 'photo-gallery') updateGallery();
        });
    });

    imageUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        predictionCard.classList.remove('hidden');
        loadingSpinner.classList.remove('hidden');
        predictionResultDiv.classList.add('hidden');

        const reader = new FileReader();
        reader.onload = async (e) => {
            uploadedImagePreview.src = e.target.result;
            // The image is saved to gallery after a successful prediction
        };
        reader.readAsDataURL(file);

        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch(`${backendURL}/predict`, { method: 'POST', body: formData });
            if (!res.ok) throw new Error('Network response was not ok.');
            const result = await res.json();

            // Update local storage and stats
            const breed = result.breed;
            breedStatistics[breed] = (breedStatistics[breed] || 0) + 1;
            localStorage.setItem('breedStats', JSON.stringify(breedStatistics));
            
            collectedPhotos.push(uploadedImagePreview.src);
            localStorage.setItem('collectedPhotos', JSON.stringify(collectedPhotos));

            // Display result
            document.getElementById('breed-name').textContent = result.breed;
            document.getElementById('accuracy-score').textContent = result.accuracy;
            document.getElementById('breed-color').textContent = result.color || 'N/A';
            document.getElementById('breed-texture').textContent = result.texture || 'N/A';
            document.getElementById('breed-gender').textContent = result.gender || 'N/A';
            document.getElementById('milk-production').textContent = result.milk_production || 'N/A';
            document.getElementById('common-areas').textContent = result.common_areas || 'N/A';

        } catch (err) {
            console.error(err);
            document.getElementById('breed-name').textContent = 'Error';
            document.getElementById('accuracy-score').textContent = 'N/A';
        } finally {
            loadingSpinner.classList.add('hidden');
            predictionResultDiv.classList.remove('hidden');
        }
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });
});
