/* 
 * This JavaScript file handles the battle mechanics between Pokémon.
 * It includes functions and logic to manage Pokémon stats, moves, 
 * turn-based actions, and outcomes of battles.
 */


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
let isPlayerTurn = true;
let playerCardsOnGrid = 0;
let opponentCardsOnGrid = 0;
const cardsPlacedThisTurn = new Set(); // Track opponent cards placed in the current turn

document.addEventListener('DOMContentLoaded', () => {
    const starsContainer = document.querySelector('.stars-container');
    const numberOfStars = 100; // Adjust for more or fewer stars

    for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement('div');
        star.classList.add('star');

        // Randomize position
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;

        // Set star position
        star.style.left = `${x}px`;
        star.style.top = `${y}px`;

        // Randomize twinkle animation delay
        const delay = Math.random() * 5; // Up to 5 seconds
        star.style.animationDelay = `${delay}s`;

        starsContainer.appendChild(star);
    }
});

function updateTurnIndicator() {
    if (checkGameOver()) return;

    isPlayerTurn = !isPlayerTurn;

    setTimeout(() => {
        // Display the popup
        const turnPopup = document.getElementById('turnPopup');
        turnPopup.textContent = isPlayerTurn ? "Player Turn" : "Opponent Turn";
        turnPopup.style.animation = 'none'; // Reset animation

        // Trigger reflow to restart animation
        void turnPopup.offsetWidth;

        // Apply the animation
        turnPopup.style.animation = 'turnPopupAnimation 3s ease-in-out forwards';

    }, 500);

    // Check how many player and opponent cards are on the grid
    playerCardsOnGrid = Array.from(document.querySelectorAll('.grid-cell[data-occupied="player"]')).length;
    opponentCardsOnGrid = Array.from(document.querySelectorAll('.grid-cell[data-occupied="opponent"]')).length;

    if (!isPlayerTurn) {
        setTimeout(() => {

            opponentTurn(opponentCardsOnGrid);
        }, 2500); // Delay to ensure all animations are complete before opponent's turn
    } else if (isPlayerTurn) {
        let cardsAvailable = Array.from(document.querySelectorAll('.player-cards .card')).some(card => !card.getAttribute("data-placed")) ? 1 : 0;
        updateStatusBar(cardsAvailable, playerCardsOnGrid);
    }
}

function updateStatusBar(cardsAvailable, attacksRemaining) {
    if (cardsAvailable != null) document.getElementById('cardsAvailable').textContent = cardsAvailable;
    document.getElementById('attacksRemaining').textContent = attacksRemaining;
}

function checkGameOver() {
    const opponentCards = document.querySelectorAll('.opponent-cards .card');
    const playerCards = document.querySelectorAll('.player-cards .card');

    // Check if all opponent cards are defeated
    const allOpponentDefeated = Array.from(opponentCards).every(card => card.classList.contains('defeated'));

    // Check if all player cards are defeated
    const allPlayerDefeated = Array.from(playerCards).every(card => card.classList.contains('defeated'));

    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {
        avatar: '../img/default_img.jpg',
        name: 'Ash Ketchum',
        email: 'ash.ketchum@email.com',
        pokemonFavorite: 'Bulbasaur',
        victories: 0,
        defeats: 0
    };

    if (allOpponentDefeated) {

        // Update the victories count
        userInfo.victories += 1;

        // Save to local storage
        localStorage.setItem('userInfo', JSON.stringify(userInfo));

        displayGameOverMessage('player');
        return true; // Game over
    }

    if (allPlayerDefeated) {

        // Update the defeats count
        userInfo.defeats += 1;

        // Save to local storage
        localStorage.setItem('userInfo', JSON.stringify(userInfo));

        displayGameOverMessage('opponent');
        return true; // Game over
    }

    return false; // Game continues
}

// Display game over message with animation
function displayGameOverMessage(winner) {

    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {
        avatar: '../img/default_img.jpg',
        name: 'Ash Ketchum',
        email: 'ash.ketchum@email.com',
        pokemonFavorite: 'Bulbasaur',
        victories: 0,
        defeats: 0
    };

    const gameOverOverlay = document.createElement('div');
    gameOverOverlay.className = 'game-over-overlay';

    gameOverOverlay.innerHTML = `
        <div class="game-over-content">
            <h1 class="winner-text ${winner === 'player' ? 'player' : 'opponent'}">
                ${winner === 'player' ? '🎉 You Win! 🎉' : '💀 You Lose! 💀'}
            </h1>
            <p class="game-over-text">Game Over</p>
            <div class="scoreboard">
                <div class="score">
                    <span class="label">Victories</span>
                    <span class="player-victories">${userInfo.victories}</span>
                </div>
                <div class="score">
                    <span class="label">Defeats</span>
                    <span class="opponent-victories">${userInfo.defeats}</span>
                </div>
            </div>
            <button class="restart-button" onClick="location.reload();">Play Again</button>
        </div>
    `;

    document.body.appendChild(gameOverOverlay);
}

function showPokemonPopup() {
    const pokemonPopup = document.getElementById('pokemonPopup');
    pokemonPopup.classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', async () => {
    const battleTeam = JSON.parse(localStorage.getItem('battleTeam')) || [];

    // Check if the array is empty
    if (battleTeam.length === 0 || battleTeam.length < 5) {
        showPokemonPopup();
        
        // Remove the <main> element
        const mainElement = document.querySelector('main');
        if (mainElement) {
            mainElement.remove();
        }
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
            playerCard.setAttribute('data-name', pokemonData.name);
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
            opponentCard.setAttribute('data-name', pokemonData.name);
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
            }, index * 100); // 200ms delay for each card
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
                }, index * 100); // 200ms delay for each card
            });
        }, 500);
    }, 500);
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
    let isDragging = false;
    const dragThreshold = 10; // Minimum movement in px to start dragging

        // Common start drag handler for mouse and touch
        const startDrag = (e) => {
            e.preventDefault();
            if (isPlayerTurn) {
                
                const isTouch = e.type === 'touchstart';
                const startX = isTouch ? e.touches[0].clientX : e.clientX;
                const startY = isTouch ? e.touches[0].clientY : e.clientY;

                // Store the card's original position and rotation
                const cardRect = card.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                originalLeft = card.offsetLeft;
                originalTop = card.offsetTop;
                originalRotation = card.style.getPropertyValue('--rotation') || '';

                // Calculate offset from the touch/mouse pointer to the card's top-left corner
                offsetX = startX - cardRect.left;
                offsetY = startY - cardRect.top;

                // Enable movement
                const moveCard = (event) => {
                    const isTouchMove = event.type === 'touchmove';
                    const moveX = isTouchMove ? event.touches[0].clientX : event.clientX;
                    const moveY = isTouchMove ? event.touches[0].clientY : event.clientY;

                    // Calculate the distance moved
                    const deltaX = Math.abs(moveX - startX);
                    const deltaY = Math.abs(moveY - startY);

                    // Start dragging only if the movement exceeds the threshold
                    if (!isDragging && (deltaX > dragThreshold || deltaY > dragThreshold)) {
                        isDragging = true;
                    }

                    if (isDragging) {
                        card.style.removeProperty('--rotation');
                        card.style.transition = 'none';

                        // Calculate the new position
                        const mouseX = moveX - containerRect.left;
                        const mouseY = moveY - containerRect.top;

                        const newLeft = mouseX - offsetX;
                        const newTop = mouseY - offsetY;

                        card.style.position = 'absolute';
                        card.style.zIndex = '1000';
                        card.style.left = `${newLeft}px`;
                        card.style.top = `${newTop}px`;
                    }
                };

                // Drop the card on mouseup/touchend
                const dropCard = () => {
                    event.stopImmediatePropagation();
                    document.removeEventListener('mousemove', moveCard);
                    document.removeEventListener('mouseup', dropCard);
                    document.removeEventListener('touchmove', moveCard);
                    document.removeEventListener('touchend', dropCard);

                    if (!isDragging) {
                        card.classList.toggle('active');
                        return;
                    }

                    const cardRect = card.getBoundingClientRect();

                    // Re-enable transition after dropping
                    card.style.transition = '';
                    document.querySelector('.player-cards').style.zIndex = '4';

                    // Check for collision with grid cells
                    let snapped = false;
                    let invalidAttack = false;
                    let validAttack = false;
                    let cardAlreadyPlaced = false;
                    let cellOccupied = false;
                    let playerHasalreadyPlaced = false;

                    gridCells.forEach((cell, index) => {
                        const cellRect = cell.getBoundingClientRect();

                        if (
                            cardRect.left < cellRect.right &&
                            cardRect.right > cellRect.left &&
                            cardRect.top < cellRect.bottom &&
                            cardRect.bottom > cellRect.top &&
                            isPlayerTurn
                        ) {

                            const isBottomRow = index >= 3; // Bottom row indices are 3, 4, 5
                            const isTopRow = index < 3; // Top row indices are 0, 1, 2

                            const isPlayerCard = card.parentElement.classList.contains('player-cards');

                            if (isPlayerCard) {

                                if (isBottomRow && cardsPlacedThisTurn.size === 0) {
                                    // Check if the card is already placed in a grid cell
                                    if (card.getAttribute('data-placed') === 'true') {
                                        playInvalidActionAnimation(card, `${originalLeft}px`, `${originalTop}px`);
                                        cardAlreadyPlaced = true;
                                    }
                                    else if (cell.getAttribute('data-occupied') === 'player') {
                                        playInvalidActionAnimation(card, `${originalLeft}px`, `${originalTop}px`);
                                        cellOccupied = true;
                                    }
                                    else {
                                        // Snap the card to the center of the player's grid cell
                                        card.style.left = `${cellRect.left - containerRect.left + (cellRect.width - card.offsetWidth) / 2}px`;
                                        card.style.top = `${cellRect.top - containerRect.top + (cellRect.height - card.offsetHeight) / 2}px`;
                                        cell.setAttribute('data-occupied', 'player');
                                        card.setAttribute('data-placed', 'true'); // Mark card as placed
                                        updateStatusBar(0, playerCardsOnGrid);
                                        snapped = true;

                                        // Add the placed card to the current turn set
                                        cardsPlacedThisTurn.add(card);

                                        if (playerCardsOnGrid === 0) {
                                            updateTurnIndicator();
                                        }
                                    }
                                }
                                else if (isBottomRow && cardsPlacedThisTurn.size === 1) {
                                    playInvalidActionAnimation(card, `${originalLeft}px`, `${originalTop}px`);
                                    playerHasalreadyPlaced = true;
                                }
                                else if (isTopRow) {
                                    // Check if there's an opponent card in the cell
                                    const opponentCard = opponentCards.find((card, index) => {
                                        const opponentCardRect = card.getBoundingClientRect();
                                        return (
                                            opponentCardRect.left < cellRect.right &&
                                            opponentCardRect.right > cellRect.left &&
                                            opponentCardRect.top < cellRect.bottom &&
                                            opponentCardRect.bottom > cellRect.top
                                        );
                                    });

                                    if (!opponentCard) {
                                        invalidAttack = true;
                                        playInvalidActionAnimation(card, `${originalLeft}px`, `${originalTop}px`); // Pass original position
                                    }
                                    if (opponentCard && !cardsPlacedThisTurn.has(card) && card.getAttribute('data-placed') === 'true') {
                                        validAttack = true;

                                        const indexPlayerCard = myPokemons.findIndex(p => p.name === card.getAttribute('data-name'));
                                        const indexOpponentCard = opponentPokemons.findIndex(p => p.name === opponentCard.getAttribute('data-name'));

                                        // Play attack animation and reset the player card after it completes
                                        playAttackOpponentAnimation(card, opponentCard, () => {
                                            card.style.left = `${originalLeft}px`;
                                            card.style.top = `${originalTop}px`;
                                            card.style.transition = 'all 0.5s ease'; // Smooth transition back
                                            let dmgToDefense = 0;
                                            let dmgToHp = 0;

                                            if (opponentPokemons[indexOpponentCard].stats[2].base_stat > 0) {
                                                opponentPokemons[indexOpponentCard].stats[2].base_stat = opponentPokemons[indexOpponentCard].stats[2].base_stat - myPokemons[indexPlayerCard].stats[1].base_stat;
                                                dmgToDefense = myPokemons[indexPlayerCard].stats[1].base_stat;

                                                showDamage(opponentCard, `${dmgToDefense} DEF`, "orange");

                                                if (opponentPokemons[indexOpponentCard].stats[2].base_stat < 0) {
                                                    dmgToDefense = myPokemons[indexPlayerCard].stats[1].base_stat - Math.abs(opponentPokemons[indexOpponentCard].stats[2].base_stat);
                                                    dmgToHp = Math.abs(opponentPokemons[indexOpponentCard].stats[2].base_stat);
                                                    opponentPokemons[indexOpponentCard].stats[0].base_stat = opponentPokemons[indexOpponentCard].stats[0].base_stat - dmgToHp;
                                                    opponentPokemons[indexOpponentCard].stats[2].base_stat = 0;
                                                    setTimeout(() => {
                                                        document.querySelector('.player-cards').style.zIndex = '3';
                                                        showDamage(opponentCard, `${dmgToHp} HP`, "red");
                                                        
                                                        if (opponentPokemons[indexOpponentCard].stats[0].base_stat <= 0) {
                                                            opponentCard.classList.add('defeated');
                                                        
                                                            // Listen for the animation end to remove the card and clean up
                                                            opponentCard.addEventListener('animationend', () => {
                                                        
                                                                // Remove the card from the DOM and opponentPokemons array
                                                                opponentPokemons.splice(indexOpponentCard, 1);
                                                                opponentCard.remove();
                                                                cell.setAttribute('data-occupied', '');
                                                                opponentCardsOnGrid--;

                                                                if (checkGameOver()) return;

                                                                if (playerCardsOnGrid <= 0 || opponentCardsOnGrid <= 0) {
                                                                    // Initialize turn indicator
                                                                    updateTurnIndicator();
                                                                }
                                                                    
                                                            }, { once: true }); // Ensure the listener is only triggered once
                                                            return;
                                                        } else { 
                                                            if (playerCardsOnGrid === 0) {
                                                                // Initialize turn indicator
                                                                updateTurnIndicator();
                                                            }
                                                        }
                                                    }, 1000);


                                                } else {
                                                    
                                                    if (playerCardsOnGrid === 0) {
                                                        // Initialize turn indicator
                                                        updateTurnIndicator();
                                                    }
                                                }
                                                
                                            } else {
                                                dmgToHp = myPokemons[indexPlayerCard].stats[1].base_stat;
                                                showDamage(opponentCard, `${dmgToHp} HP`, "red");
                                                opponentPokemons[indexOpponentCard].stats[0].base_stat = opponentPokemons[indexOpponentCard].stats[0].base_stat - myPokemons[indexPlayerCard].stats[1].base_stat;

                                                if (opponentPokemons[indexOpponentCard].stats[0].base_stat <= 0) {
                                                    opponentCard.classList.add('defeated');
                                                
                                                    // Listen for the animation end to remove the card and clean up
                                                    opponentCard.addEventListener('animationend', () => {
                                                
                                                        // Remove the card from the DOM and opponentPokemons array
                                                        opponentPokemons.splice(indexOpponentCard, 1);
                                                        opponentCard.remove();
                                                        cell.setAttribute('data-occupied', '');

                                                        if (checkGameOver()) return;

                                                        opponentCardsOnGrid--;

                                                        if (playerCardsOnGrid <= 0 || opponentCardsOnGrid <= 0) {
                                                            // Initialize turn indicator
                                                            updateTurnIndicator();
                                                        }
                                                    }, { once: true }); // Ensure the listener is only triggered once
                                                }
                                                else {
                                                    if (playerCardsOnGrid === 0) {
                                                        // Initialize turn indicator
                                                        updateTurnIndicator();
                                                    }
                                                }
                                            }

                                            // Extract stats
                                            const stats = opponentPokemons[indexOpponentCard].stats.reduce((acc, stat) => {
                                                acc[stat.stat.name] = stat.base_stat;
                                                return acc;
                                            }, {});

                                            const pokemonImage =
                                                opponentPokemons[indexOpponentCard].sprites.other['official-artwork'].front_default ||
                                                opponentPokemons[indexOpponentCard].sprites.front_default;

                                            const typeHtml = opponentPokemons[indexOpponentCard].types.map((item) => {
                                                return `<span style="background-color: ${typeColors[item.type.name]}"}>${item.type.name}</span>`;
                                            }).join("");

                                            opponentCard.innerHTML = `
                                                <div class="front">
                                                    <img class="poke-img" src=${pokemonImage} alt="${opponentPokemons[indexOpponentCard].name}" />
                                                    <h2 class="poke-name">${opponentPokemons[indexOpponentCard].name.charAt(0).toUpperCase() + opponentPokemons[indexOpponentCard].name.slice(1).toLowerCase()}</h2>
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
                                        });

                                        playerCardsOnGrid--;
                                        updateStatusBar(null, playerCardsOnGrid);
                                    }
                                    else {
                                        playInvalidActionAnimation(card, `${originalLeft}px`, `${originalTop}px`);
                                        cardAlreadyPlaced = true;
                                    }
                                }
                            }
                        }
                    });

                    if (!snapped && !invalidAttack && !validAttack && !cardAlreadyPlaced && !cellOccupied && !playerHasalreadyPlaced) {

                        // Return the card to its original position and rotation
                        card.style.left = `${originalLeft}px`;
                        card.style.top = `${originalTop}px`;
                        card.style.setProperty('--rotation', originalRotation);
                    }

                    // Reset zIndex
                    if (!snapped && !invalidAttack && !validAttack && !cardAlreadyPlaced && !cellOccupied) {
                        card.style.zIndex = '0';
                    }
                    else {
                        setTimeout(() => {
                            card.style.zIndex = '0';
                        }, 1000);
                    }
                    isDragging = false; // Reset dragging state
                };

                // Add event listeners for movement and drop
                document.addEventListener('mousemove', moveCard);
                document.addEventListener('mouseup', dropCard);
                document.addEventListener('touchmove', moveCard);
                document.addEventListener('touchend', dropCard);
            };
        }

        // Add both mouse and touch event listeners
        card.addEventListener('mousedown', startDrag);
        card.addEventListener('touchstart', startDrag);
        card.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            displayGameOverMessage('player');
        });

});

// Function to display damage
function showDamage(card, damageText, color = "red") {
    const damageElement = document.createElement("div");
    damageElement.className = "damage-display";
    damageElement.textContent = `-${damageText}`;
    damageElement.style.color = color;

    // Position the damage display over the card
    const cardRect = card.getBoundingClientRect();
    const containerRect = document.body.getBoundingClientRect();

    damageElement.style.left = `${cardRect.left + cardRect.width / 2 - containerRect.left}px`;
    damageElement.style.top = `${cardRect.top - containerRect.top}px`;

    document.body.appendChild(damageElement);

    // Remove the element after the animation
    setTimeout(() => {
        damageElement.remove();
    }, 1500); // Match the animation duration
}


// Function to play "can't do this" animation and return the card to its original position
function playInvalidActionAnimation(card, originalLeft, originalTop) {
    // Apply wiggle animation to the card
    card.style.animation = 'wiggle 0.5s ease';

    // Wait for the wiggle animation to complete
    setTimeout(() => {
        card.style.animation = ''; // Remove animation

        // Restore card to its original position
        card.style.transition = 'all 0.5s ease'; // Smooth transition back
        card.style.left = originalLeft;
        card.style.top = originalTop;
        card.style.setProperty('--rotation', originalRotation);
    }, 500); // Match the duration of the wiggle animation
}

function playAttackOpponentAnimation(playerCard, opponentCard, callback) {
    // Clear any ongoing animation to reapply it
    playerCard.style.animation = 'none';

    // Delay to allow the "none" state to register
    setTimeout(() => {
        // Apply attack animation to the player's card
        playerCard.style.animation = 'attack 0.6s ease';
        playerCard.style.zIndex = '9999';
        document.querySelector('.player-cards').style.zIndex = '4';

        // Delay applying the hit animation to the opponent card until the player's card reaches it
        setTimeout(() => {
            opponentCard.style.animation = 'hit 1s ease';

            // Remove the hit animation after it completes
            setTimeout(() => {
                opponentCard.style.animation = ''; // Reset opponent card animation
                playerCard.style.zIndex = '3';
                document.querySelector('.player-cards').style.zIndex = '3';

            }, 1000); // Match the duration of the hit animation
            // Execute the callback after all animations are done
            if (callback) callback();
        }, 500); // Trigger hit animation halfway through the player's attack animation
    }, 50); // Slight delay to ensure "none" state is applied
}

function playAttackPlayerAnimation(playerCard, opponentCard, callback) {
    // Clear any ongoing animation to reapply it
    playerCard.style.animation = 'none';

    // Delay to allow the "none" state to register
    setTimeout(() => {
        // Apply attack animation to the player's card
        playerCard.style.animation = 'attack 0.6s ease';
        playerCard.style.zIndex = '9999';
        document.querySelector('.opponent-cards').style.zIndex = '4';

        // Delay applying the hit animation to the opponent card until the player's card reaches it
        setTimeout(() => {
            opponentCard.style.animation = 'hit 1s ease';

            // Remove the hit animation after it completes
            setTimeout(() => {
                opponentCard.style.animation = ''; // Reset opponent card animation
                playerCard.style.zIndex = '2';
                document.querySelector('.opponent-cards').style.zIndex = '2';

            }, 1000); // Match the duration of the hit animation
            // Execute the callback after all animations are done
            if (callback) callback();
        }, 500); // Trigger hit animation halfway through the player's attack animation
    }, 50); // Slight delay to ensure "none" state is applied
}

function opponentTurn(numberOfAttacks) {

    // Trigger opponent card placement
    placeOpponentCard();

    // Opponent attack
    setTimeout(() => {
        opponentAttack(numberOfAttacks);
    }, 1000); // Slight delay for clarity between placement and attack

    // Initialize turn indicator
    setTimeout(() => {
        updateTurnIndicator();
    }, 1000 + (numberOfAttacks * 3000)); // Delay to ensure all attack animations complete before switching turns
}

function opponentAttack(numberOfAttacks) {

    const opponentCells = Array.from(document.querySelectorAll('.grid-cell[data-occupied="opponent"]')); // Opponent's cells
    const playerCells = Array.from(document.querySelectorAll('.grid-cell[data-occupied="player"]')); // Player's cells

    // Filter out opponent cards that are placed on the grid and not placed this turn
    const placedOpponentCards = opponentCards.filter(card => {
        const cardRect = card.getBoundingClientRect();
        return opponentCells.some(cell => {
            const cellRect = cell.getBoundingClientRect();
            return (
                cardRect.left >= cellRect.left - 10 &&
                cardRect.right <= cellRect.right + 10 &&
                cardRect.top >= cellRect.top - 10 &&
                cardRect.bottom <= cellRect.bottom + 10
            );
        }) && !cardsPlacedThisTurn.has(card); // Exclude cards placed this turn
    });

    // Shuffle placed opponent cards for randomness
    const shuffledOpponentCards = placedOpponentCards.sort(() => Math.random() - 0.5);

    // Perform attacks
    for (let i = 0; i < numberOfAttacks; i++) {
        setTimeout(() => {
            if (checkGameOver()) return;
            
            const attackerCard = shuffledOpponentCards[i];

            if (attackerCard) {

                const playerCells = Array.from(document.querySelectorAll('.grid-cell[data-occupied="player"]'));

                // Randomize the order of player cells for random target selection
                const shuffledPlayerCells = playerCells.sort(() => Math.random() - 0.5);
                
                // Randomly select a target player card for each attack
                const targetCell = shuffledPlayerCells[Math.floor(Math.random() * shuffledPlayerCells.length)];
                const targetCard = Array.from(document.querySelectorAll('.player-cards .card')).find(card => {
                    const cardRect = card.getBoundingClientRect();
                    const cellRect = targetCell.getBoundingClientRect();
                    return (
                        cardRect.left >= cellRect.left - 10 &&
                        cardRect.right <= cellRect.right + 10 &&
                        cardRect.top >= cellRect.top - 10 &&
                        cardRect.bottom <= cellRect.bottom + 10
                    );
                });

                if (targetCard) {
                    simulateAttack(attackerCard, targetCard, targetCell);
                }
            }
        }, i * 3000);
    }

    // Clear cards placed this turn after all attacks
    setTimeout(() => {
        cardsPlacedThisTurn.clear();
    }, numberOfAttacks * 3000);
}



function simulateAttack(attackerCard, targetCard, targetCell) {
    const targetRect = targetCard.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Calculate the position of the target card relative to the container
    const targetLeft = targetRect.left - containerRect.left + (targetRect.width - attackerCard.offsetWidth) / 2;
    const targetTop = targetRect.top - containerRect.top + (targetRect.height - attackerCard.offsetHeight) / 2;

    // Save the original position of the attacker card
    const originalLeft = attackerCard.offsetLeft;
    const originalTop = attackerCard.offsetTop;

    // Animate attacker card toward the target
    attackerCard.style.transition = 'all 0.6s ease';
    attackerCard.style.left = `${targetLeft}px`;
    attackerCard.style.top = `${targetTop}px`;
    document.querySelector('.opponent-cards').style.zIndex = `4`;

    setTimeout(() => {
        // Play attack animation
        playAttackPlayerAnimation(attackerCard, targetCard, () => {

            // Reset attacker card to its original position
            attackerCard.style.left = `${originalLeft}px`;
            attackerCard.style.top = `${originalTop}px`;
            attackerCard.style.transition = 'all 0.6s ease';

            const indexOpponentCard = opponentPokemons.findIndex(p => p.name === attackerCard.getAttribute('data-name'));
            const indexPlayerCard = myPokemons.findIndex(p => p.name === targetCard.getAttribute('data-name'));
            let dmgToDefense = 0;
            let dmgToHp = 0;

            if (myPokemons[indexPlayerCard].stats[2].base_stat > 0) {
                myPokemons[indexPlayerCard].stats[2].base_stat = myPokemons[indexPlayerCard].stats[2].base_stat - opponentPokemons[indexOpponentCard].stats[1].base_stat;
                dmgToDefense = opponentPokemons[indexOpponentCard].stats[1].base_stat;

                if (myPokemons[indexPlayerCard].stats[2].base_stat < 0) {
                    dmgToDefense = opponentPokemons[indexOpponentCard].stats[1].base_stat - Math.abs(myPokemons[indexPlayerCard].stats[2].base_stat);
                    dmgToHp = Math.abs(myPokemons[indexPlayerCard].stats[2].base_stat);
                    myPokemons[indexPlayerCard].stats[0].base_stat = myPokemons[indexPlayerCard].stats[0].base_stat - dmgToHp;
                    myPokemons[indexPlayerCard].stats[2].base_stat = 0;
                    setTimeout(() => {
                        document.querySelector('.opponent-cards').style.zIndex = `2`;
                        showDamage(targetCard, `${dmgToHp} HP`, "red");

                        if (myPokemons[indexPlayerCard].stats[0].base_stat <= 0) {
                            targetCard.classList.add('defeated');
                        
                            // Listen for the animation end to remove the card and clean up
                            targetCard.addEventListener('animationend', () => {
                        
                                // Remove the card from the DOM and opponentPokemons array
                                myPokemons.splice(indexPlayerCard, 1);
                                targetCard.remove();
                                targetCell.setAttribute('data-occupied', '');
                            }, { once: true }); // Ensure the listener is only triggered once
                            return;
                        }
                    }, 1000);
                }
                showDamage(targetCard, `${dmgToDefense} DEF`, "orange");
            } else {
                dmgToHp = opponentPokemons[indexOpponentCard].stats[1].base_stat;
                showDamage(targetCard, `${dmgToHp} HP`, "red");
                myPokemons[indexPlayerCard].stats[0].base_stat = myPokemons[indexPlayerCard].stats[0].base_stat - opponentPokemons[indexOpponentCard].stats[1].base_stat;

                if (myPokemons[indexPlayerCard].stats[0].base_stat <= 0) {
                    targetCard.classList.add('defeated');
                
                    // Listen for the animation end to remove the card and clean up
                    targetCard.addEventListener('animationend', () => {
                
                        // Remove the card from the DOM and opponentPokemons array
                        myPokemons.splice(indexPlayerCard, 1);
                        targetCard.remove();
                        targetCell.setAttribute('data-occupied', '');
                    }, { once: true }); // Ensure the listener is only triggered once
                    return;
                }
            }

            // Extract stats
            const stats = myPokemons[indexPlayerCard].stats.reduce((acc, stat) => {
                acc[stat.stat.name] = stat.base_stat;
                return acc;
            }, {});

            const pokemonImage =
                myPokemons[indexPlayerCard].sprites.other['official-artwork'].front_default ||
                myPokemons[indexPlayerCard].sprites.front_default;

            const typeHtml = myPokemons[indexPlayerCard].types.map((item) => {
                return `<span style="background-color: ${typeColors[item.type.name]}"}>${item.type.name}</span>`;
            }).join("");

            targetCard.innerHTML = `
                <div class="front">
                    <img class="poke-img" src=${pokemonImage} alt="${myPokemons[indexPlayerCard].name}" />
                    <h2 class="poke-name">${myPokemons[indexPlayerCard].name.charAt(0).toUpperCase() + myPokemons[indexPlayerCard].name.slice(1).toLowerCase()}</h2>
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
        });
    }, 600); // Match the timing of the movement animation
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
        }
    }, stepTime);
}


// Updated function to place the opponent's card
function placeOpponentCard() {
    const playerCells = Array.from(gridCells).slice(3, 6); // Player cells are 3, 4, 5 (bottom row)
    const opponentCells = Array.from(gridCells).slice(0, 3); // Opponent cells are 0, 1, 2 (top row)

    let targetCell = null;

    // Check for player cards and match corresponding opponent cells
    for (let i = 0; i < playerCells.length; i++) {
        const playerCell = playerCells[i];
        const opponentCell = opponentCells[i];

        if (playerCell.getAttribute('data-occupied') === 'player' && !opponentCell.getAttribute('data-occupied')) {
            targetCell = opponentCell;
            break;
        }
    }

    // If no matching cell is found, pick the next available opponent cell
    if (!targetCell) {
        targetCell = opponentCells.find(cell => !cell.getAttribute('data-occupied'));
    }

    if (targetCell) {
        const opponentCard = opponentCards[currentOpponentCardIndex];

        if (opponentCard) {

            // Simulate dragging the card to the target cell
            simulateDrag(opponentCard, targetCell);

            // Mark the cell as occupied
            targetCell.setAttribute('data-occupied', 'opponent');
            currentOpponentCardIndex++;

            // Add the placed card to the current turn set
            cardsPlacedThisTurn.add(opponentCard);
        }
    }
}






