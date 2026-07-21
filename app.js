let obdData = [];
let manufacturersData = [];
let uniqueManufacturers = [];

/* Image base URLs */
const imageBaseUrl = 'https://www.obd-facile.fr/en/base_connecteur/';
const logoBaseUrl = 'https://www.klavkarr.de/vehicle/logo/';

/* DOM elements */
const searchInput = document.getElementById('search');
const manufacturerGrid = document.getElementById('manufacturer-grid');
const modelListContainer = document.getElementById('model-list-container');
const searchResultsContainer = document.getElementById('search-results-container');
const selectedManufacturerTitle = document.getElementById('selected-manufacturer-title');
const modelList = document.getElementById('model-list');
const searchList = document.getElementById('search-list');
const resultsContainer = document.getElementById('results');
const backBtn = document.getElementById('back-btn');

/* Fetch OBD data AND manufacturers image data on load */
Promise.all([
    fetch('data.json').then(res => res.json()).catch(() => null),
    fetch('manufacturers.json').then(res => res.json()).catch(() => null)
]).then(([dataRes, mfgRes]) => {
    if (dataRes && dataRes.result) {
        obdData = dataRes.result;
    }
    if (mfgRes) {
        manufacturersData = mfgRes;
    }
    initApp();
});

function initApp() {
    /* Extract unique manufacturers */
    const mfgSet = new Set(obdData.map(item => item.b));
    uniqueManufacturers = Array.from(mfgSet).sort();
    
    populateManufacturersGrid();
    searchInput.disabled = false;
}

/* Render 3-column grid sorted alphabetically */
function populateManufacturersGrid() {
    manufacturerGrid.innerHTML = '';
    
    uniqueManufacturers.forEach(mfgName => {
        // Try to match the manufacturer name with the logo JSON
        const mfgInfo = manufacturersData.find(m => m.name.toLowerCase() === mfgName.toLowerCase());
        const logoFile = (mfgInfo && mfgInfo.logo) ? mfgInfo.logo : '';
        
        const card = document.createElement('div');
        card.className = 'manufacturer-card';
        card.onclick = () => selectManufacturer(mfgName);
        
        let imgHtml = '';
        if (logoFile) {
            imgHtml = `<img src="${logoBaseUrl}${logoFile}" alt="${mfgName} Logo" loading="lazy">`;
        }
        
        card.innerHTML = `
            ${imgHtml}
            <span>${mfgName}</span>
        `;
        
        manufacturerGrid.appendChild(card);
    });
}

/* Action when manufacturer card is clicked */
function selectManufacturer(mfgName) {
    searchInput.value = '';
    manufacturerGrid.classList.add('hidden');
    searchResultsContainer.classList.add('hidden');
    resultsContainer.innerHTML = '';
    
    selectedManufacturerTitle.textContent = `${mfgName} Modelle`;
    modelListContainer.classList.remove('hidden');
    backBtn.classList.remove('hidden');
    
    populateModels(mfgName);
}

/* Render the list of models */
function populateModels(manufacturer) {
    const models = obdData.filter(item => item.b === manufacturer).sort((a, b) => a.c.localeCompare(b.c));
    
    modelList.innerHTML = '';
    models.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.c;
        li.onclick = () => displayResult(item);
        modelList.appendChild(li);
    });
}

/* Handles Back button */
backBtn.addEventListener('click', () => {
    modelListContainer.classList.add('hidden');
    searchResultsContainer.classList.add('hidden');
    resultsContainer.innerHTML = '';
    backBtn.classList.add('hidden');
    manufacturerGrid.classList.remove('hidden');
    searchInput.value = '';
});

/* Instant model search */
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    resultsContainer.innerHTML = '';
    
    if (searchTerm === '') {
        // Clear search restores the manufacturer grid
        searchResultsContainer.classList.add('hidden');
        modelListContainer.classList.add('hidden');
        backBtn.classList.add('hidden');
        manufacturerGrid.classList.remove('hidden');
        return;
    }
    
    manufacturerGrid.classList.add('hidden');
    modelListContainer.classList.add('hidden');
    backBtn.classList.remove('hidden');
    searchResultsContainer.classList.remove('hidden');
    
    // Globally search in manufacturers and models
    const matchingModels = obdData.filter(item => {
        const fullName = `${item.b} ${item.c}`.toLowerCase();
        return fullName.includes(searchTerm);
    }).sort((a, b) => a.b.localeCompare(b.b) || a.c.localeCompare(b.c));
    
    searchList.innerHTML = '';
    if (matchingModels.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'Keine Modelle gefunden.';
        searchList.appendChild(li);
    } else {
        matchingModels.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.b} ${item.c}`;
            li.onclick = () => displayResult(item);
            searchList.appendChild(li);
        });
    }
});

/* Render the result info */
function displayResult(vehicle) {
    modelListContainer.classList.add('hidden');
    searchResultsContainer.classList.add('hidden');
    
    let html = '<div class="result-card">';
    html += `<h3>${vehicle.b} ${vehicle.c}</h3>`;
    
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
