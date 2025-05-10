document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const sourceCodeInput = document.getElementById('sourceCode');
    const destinationCodeInput = document.getElementById('destinationCode');
    const searchBtn = document.getElementById('searchBtn');
    const swapBtn = document.getElementById('swapStations');
    const resultsContainer = document.getElementById('resultsContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const noResults = document.getElementById('noResults');
    const results = document.getElementById('results');

    // Popular station codes for demo purposes
    const popularStations = [
        { code: 'CHI', name: 'Chindwara' },
        { code: 'BHP', name: 'Bhopal' },
        { code: 'NGP', name: 'Nagpur' },
        { code: 'NDLS', name: 'New Delhi' },
        { code: 'MUM', name: 'Mumbai' }
    ];

    // Event Listeners
    searchBtn.addEventListener('click', searchTrains);
    swapBtn.addEventListener('click', swapStations);
    
    // Set sample values for easy testing
    sourceCodeInput.value = 'CHI';
    destinationCodeInput.value = 'BHP';

    // Functions
    function searchTrains() {
        const sourceCode = sourceCodeInput.value.trim().toUpperCase();
        const destinationCode = destinationCodeInput.value.trim().toUpperCase();
        
        // Validate inputs
        if (!sourceCode || !destinationCode) {
            alert('Please enter both source and destination station codes');
            return;
        }
        
        // Show loading indicator
        results.innerHTML = '';
        noResults.style.display = 'none';
        loadingIndicator.style.display = 'flex';
        
        // API URL
        const apiUrl = `http://localhost:8080/train/search/byCode?sourceCode=${sourceCode}&destinationCode=${destinationCode}`;
        
        // Fetch data from API
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                loadingIndicator.style.display = 'none';
                
                if (data && data.length > 0) {
                    displayResults(data);
                } else {
                    noResults.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Error fetching train data:', error);
                loadingIndicator.style.display = 'none';
                noResults.style.display = 'block';
                
                // If API is not available, use mock data for demo purposes
                if (sourceCode === 'CHI' && destinationCode === 'BHP') {
                    const mockData = [
                        {
                            "id": 4,
                            "train": {
                                "id": 5,
                                "trainName": "Panchvalley Express",
                                "trainNumber": "69730"
                            },
                            "source": {
                                "id": 5,
                                "stationName": "Chindwara",
                                "stationCode": "CHI"
                            },
                            "destination": {
                                "id": 2,
                                "stationName": "Bhopal",
                                "stationCode": "BHP"
                            },
                            "departureTime": "6:00",
                            "arrivalTime": "12:35"
                        }
                    ];
                    displayResults(mockData);
                }
            });
    }
    
    function displayResults(trains) {
        results.innerHTML = '';
        
        trains.forEach(train => {
            // Calculate journey duration
            const duration = calculateDuration(train.departureTime, train.arrivalTime);
            
            // Create train card
            const trainCard = document.createElement('div');
            trainCard.className = 'train-card';
            
            trainCard.innerHTML = `
                <div class="train-header">
                    <div class="train-name">${train.train.trainName}</div>
                    <div class="train-number">${train.train.trainNumber}</div>
                </div>
                <div class="train-details">
                    <div class="station-details source">
                        <div class="time">${train.departureTime}</div>
                        <div class="station-name">${train.source.stationName}</div>
                        <div class="station-code">${train.source.stationCode}</div>
                    </div>
                    <div class="journey-line">
                        <i class="fas fa-circle arrow-icon"></i>
                        <div class="line"></div>
                        <div class="duration">${duration}</div>
                        <div class="line"></div>
                        <i class="fas fa-circle arrow-icon"></i>
                    </div>
                    <div class="station-details destination">
                        <div class="time">${train.arrivalTime}</div>
                        <div class="station-name">${train.destination.stationName}</div>
                        <div class="station-code">${train.destination.stationCode}</div>
                    </div>
                </div>
            `;
            
            results.appendChild(trainCard);
        });
        
        results.style.display = 'block';
    }
    
    function calculateDuration(departureTime, arrivalTime) {
        // Parse times (assuming format HH:MM)
        const [departureHours, departureMinutes] = departureTime.split(':').map(Number);
        const [arrivalHours, arrivalMinutes] = arrivalTime.split(':').map(Number);
        
        // Convert to minutes since midnight
        let departureInMinutes = departureHours * 60 + departureMinutes;
        let arrivalInMinutes = arrivalHours * 60 + arrivalMinutes;
        
        // Adjust if train arrives next day
        if (arrivalInMinutes < departureInMinutes) {
            arrivalInMinutes += 24 * 60; // Add a full day in minutes
        }
        
        // Calculate difference
        const durationInMinutes = arrivalInMinutes - departureInMinutes;
        
        // Format result
        const hours = Math.floor(durationInMinutes / 60);
        const minutes = durationInMinutes % 60;
        
        return `${hours}h ${minutes}m`;
    }
    
    function swapStations() {
        const temp = sourceCodeInput.value;
        sourceCodeInput.value = destinationCodeInput.value;
        destinationCodeInput.value = temp;
        
        // Add a rotation animation to the button
        swapBtn.style.transform = 'rotate(180deg)';
        setTimeout(() => {
            swapBtn.style.transform = 'rotate(0deg)';
        }, 300);
    }
});