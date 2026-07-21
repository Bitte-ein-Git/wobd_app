/* Global variables to store data */
let obdData = [];
let manufacturers = [];

/* Base URL for images */
const imageBaseUrl = 'https://www.obd-facile.fr/en/base_connecteur/';

/* DOM elements */
const manufacturerSelect = document.getElementById('manufacturer');
const modelSelect = document.getElementById('model');
const searchInput = document.getElementById('search');
const resultsContainer = document.getElementById('results');

/* Fetch JSON data on load */
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        /* Process JSON payload */
        if (data && data.result) {
            obdData = data.result;
            populateManufacturers();
        }
    })
    .catch(error => console.error('Error loading data:', error));

/* Populate manufacturer dropdown */
function populateManufacturers() {
    /* Extract unique manufacturers */
    const mfgSet = new Set(obdData.map(item => item.b));
    manufacturers = Array.from(mfgSet).sort();

    /* Build options */
    manufacturerSelect.innerHTML = '<option value="">Bitte wählen...</option>';
    manufacturers.forEach(mfg => {
        const option = document.createElement('option');
        option.value = mfg;
        option.textContent = mfg;
        manufacturerSelect.appendChild(option);
    });

    /* Enable select element */
    manufacturerSelect.disabled = false;
}

/* Handle manufacturer change */
manufacturerSelect.addEventListener('change', (e) => {
    const selectedMfg = e.target.value;
    if (selectedMfg) {
        populateModels(selectedMfg);
        searchInput.disabled = false;
    } else {
        modelSelect.innerHTML = '<option value="">Bitte zuerst Hersteller wählen</option>';
        modelSelect.disabled = true;
        searchInput.disabled = true;
        resultsContainer.innerHTML = '';
    }
});

/* Populate models for selected manufacturer */
function populateModels(manufacturer) {
    /* Filter data by manufacturer */
    const models = obdData.filter(item => item.b === manufacturer).sort((a, b) => a.c.localeCompare(b.c));
    
    /* Build options */
    modelSelect.innerHTML = '<option value="">Modell wählen...</option>';
    models.forEach(item => {
        const option = document.createElement('option');
        option.value = item.c;
        option.textContent = item.c;
        modelSelect.appendChild(option);
    });

    /* Enable elements */
    modelSelect.disabled = false;
    searchInput.value = '';
    resultsContainer.innerHTML = '';
}

/* Handle model selection */
modelSelect.addEventListener('change', (e) => {
    const selectedMfg = manufacturerSelect.value;
    const selectedModel = e.target.value;
    if (selectedMfg && selectedModel) {
        displayResult(selectedMfg, selectedModel);
    } else {
        resultsContainer.innerHTML = '';
    }
});

/* Handle search input filtering */
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const selectedMfg = manufacturerSelect.value;
    if (!selectedMfg) return;

    /* Filter models based on search term */
    const models = obdData.filter(item => item.b === selectedMfg && item.c.toLowerCase().includes(searchTerm));
    
    /* Update model options */
    modelSelect.innerHTML = '<option value="">Modell wählen...</option>';
    models.forEach(item => {
        const option = document.createElement('option');
        option.value = item.c;
        option.textContent = item.c;
        modelSelect.appendChild(option);
    });
});

/* Render the result card */
function displayResult(manufacturer, modelName) {
    /* Find specific vehicle data */
    const vehicle = obdData.find(item => item.b === manufacturer && item.c === modelName);
    if (!vehicle) return;

    /* Build HTML string */
    let html = '<div class="result-card">';
    html += `<h3>${vehicle.b} ${vehicle.c}</h3>`;

    /* Add instructions and images if available */
    if (vehicle.j && vehicle.n) {
        html += `<div class="image-container">
                    <p>${vehicle.j}</p>
                    <img src="${imageBaseUrl}${vehicle.n}" alt="${vehicle.f || 'Bild 1'}" loading="lazy">
                 </div>`;
    }
    if (vehicle.k && vehicle.o) {
        html += `<div class="image-container">
                    <p>${vehicle.k}</p>
                    <img src="${imageBaseUrl}${vehicle.o}" alt="${vehicle.g || 'Bild 2'}" loading="lazy">
                 </div>`;
    }
    if (vehicle.l && vehicle.p) {
        html += `<div class="image-container">
                    <p>${vehicle.l}</p>
                    <img src="${imageBaseUrl}${vehicle.p}" alt="${vehicle.h || 'Bild 3'}" loading="lazy">
                 </div>`;
    }

    html += '</div>';
    resultsContainer.innerHTML = html;
}