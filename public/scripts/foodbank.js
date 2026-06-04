document.getElementById('findBanksBtn').addEventListener('click', () => {
    
    const outputDiv = document.getElementById('foodBankOutput');
    outputDiv.innerHTML = "<em>Locating you... please allow location access if prompted.</em>";

    navigator.geolocation.getCurrentPosition(

        async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            outputDiv.innerHTML = "<em>Searching for closest food banks...</em>";

            try {
                const response = await fetch(`/api/foodbanks?lat=${lat}&lon=${lon}`);
                const foodBanks = await response.json();

                if (foodBanks.length === 0 || foodBanks[0].includes("Could not")) {
                    outputDiv.innerHTML = "No food banks found nearby or an error occurred.";
                } else {

                    outputDiv.innerHTML = foodBanks.join('<br><br>');
                }
            } catch (error) {
                outputDiv.innerHTML = "Failed to connect to the server.";
            }
        },

        (error) => {
            outputDiv.innerHTML = "<strong>Error:</strong> Location access denied. Please enable location permissions to use this feature.";
        }
    );
});