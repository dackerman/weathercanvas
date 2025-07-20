// Set today's date as default
document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.max = today;
});

// Elements
const locationInput = document.getElementById('location');
const detectLocationBtn = document.getElementById('detect-location');
const dateInput = document.getElementById('date');
const generateBtn = document.getElementById('generate');
const regenerateBtn = document.getElementById('regenerate');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const result = document.getElementById('result');
const weatherImage = document.getElementById('weather-image');
const imageDescription = document.getElementById('image-description');
const locationName = document.getElementById('location-name');

// Current state
let currentImageUrl = null;

// Event listeners
generateBtn.addEventListener('click', () => generateImage(false));
regenerateBtn.addEventListener('click', () => generateImage(true));
detectLocationBtn.addEventListener('click', detectLocation);
locationInput.addEventListener('input', validateZipCode);

// Validate ZIP code input
function validateZipCode() {
    const value = locationInput.value;
    if (value.length === 5 && /^\d{5}$/.test(value)) {
        fetchLocationName(value);
    } else {
        locationName.textContent = '';
    }
}

// Fetch location name for ZIP code
async function fetchLocationName(zipCode) {
    try {
        const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
        if (response.ok) {
            const data = await response.json();
            locationName.textContent = `${data.places[0]['place name']}, ${data.places[0]['state abbreviation']}`;
        } else {
            locationName.textContent = '';
        }
    } catch (err) {
        locationName.textContent = '';
    }
}

// Detect user location
async function detectLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }

    detectLocationBtn.disabled = true;
    detectLocationBtn.textContent = 'Detecting...';

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                // Use reverse geocoding to get ZIP code
                const response = await fetch(
                    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                );
                const data = await response.json();
                
                if (data.postcode) {
                    locationInput.value = data.postcode;
                    locationName.textContent = `${data.city}, ${data.principalSubdivisionCode}`;
                } else {
                    showError('Could not determine ZIP code from your location');
                }
            } catch (err) {
                showError('Failed to get location details');
            } finally {
                detectLocationBtn.disabled = false;
                detectLocationBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <circle cx="12" cy="12" r="3"></circle>
                        <line x1="12" y1="2" x2="12" y2="6"></line>
                        <line x1="12" y1="18" x2="12" y2="22"></line>
                        <line x1="2" y1="12" x2="6" y2="12"></line>
                        <line x1="18" y1="12" x2="22" y2="12"></line>
                    </svg>
                `;
            }
        },
        (err) => {
            showError('Unable to retrieve your location');
            detectLocationBtn.disabled = false;
            detectLocationBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <circle cx="12" cy="12" r="3"></circle>
                    <line x1="12" y1="2" x2="12" y2="6"></line>
                    <line x1="12" y1="18" x2="12" y2="22"></line>
                    <line x1="2" y1="12" x2="6" y2="12"></line>
                    <line x1="18" y1="12" x2="22" y2="12"></line>
                </svg>
            `;
        }
    );
}

// Generate image
async function generateImage(forceRegenerate = false) {
    const zipCode = locationInput.value;
    const date = dateInput.value;

    if (!zipCode || !/^\d{5}$/.test(zipCode)) {
        showError('Please enter a valid 5-digit ZIP code');
        return;
    }

    if (!date) {
        showError('Please select a date');
        return;
    }

    // Hide previous results
    error.style.display = 'none';
    result.style.display = 'none';
    loading.style.display = 'block';

    try {
        const params = new URLSearchParams({
            zip: zipCode,
            date: date,
            ...(forceRegenerate && { cached: 'false' })
        });

        const response = await fetch(`/generate?${params}`);
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to generate image');
        }

        // Get the image blob
        const blob = await response.blob();
        currentImageUrl = URL.createObjectURL(blob);
        
        // Display the image
        weatherImage.src = currentImageUrl;
        imageDescription.textContent = `Weather visualization for ${locationName.textContent || zipCode} on ${new Date(date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })}`;
        
        loading.style.display = 'none';
        result.style.display = 'block';
        generateBtn.style.display = 'none';
        regenerateBtn.style.display = 'inline-flex';

    } catch (err) {
        loading.style.display = 'none';
        showError(err.message);
    }
}

// Show error message
function showError(message) {
    error.textContent = message;
    error.style.display = 'block';
    setTimeout(() => {
        error.style.display = 'none';
    }, 5000);
}