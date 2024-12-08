// Map of Pokémon types to background colors
const typeColors = {
    normal: '#A8A77A',
    fire: '#EE8130',
    water: '#6390F0',
    electric: '#F7D02C',
    grass: '#7AC74C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    dark: '#705746',
    steel: '#B7B7CE',
    fairy: '#D685AD'
};

const apiUrl = 'https://pokeapi.co/api/v2/pokemon';
const limit = 50; // Number of Pokémon to fetch at a time
let offset = 0; // Start fetching from the first Pokémon
let isLoading = false; // Prevent multiple simultaneous loads

async function fetchPokemon() {
    if (isLoading) return; // Prevent fetching if already loading
    isLoading = true;

    try {
        const response = await fetch(`${apiUrl}?limit=${limit}&offset=${offset}`);
        const data = await response.json();
        const pokemonResults = data.results;

        // Fetch details for each Pokémon
        for (const pokemon of pokemonResults) {
            const pokemonData = await fetch(pokemon.url).then(res => res.json());
            displayPokemon(pokemonData);
        }

        // Update the offset for the next fetch
        offset += limit;
    } catch (error) {
        console.error("Error fetching Pokémon data:", error);
    } finally {
        isLoading = false; // Allow loading again
    }
}

function displayPokemon(pokemon) {
    const pokemonList = document.getElementById('pokemonList');

    // Extract stats
    const stats = pokemon.stats.reduce((acc, stat) => {
        acc[stat.stat.name] = stat.base_stat;
        return acc;
    }, {});

    // Get the primary type of the Pokémon
    const primaryType = pokemon.types[0].type.name;
    const backgroundColor = typeColors[primaryType] || '#ffffff'; // Default to white if type not found

    // Create a card for each Pokémon
    const pokemonCard = document.createElement('div');
    pokemonCard.classList.add('pokemon-card');
    pokemonCard.setAttribute('data-name', pokemon.name.toLowerCase()); // Store the name for filtering
    pokemonCard.style.backgroundColor = backgroundColor; // Set background color based on type

    pokemonCard.innerHTML = `
        <h3>${pokemon.name.toUpperCase()}</h3>
        <img class="pokemon-img" src="${pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}" alt="${pokemon.name}" />
        <p><strong>Type:</strong> ${pokemon.types.map(type => type.type.name).join(", ")}</p>
        <p><strong>Attack:</strong> ${stats.attack}</p>
        <p><strong>Defense:</strong> ${stats.defense}</p>
        <p><strong>HP:</strong> ${stats.hp}</p>
    `;

    // Add the card to the DOM
    pokemonList.appendChild(pokemonCard);

    // Observe the card for visibility
    observer.observe(pokemonCard);
}

// Filter Pokémon by name
function filterPokemon() {
    const searchTerm = document.getElementById('searchBar').value.toLowerCase();
    const pokemonCards = document.querySelectorAll('.pokemon-card');
    pokemonCards.forEach(card => {
        const name = card.getAttribute('data-name');
        if (name.includes(searchTerm)) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

// Set up the Intersection Observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible'); // Add the visible class
        } else {
            entry.target.classList.remove('visible'); // Remove the visible class when out of view
        }
    });
}, {
    threshold: 0.1, // Trigger when 10% of the card is visible
    rootMargin: '500px 0px 300px 0px' // Add a margin of 100px above and below the viewport
});

// Detect when the user scrolls to 90% of the page height
window.addEventListener('scroll', () => {
    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.body.offsetHeight * 0.9; // 90% of the page height

    if (scrollPosition >= threshold) {
        fetchPokemon(); // Fetch more Pokémon when reaching 90%
    }
});

// Initial fetch
fetchPokemon();



// Load the current battle team from localStorage
const battleTeam = JSON.parse(localStorage.getItem('battleTeam')) || [];

// Render the battle team
function renderBattleTeam() {
    const battleTeamElement = document.getElementById('battleTeam');
    battleTeamElement.innerHTML = Array.from({ length: 5 })
        .map((_, index) => {
            const pokemon = battleTeam[index];
            if (pokemon) {
                return `
                    <li>
                        <img src="${pokemon.image}" alt="${pokemon.name}" class="battle-pokemon-img" />
                        <span>${pokemon.name}</span>
                        <button onclick="removeFromBattleTeam(${index})"><i class="fas fa-times"></i></button>
                    </li>
                `;
            } else {
                return `
                    <li class="empty-slot">
                        <span>Empty Slot</span>
                    </li>
                `;
            }
        })
        .join('');
}


// Add a Pokémon to the battle team
function addToBattleTeam(pokemonName, pokemonImage) {
    if (battleTeam.length >= 5) {
        alert('You can only have 5 Pokémon in your battle team.');
        return;
    }
    if (battleTeam.some((p) => p.name === pokemonName)) {
        alert('This Pokémon is already in your battle team.');
        return;
    }
    battleTeam.push({ name: pokemonName, image: pokemonImage });
    localStorage.setItem('battleTeam', JSON.stringify(battleTeam));
    renderBattleTeam();
}

// Remove a Pokémon from the battle team
function removeFromBattleTeam(index) {
    battleTeam.splice(index, 1);
    localStorage.setItem('battleTeam', JSON.stringify(battleTeam));
    renderBattleTeam();
}

// Attach an "Add to Team" button to each Pokémon card
function displayPokemon(pokemon) {
    const pokemonList = document.getElementById('pokemonList');

    // Extract stats
    const stats = pokemon.stats.reduce((acc, stat) => {
        acc[stat.stat.name] = stat.base_stat;
        return acc;
    }, {});

    // Get the primary type of the Pokémon
    const primaryType = pokemon.types[0].type.name;
    const backgroundColor = typeColors[primaryType] || '#ffffff'; // Default to white if type not found

    // Create a card for each Pokémon
    const pokemonCard = document.createElement('div');
    pokemonCard.classList.add('pokemon-card');
    pokemonCard.setAttribute('data-name', pokemon.name.toLowerCase()); // Store the name for filtering
    pokemonCard.style.backgroundColor = backgroundColor; // Set background color based on type

    const pokemonImage =
        pokemon.sprites.other['official-artwork'].front_default ||
        pokemon.sprites.front_default;

    pokemonCard.innerHTML = `
        <h3>${pokemon.name.toUpperCase()}</h3>
        <img class="pokemon-img" src="${pokemonImage}" alt="${pokemon.name}" />
        <p><strong>Type:</strong> ${pokemon.types
            .map((type) => type.type.name)
            .join(', ')}</p>
        <p><strong>Attack:</strong> ${stats.attack}</p>
        <p><strong>Defense:</strong> ${stats.defense}</p>
        <p><strong>HP:</strong> ${stats.hp}</p>
        <button onclick="addToBattleTeam('${pokemon.name}', '${pokemonImage}')">Add to Team</button>
    `;

    // Add the card to the DOM
    pokemonList.appendChild(pokemonCard);

    // Observe the card for visibility
    observer.observe(pokemonCard);
}

// Initial rendering of battle team
renderBattleTeam();


const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {
    avatar: 'img/profile-default.png',
    name: 'Ash Ketchum',
};

// Populate user info dynamically
function renderUserInfo() {
    document.querySelector('.preview-avatar').src = userInfo.avatar;
    document.getElementById('userName').value = userInfo.name;
    document.querySelector('.user-avatar').src = userInfo.avatar;
    document.querySelector('.user-name').textContent = userInfo.name;
}

// Open the popup
function openEditPopup() {
    const popup = document.getElementById('editPopup');
    popup.classList.add('show');
    document.getElementById('previewAvatar').src = userInfo.avatar;
}

// Close the popup
function closeEditPopup() {
    const popup = document.getElementById('editPopup');
    popup.classList.remove('show');
}

// Trigger the file input when clicking the avatar
function triggerFileInput() {
    document.getElementById('userAvatar').click();
}

// Preview the selected image
function previewImage() {
    const avatarInput = document.getElementById('userAvatar');
    const preview = document.getElementById('previewAvatar');

    if (avatarInput.files && avatarInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result; // Set the preview image source
        };
        reader.readAsDataURL(avatarInput.files[0]); // Read the file as a Data URL
    }
}

// Save user info and update the UI
function saveUserInfo() {
    const name = document.getElementById('userName').value;

    // Handle profile image
    const avatarInput = document.getElementById('userAvatar');
    if (avatarInput.files && avatarInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            userInfo.avatar = e.target.result; // Save the new avatar
            updateAndSaveUserInfo(name);
        };
        reader.readAsDataURL(avatarInput.files[0]);
    } else {
        updateAndSaveUserInfo(name);
    }
}

function updateAndSaveUserInfo(name) {
    userInfo.name = name;

    // Save to local storage
    localStorage.setItem('userInfo', JSON.stringify(userInfo));

    // Update UI and close popup
    renderUserInfo();
    closeEditPopup();
}

// Initialize user info on page load
renderUserInfo();