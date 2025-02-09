// 🔹 Dark Mode Toggle Function
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");

    // Store user preference
    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
        document.querySelector(".toggle-btn").innerText = "☀️ Light Mode";
    } else {
        localStorage.setItem("theme", "light");
        document.querySelector(".toggle-btn").innerText = "🌙 Dark Mode";
    }

    // Apply dark mode to existing cards
    applyDarkModeToCards();
}

// 🔹 Load Saved Dark Mode Preference
function loadDarkModePreference() {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
        document.body.classList.add("dark-mode");
        document.querySelector(".toggle-btn").innerText = "☀️ Light Mode";
    }
}

function applyDarkModeToCards() {
    const theme = localStorage.getItem("theme");
    document.querySelectorAll(".card").forEach(card => {
        if (theme === "dark") {
            card.classList.add("dark-mode");
        } else {
            card.classList.remove("dark-mode");
        }
    });
}

async function fetchSeasons() {
    try {
        let response = await fetch("http://170.187.148.48:5000/all_seasons");
        let seasons = await response.json();
        
        let seasonDropdown = document.getElementById("season_filter");
        seasonDropdown.innerHTML = `<option value="all">All Seasons</option>`; 

        seasons.forEach(season => {
            let option = document.createElement("option");
            option.value = season;
            option.textContent = `Season ${season}`;
            seasonDropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching seasons:", error);
    }
}

async function fetchPlayerCards() {
    let uuid = document.getElementById("player_uuid").value.trim();
    let displayDiv = document.getElementById("player_cards");
    let sortOption = document.getElementById("sort_option").value;
    let seasonFilter = document.getElementById("season_filter").value;

    displayDiv.innerHTML = ""; // Clear previous results

    if (!uuid) {
        displayDiv.innerHTML = `<p class="error-message">⚠️ Please enter a UUID.</p>`;
        return;
    }

    console.log("Fetching cards for UUID:", uuid);

    try {
        let response = await fetch(`http://170.187.148.48:5000/player_cardshtml/${uuid}`);
        let data = await response.json();

        if (data.error) {
            displayDiv.innerHTML = `<p class="error-message">⚠️ ${data.error}</p>`;
            return;
        }

        if (!Array.isArray(data) || data.length === 0) {
            displayDiv.innerHTML = `<p class="error-message">⚠️ No cards found for this player.</p>`;
            return;
        }

        // 🔹 Apply Season Filtering
        if (seasonFilter !== "all") {
            data = data.filter(card => card.season == seasonFilter);
        }

        // 🔹 Sorting Logic
        data.sort((a, b) => {
            if (sortOption === "deck") return (b.in_deck ? 1 : 0) - (a.in_deck ? 1 : 0);
            if (sortOption === "name") return a.name.localeCompare(b.name);
            if (sortOption === "power") return b.power - a.power;
            if (sortOption === "rarity") return a.rarity.localeCompare(b.rarity);
            if (sortOption === "ability") return a.ability.localeCompare(b.ability);
            if (sortOption === "collection_number") return a.collection_number - b.collection_number;
        });

        // 🔹 Display Cards
        let display = "";
        data.forEach(card => {
            let imageUrl = `http://170.187.148.48:5000/card_images/${card.material_uuid}.png`;

            display += `
                <div class="card">
                    <div class="card-image-container">
                        <div class="watermark"></div>
                        <img src="${imageUrl}" alt="Card Image">
                    </div>
                    <div class="card-info">
                        <strong>🃏 ${card.name}</strong> - <em>${card.rarity}</em><br>
                        🔢 Collection Number: ${card.collection_number}<br>
                        📅 Season: ${card.season}<br>
                        ⚡ Power: ${card.power}<br>
                        🌀 Ability: ${card.ability}<br>
                        📦 Owned: ${card.owned_count}<br>
                        🎯 In Deck: ${card.in_deck ? '✅ Yes' : '❌ No'}<br>
                    </div>
                </div>
            `;
        });

        displayDiv.innerHTML = display;
        applyDarkModeToCards();
    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

loadDarkModePreference();
fetchSeasons();
