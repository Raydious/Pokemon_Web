/**  NAVIGATION  **/

// Variable to set the nav is open or not
let isOpenNav = false;

/**
 * Function to open or close the sidenav
 */
function openCloseNav() {

    // Toggle the sidenav's margin left
    document.getElementById("mySidebar").style.marginLeft = isOpenNav ? "-250px" : "0px";

    // Update the state of isOpenNav
    isOpenNav = !isOpenNav;
}



/**  BATTLE  **/

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

document.addEventListener('DOMContentLoaded', () => {
    const battleTeam = JSON.parse(localStorage.getItem('battleTeam')) || [];

    // Check if the array is empty
    if (battleTeam.length === 0 || battleTeam.length < 5) {
        console.log('Battle team is empty or is not 5 pokemons');
        return;
    }

    // Atualize as cartas do jogador com os dados do battleTeam
    battleTeam.forEach(async (pokemon, index) => {
        const playerCard = document.getElementById(`player-card-${index + 1}`);
        if (playerCard) {
            const pokemonData = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`).then(res => res.json());

            // Get the primary type of the Pokémon
            const primaryType = pokemonData.types[0].type.name;
            const backgroundColor = typeColors[primaryType] || '#ffffff';

            // Extract stats
            const stats = pokemonData.stats.reduce((acc, stat) => {
                acc[stat.stat.name] = stat.base_stat;
                return acc;
            }, {});

            const pokemonImage =
                pokemonData.sprites.other['official-artwork'].front_default ||
                pokemonData.sprites.front_default;

            const typeHtml = pokemonData.types.map((item) => {
                return `<span style="background-color: ${typeColors[item.type.name]}"}>${item.type.name}</span>`;
            }).join("");

            playerCard.innerHTML = `
                <div class="front">
                    <p class="hp">
                        <span>HP</span>
                        ${stats.hp}
                    </p>
                    <img class="poke-img" src=${pokemonImage} alt="${pokemonData.name}" />
                    <h2 class="poke-name">${pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1).toLowerCase()}</h2>
                </div>
                <div class="back">
                    <div class="types">
                        ${typeHtml}
                    </div>
                    <div class="stats">
                        <div class="col1">
                            <h3>${stats.attack}</h3>
                            <p>Attack</p>
                        </div>
                        <div class="col2">
                            <h3>${stats.defense}</h3>
                            <p>Defense</p>
                        </div>
                        <div class="col3">
                            <h3>${stats.speed}</h3>
                            <p>Speed</p>
                        </div>
                    </div>
                </div>
            `;
            playerCard.style.background = `radial-gradient(circle at 50% 0%, ${backgroundColor} 36%, #ffffff 36%)`;
        }
    });
});


const cards = document.querySelectorAll('.card');
const gridCells = document.querySelectorAll('.grid-cell');
const container = document.querySelector('main'); // Use the common container for cards and grid

const opponentCards = Array.from(document.querySelectorAll('.opponent-cards .card'));
let currentOpponentCardIndex = 0; // Track which opponent card to place

cards.forEach(card => {
    let offsetX = 0, offsetY = 0;
    let originalLeft = 0, originalTop = 0;
    let originalRotation = '';

    // Common start drag handler for mouse and touch
    const startDrag = (e) => {
        e.preventDefault();

        const isTouch = e.type === 'touchstart';
        const startX = isTouch ? e.touches[0].clientX : e.clientX;
        const startY = isTouch ? e.touches[0].clientY : e.clientY;

        console.log(`Card "${card.textContent.trim()}" selected`);

        // Store the card's original position and rotation
        const cardRect = card.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        originalLeft = card.offsetLeft;
        originalTop = card.offsetTop;
        originalRotation = card.style.getPropertyValue('--rotation') || '';

        console.log(`Original Position: Left=${originalLeft}px, Top=${originalTop}px`);
        console.log(`Original Rotation: ${originalRotation}`);


        // Calculate offset from the touch/mouse pointer to the card's top-left corner
        offsetX = startX - cardRect.left;
        offsetY = startY - cardRect.top;

        console.log(`OffsetX: ${offsetX}, OffsetY: ${offsetY}`);

        // Enable movement
        const moveCard = (event) => {
            // Remove rotation while dragging
            card.style.removeProperty('--rotation');
            card.style.transition = 'none';

            const isTouchMove = event.type === 'touchmove';
            const moveX = isTouchMove ? event.touches[0].clientX : event.clientX;
            const moveY = isTouchMove ? event.touches[0].clientY : event.clientY;

            // Calculate the new position
            const mouseX = moveX - containerRect.left;
            const mouseY = moveY - containerRect.top;

            const newLeft = mouseX - offsetX;
            const newTop = mouseY - offsetY;

            card.style.position = 'absolute';
            card.style.zIndex = '1000';
            card.style.left = `${newLeft}px`;
            card.style.top = `${newTop}px`;

            console.log(`Mouse/Touch: X=${mouseX}, Y=${mouseY}`);
            console.log(`Card Position: Left=${newLeft}px, Top=${newTop}px`);
        };

        // Drop the card on mouseup/touchend
        const dropCard = () => {
            document.removeEventListener('mousemove', moveCard);
            document.removeEventListener('mouseup', dropCard);
            document.removeEventListener('touchmove', moveCard);
            document.removeEventListener('touchend', dropCard);

            console.log(`Dropping Card "${card.textContent.trim()}"`);
            const cardRect = card.getBoundingClientRect();

            // Re-enable transition after dropping
            card.style.transition = '';

            // Check for collision with grid cells
            let snapped = false;
            gridCells.forEach((cell, index) => {
                const cellRect = cell.getBoundingClientRect();

                console.log(`Checking collision with Cell "${cell.id}"`);

                if (
                    cardRect.left < cellRect.right &&
                    cardRect.right > cellRect.left &&
                    cardRect.top < cellRect.bottom &&
                    cardRect.bottom > cellRect.top
                ) {
                    console.log(`Collision detected with Cell "${cell.id}"`);

                    const isBottomRow = index >= 3; // Bottom row indices are 3, 4, 5
                    const isTopRow = index < 3; // Top row indices are 0, 1, 2

                    const isPlayerCard = card.parentElement.classList.contains('player-cards');
                    const isOpponentCard = card.parentElement.classList.contains('opponent-cards');

                    if (isPlayerCard && isBottomRow) {
                        // Snap the card to the center of the cell
                        card.style.left = `${cellRect.left - containerRect.left + (cellRect.width - card.offsetWidth) / 2}px`;
                        card.style.top = `${cellRect.top - containerRect.top + (cellRect.height - card.offsetHeight) / 2}px`;

                        console.log(`Card "${card.textContent.trim()}" snapped to Cell "${cell.id}"`);
                        
                        // Optional: Mark the cell as occupied
                        cell.setAttribute('data-occupied', 'player');
                        snapped = true;

                        // Trigger opponent card placement
                        placeOpponentCard(index - 3); // Pass the player cell index (relative to bottom row)
                    } else if (isOpponentCard && isTopRow) {
                        // Snap the card to the center of the cell
                        card.style.left = `${cellRect.left - containerRect.left + (cellRect.width - card.offsetWidth) / 2}px`;
                        card.style.top = `${cellRect.top - containerRect.top + (cellRect.height - card.offsetHeight) / 2}px`;

                        console.log(`Card "${card.textContent.trim()}" snapped to Cell "${cell.id}"`);
                        
                        // Optional: Mark the cell as occupied
                        cell.setAttribute('data-occupied', 'opponent');
                        snapped = true;
                    }
                }
            });

            if (!snapped) {
                console.log(`Card "${card.textContent.trim()}" not dropped on any valid cell. Returning to original position.`);
                
                // Return the card to its original position and rotation
                card.style.left = `${originalLeft}px`;
                card.style.top = `${originalTop}px`;
                card.style.setProperty('--rotation', originalRotation);
            }

            // Reset zIndex
            card.style.zIndex = '0';
        };

        // Add event listeners for movement and drop
        document.addEventListener('mousemove', moveCard);
        document.addEventListener('mouseup', dropCard);
        document.addEventListener('touchmove', moveCard);
        document.addEventListener('touchend', dropCard);
    };

    // Add both mouse and touch event listeners
    card.addEventListener('mousedown', startDrag);
    card.addEventListener('touchstart', startDrag);
});


// Function to simulate a drag motion for the opponent's card
function simulateDrag(card, targetCell) {
    const containerRect = container.getBoundingClientRect();
    const cellRect = targetCell.getBoundingClientRect();

    // Calculate the target position relative to the container
    const targetLeft = cellRect.left - containerRect.left + (cellRect.width - card.offsetWidth) / 2;
    const targetTop = cellRect.top - containerRect.top + (cellRect.height - card.offsetHeight) / 2;

    // Start position
    const startX = card.offsetLeft;
    const startY = card.offsetTop;

    // Distance to travel
    const distanceX = targetLeft - startX;
    const distanceY = targetTop - startY;

    // Animation duration and interval
    const duration = 500; // in milliseconds
    const steps = 60; // frames
    const stepTime = duration / steps; // time per frame
    let currentStep = 0;

    // Remove rotation
    card.style.removeProperty('--rotation');

    // Smoothly move the card to the target position
    const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;

        // Incrementally calculate the new position
        const newLeft = startX + distanceX * progress;
        const newTop = startY + distanceY * progress;

        card.style.position = 'absolute';
        card.style.left = `${newLeft}px`;
        card.style.top = `${newTop}px`;

        // End the animation when progress reaches 100%
        if (currentStep >= steps) {
            clearInterval(interval);

            // Ensure final alignment
            card.style.left = `${targetLeft}px`;
            card.style.top = `${targetTop}px`;

            console.log(`Opponent card "${card.textContent.trim()}" placed at target cell`);
        }
    }, stepTime);
}


// Updated function to place the opponent's card
function placeOpponentCard(playerCellIndex) {
    const availableOpponentCells = Array.from(gridCells).slice(0, 3); // Opponent cells are 0, 1, 2
    const targetCell = availableOpponentCells[playerCellIndex] || availableOpponentCells.find(cell => !cell.getAttribute('data-occupied'));

    if (targetCell) {
        const opponentCard = opponentCards[currentOpponentCardIndex];

        if (opponentCard) {
            console.log(`Simulating drag for opponent card "${opponentCard.textContent.trim()}" to Cell "${targetCell.id}"`);

            // Simulate dragging the card to the target cell
            simulateDrag(opponentCard, targetCell);

            // Mark the cell as occupied
            targetCell.setAttribute('data-occupied', 'opponent');
            currentOpponentCardIndex++;
        }
    }
}




