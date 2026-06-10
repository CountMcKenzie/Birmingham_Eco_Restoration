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
                    <h2 style="background-color: black; margin-top: 1ch; border-radius:100px;">${card.name}</h2>
                    <p style="text-decoration: underline; margin-bottom:1ch; ">${card.text}</p>
                    <p>${card.subtext}</p>
                </article>
            `;
        });
    })
    .catch(error => {
        console.error("Error loading about content:", error);
    });