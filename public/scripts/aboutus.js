fetch("/api/aboutus")
    .then(response => response.json())
    .then(data => {
        document.getElementById("aboutHeading").textContent = data.heading;
        document.getElementById("aboutText").textContent = data.intro;

        const cardsContainer = document.getElementById("aboutCards");

        data.cards.forEach(card => {
            cardsContainer.innerHTML += `
                <article class="aboutCard">
                    <img src="${card.image}" alt="${card.alt}">
                    <h2>${card.name}</h2>
                    <p>${card.text}</p>
                </article>
            `;
        });
    })
    .catch(error => {
        console.error("Error loading about content:", error);
    });