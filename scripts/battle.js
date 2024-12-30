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

// Variables to save the player and opponent pokemons
let myPokemons = [];
let opponentPokemons = [];

document.addEventListener('DOMContentLoaded', async () => {
    const battleTeam = JSON.parse(localStorage.getItem('battleTeam')) || [];

    // Check if the array is empty
    if (battleTeam.length === 0 || battleTeam.length < 5) {
        console.log('Battle team is empty or is not 5 pokemons');
        return;
    }

    // Get the player cards
    battleTeam.forEach(async (pokemon, index) => {
        const playerCard = document.getElementById(`player-card-${index + 1}`);
        if (playerCard) {
            const pokemonData = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`).then(res => res.json());
            myPokemons.push(pokemonData);

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
                    <img class="poke-img" src=${pokemonImage} alt="${pokemonData.name}" />
                    <h2 class="poke-name">${pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1).toLowerCase()}</h2>
                    <p class="hp">
                        <span>HP</span>
                        ${stats.hp}
                    </p>
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

    // Get the opponent cards
    const getRandomPokemon = async () => {
        const randomId = Math.floor(Math.random() * 1000) + 1;
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
        return response.json();
    };

    for (let i = 0; i < 5; i++) {
        const pokemonData = await getRandomPokemon();
        opponentPokemons.push(pokemonData);
    
        const opponentCard = document.getElementById(`opponent-card-${i + 1}`);
        if (opponentCard) {
            const primaryType = pokemonData.types[0].type.name;
            const backgroundColor = typeColors[primaryType] || '#ffffff';
    
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
    
            opponentCard.innerHTML = `
                <div class="front">
                    <img class="poke-img" src=${pokemonImage} alt="${pokemonData.name}" />
                    <h2 class="poke-name">${pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1).toLowerCase()}</h2>
                    <p class="hp">
                        <span>HP</span>
                        ${stats.hp}
                    </p>
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
            opponentCard.style.background = `radial-gradient(circle at 50% 0%, ${backgroundColor} 36%, #ffffff 36%)`;
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const playerCards = document.querySelectorAll('.player-cards .card');
    const opponentCards = document.querySelectorAll('.opponent-cards .card');
    const battlefield = document.querySelector('.battlefield');

    // Animate battlefield
    battlefield.style.animation = 'scaleInBatlefield 0.8s ease-in-out forwards';

    setTimeout(() => {
        // Animate player cards
        playerCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.animation = 'scaleInCards 0.5s ease-in-out forwards';

                // Add a one-time event listener to reset animation property
                card.addEventListener('animationend', () => {
                    card.style.animation = ''; // Clear the animation property
                    card.classList.add('card-scaled'); // Add the "card-scaled" class
                }, { once: true });
            }, index * 200); // 200ms delay for each card
        });

        setTimeout(() => {
            // Animate opponent cards
            opponentCards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.animation = 'scaleInCards 0.5s ease-in-out forwards';

                    // Add a one-time event listener to reset animation property
                    card.addEventListener('animationend', () => {
                        card.style.animation = ''; // Clear the animation property
                        card.classList.add('card-scaled'); // Add the "card-scaled" class
                    }, { once: true });
                }, index * 200); // 200ms delay for each card
            });
        }, 1000);
    }, 800);
});

const cards = document.querySelectorAll('.card');
const gridCells = document.querySelectorAll('.grid-cell');
const container = document.querySelector('main'); // Use the common container for cards and grid

const opponentCards = Array.from(document.querySelectorAll('.opponent-cards .card'));
let currentOpponentCardIndex = 0; // Track which opponent card to place

let originalRotation = '';

cards.forEach(card => {
    let offsetX = 0, offsetY = 0;
    let originalLeft = 0, originalTop = 0;
    

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
            event.stopImmediatePropagation();
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
            let invalidAttack = false;
            let validAttack = false;
        
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
        
                    if (isPlayerCard) {
                        if (isBottomRow) {
                            // Snap the card to the center of the player's grid cell
                            card.style.left = `${cellRect.left - containerRect.left + (cellRect.width - card.offsetWidth) / 2}px`;
                            card.style.top = `${cellRect.top - containerRect.top + (cellRect.height - card.offsetHeight) / 2}px`;
        
                            console.log(`Card "${card.textContent.trim()}" snapped to Cell "${cell.id}"`);
                            cell.setAttribute('data-occupied', 'player');
                            snapped = true;
        
                            // Trigger opponent card placement
                            placeOpponentCard(index - 3);
                        } else if (isTopRow) {
                            // Check if there's an opponent card in the cell
                            const opponentCard = opponentCards.find((card) => {
                                const opponentCardRect = card.getBoundingClientRect();
                                return (
                                    opponentCardRect.left < cellRect.right &&
                                    opponentCardRect.right > cellRect.left &&
                                    opponentCardRect.top < cellRect.bottom &&
                                    opponentCardRect.bottom > cellRect.top
                                );
                            });
        
                            if (!opponentCard) {
                                console.log(`Invalid attack attempt to Cell "${cell.id}"`);
                                invalidAttack = true;
                                playInvalidActionAnimation(card, `${originalLeft}px`, `${originalTop}px`); // Pass original position
                            }
                            if (opponentCard) {
                                console.log(`Valid attack on Opponent Card "${opponentCard.textContent.trim()}"`);
                                validAttack = true;
                            
                                // Play attack animation and reset the player card after it completes
                                playAttackAnimation(card, opponentCard, () => {
                                    console.log('Attack sequence completed');
                                    card.style.left = `${originalLeft}px`;
                                    card.style.top = `${originalTop}px`;
                                    card.style.transition = 'all 0.5s ease'; // Smooth transition back
                                });
                            }
                        }
                    }
                }
            });
        
            if (!snapped && !invalidAttack && !validAttack) {
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
    card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        card.classList.toggle('active');
    });
});

// Function to play "can't do this" animation and return the card to its original position
function playInvalidActionAnimation(card, originalLeft, originalTop) {
    // Apply wiggle animation to the card
    card.style.animation = 'wiggle 0.5s ease';

    // Wait for the wiggle animation to complete
    setTimeout(() => {
        card.style.animation = ''; // Remove animation
        console.log('Invalid action animation completed');

        // Restore card to its original position
        card.style.transition = 'all 0.5s ease'; // Smooth transition back
        card.style.left = originalLeft;
        card.style.top = originalTop;
        card.style.setProperty('--rotation', originalRotation);
    }, 500); // Match the duration of the wiggle animation
}

function playAttackAnimation(playerCard, opponentCard, callback) {
    // Clear any ongoing animation to reapply it
    playerCard.style.animation = 'none';

    // Delay to allow the "none" state to register
    setTimeout(() => {
        // Apply attack animation to the player's card
        playerCard.style.animation = 'attack 0.6s ease';

        // Delay applying the hit animation to the opponent card until the player's card reaches it
        setTimeout(() => {
            opponentCard.style.animation = 'hit 1s ease';

            // Remove the hit animation after it completes
            setTimeout(() => {
                opponentCard.style.animation = ''; // Reset opponent card animation
                console.log('Opponent hit animation completed');

                
            }, 1000); // Match the duration of the hit animation
            // Execute the callback after all animations are done
            if (callback) callback();
        }, 500); // Trigger hit animation halfway through the player's attack animation
    }, 50); // Slight delay to ensure "none" state is applied
}

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




