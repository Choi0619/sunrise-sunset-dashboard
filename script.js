const locationSelect = document.getElementById('location-select');
const useCurrentLocationBtn = document.getElementById('use-current-location');
const errorMessage = document.getElementById('error-message');

const API_BASE_URL = 'https://api.sunrisesunset.io/json';

async function fetchSunriseSunsetData(latitude, longitude, date = 'today') {
    const url = `${API_BASE_URL}?lat=${latitude}&lng=${longitude}&date=${date}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch data');
    }
    return response.json();
}

function updateDashboard(data, day) {
    if (data && data.results) {
        const prefix = day === 'today' ? 'today-' : 'tomorrow-';
        document.getElementById(`${prefix}sunrise`).textContent = data.results.sunrise || '--:--';
        document.getElementById(`${prefix}sunset`).textContent = data.results.sunset || '--:--';
        document.getElementById(`${prefix}dawn`).textContent = data.results.dawn || '--:--';
        document.getElementById(`${prefix}dusk`).textContent = data.results.dusk || '--:--';
        document.getElementById(`${prefix}day-length`).textContent = data.results.day_length || '--:--';
        document.getElementById(`${prefix}solar-noon`).textContent = data.results.solar_noon || '--:--';

        if (day === 'today') {
            document.getElementById('timezone-value').textContent = data.results.timezone || 'N/A';
        }
    } else {
        console.error('Invalid data received:', data);
        errorMessage.textContent = 'Error displaying data. Please try again.';
        errorMessage.classList.remove('hidden');
    }
}


async function updateLocation(latitude, longitude) {
    try {
        errorMessage.classList.add('hidden');
        const todayData = await fetchSunriseSunsetData(latitude, longitude);
        const tomorrowData = await fetchSunriseSunsetData(latitude, longitude, 'tomorrow');
        
        updateDashboard(todayData, 'today');
        updateDashboard(tomorrowData, 'tomorrow');
    } catch (error) {
        console.error('Error fetching data:', error);
        errorMessage.classList.remove('hidden');
    }
}

locationSelect.addEventListener('change', (event) => {
    const selectedValue = event.target.value;
    if (selectedValue) {
        const [latitude, longitude] = selectedValue.split(',');
        updateLocation(parseFloat(latitude), parseFloat(longitude));
    } else {
        errorMessage.textContent = 'Please select a valid location.';
        errorMessage.classList.remove('hidden');
    }
});


useCurrentLocationBtn.addEventListener('click', () => {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                locationSelect.value = ''; // Reset dropdown
                updateLocation(latitude, longitude); // Use dynamic coordinates
            },
            (error) => {
                console.error('Error getting location:', error);
                errorMessage.textContent = 'Unable to fetch your location. Please check your settings.';
                errorMessage.classList.remove('hidden');
            }
        );
    } else {
        errorMessage.textContent = 'Geolocation is not supported by this browser.';
        errorMessage.classList.remove('hidden');
    }
});


