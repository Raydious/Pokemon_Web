/*
 * This JavaScript file manages the functionality of the Pokédex.
 * It includes logic for saving user information, validating input fields,
 * handling profile images, and updating the user interface accordingly.
 * The file ensures that user data such as name, email, and favorite Pokémon
 * are properly validated and stored.
 */


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
let isLoading = false; // Prevent multiple simultaneous loads
let catchingPokemon = false;
let isSearching = false;
let allPokemonData = [];

async function fetchPokemon() {
    if (isLoading) return; // Prevent fetching if already loading
    isLoading = true;

    try {
        const response = await fetch(`${apiUrl}?limit=999999&offset=0`);
        const data = await response.json();
        allPokemonData = data.results;

        // Fetch details for each Pokémon
        for (const pokemon of allPokemonData) {
            if (isSearching) break; // Stop fetching if a search is in progress
            const pokemonData = await fetch(pokemon.url).then(res => res.json());
            if (!isSearching) displayPokemon(pokemonData);
        }
    } catch (error) {
        console.error("Error fetching Pokémon data:", error);
    } finally {
        isLoading = false; // Allow loading again
    }
}

let searchTimeout;

// Filter Pokémon by name
function filterPokemon() {
    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {
        isSearching = true; // Indicate that a search is in progress
        const searchTerm = document.getElementById('searchBar').value.toLowerCase();
        const pokemonList = document.getElementById('pokemonList');
        pokemonList.innerHTML = '';

        if (searchTerm === '') {
            isSearching = false; // Indicate that the search is complete
            fetchPokemon();
            return;
        }

        const filteredPokemon = allPokemonData.filter(pokemon => 
            pokemon.name.toLowerCase().startsWith(searchTerm)
        );

        filteredPokemon.forEach(async pokemon => {
            const pokemonData = await fetch(pokemon.url).then(res => res.json())
            displayPokemon(pokemonData);
        });
    }, 500);
}
document.getElementById('searchBar').addEventListener('input', filterPokemon);

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
                        <img src="${pokemon.image}" alt="Pokemon Image" class="battle-pokemon-img" />
                        <span>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1).toLowerCase()}</span>
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
    event.stopPropagation();
    if (battleTeam.length >= 5) {
        //alert('You can only have 5 Pokémon in your battle team.');
        showPokemonGamePopup('pokemonPopup-team-full')
        return;
    }
    if (battleTeam.some((p) => p.name === pokemonName)) {
        //alert('This Pokémon is already in your battle team.');
        showPokemonGamePopup('pokemonPopup-already-added')
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

    // Check if the Pokémon exists in myPokemons
    const myPokemons = JSON.parse(localStorage.getItem('myPokemons')) || [];
    const isCaught = myPokemons.some((p) => p.name.toLowerCase() === pokemon.name.toLowerCase());

    // Create a card for each Pokémon
    const pokemonCard = document.createElement('div');
    pokemonCard.classList.add('pokemon-card');
    pokemonCard.setAttribute('data-name', pokemon.name.toLowerCase()); // Store the name for filtering
    pokemonCard.setAttribute('data-id', pokemon.id); 
    pokemonCard.setAttribute('data-color', backgroundColor); 
    pokemonCard.style.background = `radial-gradient(circle at 50% 0%, ${backgroundColor} 36%, #ffffff 36%)`; // Set background color based on type

    const pokemonImage =
        pokemon.sprites.other['official-artwork'].front_default ||
        pokemon.sprites.front_default;

    const typeHtml = pokemon.types.map((item) => {
        return `<span style="background-color: ${typeColors[item.type.name]}"}>${item.type.name}</span>`;
    }).join("");

    // Create a button based on the Pokémon's status
    const button = document.createElement('button');
    if (isCaught) {
        // If the Pokémon is already caught
        button.textContent = "Add to Team";
        button.onclick = () => addToBattleTeam(pokemon.name, pokemonImage);
    } else {
        // If the Pokémon is not caught
        button.textContent = "Catch Pokémon";
        button.onclick = () => catchPokemon(pokemon.name, pokemon.id);
    }

    // Style the button
    button.style.backgroundColor = isCaught ? backgroundColor : '#ff5959'; // Use a red color for "Catch Pokémon"
    button.style.color = '#fff';
    button.style.border = 'none';
    button.style.borderRadius = '15px';
    button.style.padding = '10px 20px';
    button.style.margin = '15px auto 0';
    button.style.display = 'block';
    button.style.fontWeight = 'bold';
    button.style.cursor = 'pointer';
    button.style.transition = 'transform 0.2s ease, background-color 0.3s ease';
    button.onmouseover = () => {
        const currentColor = button.style.backgroundColor; // Get the current color
        const hexColor = currentColor.startsWith('#') ? currentColor : rgbToHex(currentColor); // Convert to hex if needed
        button.style.backgroundColor = darkenColor(hexColor, 40); // Apply darkening
    };
    button.onmouseout = () => (button.style.backgroundColor = isCaught ? backgroundColor : '#ff5959');

    pokemonCard.innerHTML = `
        <p class="hp">
          <span>HP</span>
            ${stats.hp}
        </p>
        <img class="poke-img" src=${pokemonImage} alt="${pokemon.name}" />
        <h2 class="poke-name">${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1).toLowerCase()}</h2>
        <div class="types">
            ${typeHtml}
        </div>
        <div class="stats">
          <div>
            <h3>${stats.attack}</h3>
            <p>Attack</p>
          </div>
          <div>
            <h3>${stats.defense}</h3>
            <p>Defense</p>
          </div>
          <div>
            <h3>${stats.speed}</h3>
            <p>Speed</p>
          </div>
        </div>
    `;

    // Add button to the card
    pokemonCard.appendChild(button);

    // Add PokéBall icon if the Pokémon exists in myPokemons
    if (isCaught) {
        const pokeballIcon = document.createElement('div');
        pokeballIcon.classList.add('pokeball-icon');
        pokeballIcon.innerHTML = `<img src="../img/pokeball.png" alt="Caught Pokémon" style="width: 100%" />`; // Replace with the actual path to your PokéBall icon
        pokeballIcon.style.position = 'absolute';
        pokeballIcon.style.top = '10px';
        pokeballIcon.style.left = '15px';
        pokeballIcon.style.width = '40px';
        pokeballIcon.style.height = '40px';
        pokeballIcon.style.pointerEvents = 'none'; // Prevent the icon from interfering with clicks
        pokemonCard.appendChild(pokeballIcon);
    }

    // Add the card to the DOM
    pokemonList.appendChild(pokemonCard);

    // Observe the card for visibility
    observer.observe(pokemonCard);
}


// Helper function to darken a color for btns
function darkenColor(color, amount) {
    const colorInt = parseInt(color.slice(1), 16); // Convert hex to integer
    const r = Math.max((colorInt >> 16) - amount, 0);
    const g = Math.max((colorInt >> 8 & 0x00FF) - amount, 0);
    const b = Math.max((colorInt & 0x0000FF) - amount, 0);
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

function rgbToHex(rgb) {
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return rgb; // Return the original value if it's not in rgb format

    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

function catchPokemon(name, id) {
    event.stopPropagation();
    const modalContainer = document.querySelector(".container-modal");
    modalContainer.classList.add('open')


    // Show the overlay with opacity animation
    const overlay = document.querySelector('.overlay');
    overlay.classList.add('visible');
    overlay.addEventListener('click', handleOverlayClick);

    // Dispatch a custom event with the Pokémon ID
    const customEvent = new CustomEvent("selectPokemonById", { detail: { id } });
    document.dispatchEvent(customEvent);
}

// Initial rendering of battle team
renderBattleTeam();

// Listen for the custom event
document.addEventListener('caughtPokemonEvent', (event) => {
    const { pokemonId } = event.detail; // Get the Pokémon ID from the event detail
    console.log(`Caught Pokémon with ID ${pokemonId}`);

    // Hide the modal
    const modalContainer = document.querySelector(".container-modal");
    if (modalContainer) {
        modalContainer.classList.remove('open')

        // Hide the overlay with opacity animation
        const overlay = document.querySelector('.overlay');
        overlay.classList.remove('visible');
        overlay.removeEventListener('click', handleOverlayClick);
    }
    
    if (event.detail.message === 'The Pokémon escaped!') {
        showPokemonGamePopup("pokemonPopup-game-escape")
    } else {

        showPokemonGamePopup("pokemonPopup-game-catch")

        // Find the Pokémon card corresponding to the caught Pokémon
        const pokemonCard = document.querySelector(`.pokemon-card[data-id="${pokemonId}"]`);
        if (pokemonCard) {
            // Update the button text
            const button = pokemonCard.querySelector('button');
            if (button) {
                button.textContent = "Add to Team";
                button.style.backgroundColor = pokemonCard.getAttribute('data-color');
                button.onmouseover = () => (button.style.backgroundColor = darkenColor(button.style.backgroundColor, 40));
                button.onmouseout = () => (button.style.backgroundColor = pokemonCard.getAttribute('data-color'));
                button.onclick = () => {
                    const pokemonName = pokemonCard.getAttribute('data-name');
                    const pokemonImage = pokemonCard.querySelector('img').src;
                    addToBattleTeam(pokemonName, pokemonImage);
                };
            }

            // Add the PokéBall icon
            let pokeballIcon = pokemonCard.querySelector('.pokeball-icon');
            if (!pokeballIcon) {
                pokeballIcon = document.createElement('div');
                pokeballIcon.classList.add('pokeball-icon');
                pokeballIcon.innerHTML = `<img src="../img/pokeball.png" alt="Caught Pokémon" style="width: 100%" />`; // Replace with your actual PokéBall image path
                pokeballIcon.style.position = 'absolute';
                pokeballIcon.style.top = '10px';
                pokeballIcon.style.left = '15px';
                pokeballIcon.style.width = '40px';
                pokeballIcon.style.height = '40px';
                pokeballIcon.style.pointerEvents = 'none';
                pokemonCard.appendChild(pokeballIcon);
            }
        } else {
            console.warn(`No card found for Pokémon with ID ${pokemonId}`);
        }
    }
});


const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {
    avatar: '../img/default_img.jpg',
    name: 'Ash Ketchum',
    email: 'ash.ketchum@email.com',
    pokemonFavorite: 'Bulbasaur',
    victories: 0,
    defeats: 0
};

// Populate user info dynamically
function renderUserInfo() {
    document.querySelector('.preview-avatar').src = userInfo.avatar;
    document.getElementById('userName').value =
        userInfo.name !== undefined && userInfo.name !== null
            ? userInfo.name : 'Ash Ketchum';
    document.getElementById('userEmail').value =
        userInfo.email !== undefined && userInfo.email !== null
            ? userInfo.email : 'ash.ketchum@email.com';
    document.getElementById('userPokemon').value =
        userInfo.pokemonFavorite !== undefined && userInfo.pokemonFavorite !== null
            ? userInfo.pokemonFavorite : 'Bulbasaur';
    document.querySelector('.user-avatar').src = userInfo.avatar;
    document.querySelector('.user-name').textContent =
        userInfo.name !== undefined && userInfo.name !== null
            ? userInfo.name : 'Ash Ketchum';
    document.querySelector('.user-email').textContent =
        userInfo.email !== undefined && userInfo.email !== null
            ? userInfo.email : 'ash.ketchum@email.com';
    document.querySelector('.user-pokemon').textContent =
        userInfo.pokemonFavorite !== undefined && userInfo.pokemonFavorite !== null
            ? userInfo.pokemonFavorite : 'Bulbasaur';
    document.querySelector('#victories').textContent =
        userInfo.victories !== undefined && userInfo.victories !== null
            ? userInfo.victories : 0;
    document.querySelector('#defeats').textContent =
        userInfo.defeats !== undefined && userInfo.defeats !== null
            ? userInfo.defeats : 0;
}

// Open the popup
function openEditPopup() {
    const popup = document.getElementById('editPopup');
    popup.classList.add('show');
    document.getElementById('previewAvatar').src = userInfo.avatar;
    document.getElementById('userName').value = userInfo.name;
    document.getElementById('userEmail').value = userInfo.email;
    document.getElementById('userPokemon').value = userInfo.pokemonFavorite;
    document.getElementById('error').textContent = "";
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
    const email = document.getElementById('userEmail').value;
    const pokemonFavorite = document.getElementById('userPokemon').value;

    // Validate name
    if (!name) {
        document.getElementById('error').textContent = 'Name is required.';
        return;
    } else if (name.length < 3) {
        document.getElementById('error').textContent = 'Name must be at least 3 characters long.';
        return;
    }

    // Validate email
    if (!email) {
        document.getElementById('error').textContent = 'Email is required.';
        return;
        
    } else if (!validateEmail(email)) {
        document.getElementById('error').textContent = 'Invalid email format.';
        return;
    } else if (email.length < 5) {
        document.getElementById('error').textContent = 'Email must be at least 5 characters long.';
        return;
    }

    // Validate Pokémon favorite
    if (!pokemonFavorite) {
        document.getElementById('error').textContent = 'Favorite Pokémon is required.';
        return;
    } else if (pokemonFavorite.length < 3) {
        document.getElementById('error').textContent = 'Favorite Pokémon must be at least 3 characters long.';
        return;
    }

    document.getElementById('error').textContent = "";

    // Handle profile image
    const avatarInput = document.getElementById('userAvatar');
    if (avatarInput.files && avatarInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            userInfo.avatar = e.target.result; // Save the new avatar
            updateAndSaveUserInfo(name, email, pokemonFavorite);
        };
        reader.readAsDataURL(avatarInput.files[0]);
    } else {
        updateAndSaveUserInfo(name, email, pokemonFavorite);
    }
}

// Helper function to validate email
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function updateAndSaveUserInfo(name, email, pokemonFavorite) {
    userInfo.name = name;
    userInfo.email = email;
    userInfo.pokemonFavorite = pokemonFavorite;

    // Save to local storage
    localStorage.setItem('userInfo', JSON.stringify(userInfo));

    // Update UI and close popup
    renderUserInfo();
    closeEditPopup();
}

// Initialize user info on page load
renderUserInfo();




/**  NAVIGATION  **/

// Variable to set the nav is open or not
let isOpenNav = false;

/**
 * Function to open or close the sidenav
 */
function openCloseNav() {

    // If the right nav is open, close it
    if (!isOpenNav && isRightNavOpen) {
        this.openCloseAside();
        return;
    };

    // Toggle the sidenav's margin left
    document.getElementById("mySidebar").style.marginLeft = isOpenNav ? "-250px" : "0px";

    // Update the state of isOpenNav
    isOpenNav = !isOpenNav;
}

// Variable to set the aside is open or not
let isRightNavOpen = false;

/**
 * Function to open or close the aside
 */
function openCloseAside() {

    // If the sidenav is open, close it
    if (isOpenNav && !isRightNavOpen) {
        this.openCloseNav();
        return;
    };

    // Toggle the aside's margin right
    document.getElementById("battle-panel").style.marginRight = isRightNavOpen ? "-250px" : "0px";

    // Update the state of isRightNavOpen
    isRightNavOpen = !isRightNavOpen;
}

/**
 * Function to close the aside when click ouside
 */
function closeAside() {

    // If is not open, don't do anything
    if (!isRightNavOpen) return;

    // Close aside
    this.openCloseAside();
}

// Function to handle card expansion
function expandCard(card) {
    const cardRect = card.getBoundingClientRect(); // Get card position
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Create a placeholder to maintain grid space
    const placeholder = document.createElement('div');
    placeholder.className = 'pokemon-card-placeholder';
    placeholder.style.width = `${card.offsetWidth}px`;
    placeholder.style.height = `${card.offsetHeight}px`;

    // Insert the placeholder in the card's position
    card.parentElement.insertBefore(placeholder, card);
    card.dataset.placeholder = 'true'; // Mark the card with a placeholder

    // Calculate position offsets
    const xOffset = windowWidth / 2 - (cardRect.left + cardRect.width / 2);
    const yOffset = windowHeight / 2 - (cardRect.top + cardRect.height / 2);

    // Apply transformations
    card.style.position = 'fixed';
    card.style.zIndex = '1000';
    card.style.left = `${cardRect.left + 13}px`; //13 is manual fix for the position
    card.style.top = `${cardRect.top + 17}px`; //17 is manual fix for the position
    card.style.transform = `translate(${xOffset}px, ${yOffset}px) scale(1.3)`;
    card.style.transition = 'all 0.5s ease-in-out, z-index 0s';

    // Add expanded class
    card.classList.add('expanded');

    // Show the overlay with opacity animation
    const overlay = document.querySelector('.overlay');
    overlay.classList.add('visible');

    // Disable scrolling
    document.body.classList.add('no-scroll');
}

// Function to collapse the card
function collapseCard(card) {
    const placeholder = card.parentElement.querySelector('.pokemon-card-placeholder');

    // Add collapsing class to enable z-index transition
    card.classList.add('collapsing');

    // Reset transformations
    card.style.transform = 'translate(0, 0) scale(1)';
    card.style.transition = 'all 0.5s ease-in-out';

    // Remove expanded class after animation
    setTimeout(() => {
        card.style.position = '';
        card.style.zIndex = '';
        card.style.left = '';
        card.style.top = '';
        card.style.width = '';
        card.style.height = '';
        card.style.transform = '';
        card.style.transition = '';
        card.classList.remove('expanded');
        card.classList.remove('collapsing');

        // Remove the placeholder
        if (placeholder) {
            placeholder.remove();
        }
    }, 500);

    // Hide the overlay with opacity animation
    const overlay = document.querySelector('.overlay');
    overlay.classList.remove('visible');

    // Re-enable scrolling
    document.body.classList.remove('no-scroll');
}

// Handle overlay click
const handleOverlayClick = () => {
    const overlay = document.querySelector('.overlay'); // Get the overlay element
    const modalContainer = document.querySelector(".container-modal");

    // Hide the modal
    if (overlay.classList.contains('visible') && modalContainer) {
        modalContainer.classList.remove('open');

        // Hide the overlay with opacity animation
        const overlay = document.querySelector('.overlay');
        overlay.classList.remove('visible');
        overlay.removeEventListener('click', handleOverlayClick);
        
    }
};

function showPokemonGamePopup(elementId) {
    const pokemonPopup = document.getElementById(elementId);
    pokemonPopup.classList.remove('hidden');
}

function closePopUp(elementId) {
    const pokemonPopup = document.getElementById(elementId);
    if (pokemonPopup) {
        // Add the closing animation class
        pokemonPopup.classList.add('closing');

        // Wait for the animation to complete before hiding the popup
        pokemonPopup.addEventListener(
            'animationend',
            () => {
                pokemonPopup.classList.remove('closing'); // Remove the animation class
                pokemonPopup.classList.add('hidden'); // Hide the popup
            },
            { once: true } // Ensure the event listener runs only once
        );
    }
}

// Add event listeners to all cards
document.addEventListener('click', (event) => {
    const card = event.target.closest('.pokemon-card'); // Check if the click was on a card
    const overlay = document.querySelector('.overlay'); // Get the overlay element

    if (card && !card.classList.contains('expanded')) {
        // Expand the clicked card
        expandCard(card);
    } else if (!card && overlay && overlay.classList.contains('visible')) {
        // Collapse the expanded card if clicking outside any card
        const expandedCard = document.querySelector('.pokemon-card.expanded');
        if (expandedCard) collapseCard(expandedCard);
    }
});

// Add the overlay to the DOM
document.body.insertAdjacentHTML('beforeend', '<div class="overlay"></div>');