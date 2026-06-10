const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

function showForm(role) {
    document.getElementById("roleInput").value = role;

    if (role === "donor") {
        document.getElementById("formTitle").innerText = "Your Details - Donor";
        document.getElementById("extraFields").style.display = "none";
    } else {
        document.getElementById("formTitle").innerText = "Your Details - Food Support";
        document.getElementById("extraFields").style.display = "block";
    }

    document.getElementById("formSection").style.display = "flex";
    document.getElementById("formSection").scrollIntoView({ behavior: "smooth" });
}

function toggleHomeAddress() {
    const val = document.getElementById("housingInput").value;
    if (val === "no") {
        document.getElementById("homeAddressBlock").style.display = "none";
    } else {
        document.getElementById("homeAddressBlock").style.display = "block";
    }
}

function submitForm() {
    document.getElementById("formError").style.display = "none";
    const role    = document.getElementById("roleInput").value;
    const name    = document.getElementById("nameInput").value.trim();
    const email   = document.getElementById("emailInput").value.trim();
    const phone   = document.getElementById("phoneInput").value.trim();
    const address = document.getElementById("addressInput").value.trim();
    if (name === "" || email === "" || phone === "" || address === "") {
        document.getElementById("formError").style.display = "block";
        return;
    }

    const formData = { role, name, email, phone, address };
    
    if (role === "user") {
        formData.housing     = document.getElementById("housingInput").value;
        formData.homeAddress = document.getElementById("homeAddressInput").value.trim();
        formData.peopleCount = document.getElementById("peopleCountInput").value;
    }

    supabaseClient
        .from("submissions")
        .insert([{
            role: formData.role,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            housing: formData.housing || null,
            home_address: formData.homeAddress || null,
            people_count: formData.peopleCount ? parseInt(formData.peopleCount, 10) : null,
            submitted_at: new Date().toISOString() 
        }])
        .then(response => {
            if (response.error) {
                console.log(response.error.message);
            } else {
                console.log("Data inserted successfully");
            }
        })
        .catch(error => {
            console.log(error);
        });

    document.getElementById("resultsSection").style.display = "block";
    document.getElementById("loadingMsg").style.display = "block";
    document.getElementById("cardsContainer").innerHTML = "";
    document.getElementById("resultsSection").scrollIntoView({ behavior: "smooth" });

    fetch("/api/foodbanks")                                         
        .then(response => response.json())
        .then(data => {
            document.getElementById("loadingMsg").style.display = "none";
            if (role === "donor") {
                document.getElementById("resultsTitle").innerText = "Places Near You That Need Donations";
                document.getElementById("resultsNotice").innerText = "Thank you for donating. These places may get in touch when they need supplies.";
            } else {
                document.getElementById("resultsTitle").innerText = "Food Support Near You";
                document.getElementById("resultsNotice").innerText = "Here are some nearby places that can help you out.";
            }
            const container = document.getElementById("cardsContainer");
            if (data.length === 0) {                                 
                container.innerHTML = "<p class='no-results'>No places found near your address.</p>";
                return;
            }
            for (let i = 0; i < data.length; i++) {                 
                const place = data[i];                               
                const mapsUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(place.name + " " + place.address);
                let card = "<div class='place-card'>";
                card += "<h3>" + place.name + "</h3>";
                card += "<p class='label'>Address</p>";
                card += "<p>" + place.address + "</p>";
                if (place.openingTimes) {
                    card += "<p class='label'>Opening Times</p>";
                    card += "<p>" + place.openingTimes + "</p>";
                }
                if (place.category) {
                    card += "<p class='label'>Type</p>";
                    card += "<p>" + place.category + "</p>";
                }
                card += "<a href='" + mapsUrl + "' target='_blank'>View on Google Maps</a>";
                card += "</div>";
                container.innerHTML += card;
            }
        })
        .catch(error => {
            document.getElementById("loadingMsg").style.display = "none";
            document.getElementById("cardsContainer").innerHTML = "<p class='no-results'>Something went wrong. Please try again.</p>";
            console.log(error);
        });
}