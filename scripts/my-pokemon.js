const gameArea = document.getElementById("gameArea");
const pokemon = document.getElementById("pokemon");
const pokeball = document.getElementById("pokeball");

// Define the common spawn area
const spawnArea = {
    minTop: 15, // Minimum % from the top of the game area
    maxTop: 50, // Maximum % from the top of the game area
    minLeft: 15, // Minimum % from the left of the game area
    maxLeft: 50, // Maximum % from the left of the game area
};

// Fetch a random Pokémon and spawn it within the defined area
async function fetchPokemon() {
    const randomId = Math.floor(Math.random() * 150) + 1;
    console.log("Fetching Pokémon with ID:", randomId);
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
    const data = await response.json();
    const sprite = data.sprites.front_default;

    console.log("Fetched Pokémon:", data.name);
    console.log("Pokémon sprite URL:", sprite);

    // Set the Pokémon sprite
    pokemon.style.backgroundImage = `url(${sprite})`;

    // Randomize position within the spawn area
    const top = `${Math.random() * (spawnArea.maxTop - spawnArea.minTop) + spawnArea.minTop}%`;
    const left = `${Math.random() * (spawnArea.maxLeft - spawnArea.minLeft) + spawnArea.minLeft}%`;
    pokemon.style.top = top;
    pokemon.style.left = left;

    console.log(`Pokémon positioned at top: ${top}, left: ${left}`);
}

// Variables to track throw movement
let isDragging = false;
let startX, startY, lastX, lastY, lastTime, velocityX, velocityY;

// Function to handle dragging start (mouse and touch)
function handleDragStart(e) {
  e.preventDefault(); // Prevent default browser drag behavior
  isDragging = true;
  const touch = e.touches ? e.touches[0] : e; // Handle touch and mouse events
  startX = touch.clientX;
  startY = touch.clientY;
  lastX = startX;
  lastY = startY;
  lastTime = Date.now(); // Capture the time of the drag start
  velocityX = 0;
  velocityY = 0;

  console.log("Drag started at:", { startX, startY });

  // Remove idle animation
  pokeball.style.animation = "none";
  pokeball.style.transition = "none"; // Disable smooth movement during drag
}

// Function to handle dragging (mouse and touch)
function handleDragMove(e) {
  if (!isDragging) return;

  const touch = e.touches ? e.touches[0] : e; // Handle touch and mouse events
  const currentX = touch.clientX;
  const currentY = touch.clientY;
  const currentTime = Date.now();

  // Calculate time difference
  const timeDiff = currentTime - lastTime;

  // Calculate velocity (pixels per millisecond)
  velocityX = (currentX - lastX) / timeDiff;
  velocityY = (currentY - lastY) / timeDiff;

  console.log("Mouse moved to:", { currentX, currentY });
  console.log("Time difference:", timeDiff, "ms");
  console.log("Calculated velocity:", { velocityX, velocityY });

  // Move PokéBall with mouse or touch
  const offsetX = currentX - lastX;
  const offsetY = currentY - lastY;
  pokeball.style.left = `${pokeball.offsetLeft + offsetX}px`;
  pokeball.style.top = `${pokeball.offsetTop + offsetY}px`;

  // Update last position and time
  lastX = currentX;
  lastY = currentY;
  lastTime = currentTime;
}

// Function to handle dragging end (mouse and touch)
function handleDragEnd() {
  if (!isDragging) return;
  isDragging = false;

  console.log("Drag released. Final velocity:", { velocityX, velocityY,  });

  // Check if velocity is too low
  if (Math.abs(velocityX) < 0.2 && Math.abs(velocityY) < 0.2) {
    console.log("Velocity too low. Returning PokéBall to dock." + Math.abs(velocityX) +  '  ' +  Math.abs(velocityY) < 0.2);
    animateBackToDock(); // Reset to original position
    return;
  }

  // Simulate a throw based on velocity
  pokeball.style.transition = "transform 1s linear";
  const throwMultiplier = 250; // Adjust multiplier to scale the throw distance
  const finalX = velocityX * throwMultiplier;
  const finalY = velocityY * throwMultiplier;

  console.log("Throw final position multiplier applied:", { finalX, finalY });

  // Move PokéBall
  pokeball.style.transform = `translate(${finalX}px, ${finalY}px)`;

  // Check for collision after throw completes
  setTimeout(() => {
    const ballRect = pokeball.getBoundingClientRect();
    const pokemonRect = pokemon.getBoundingClientRect();

    console.log("PokéBall bounding rect:", ballRect);
    console.log("Pokémon bounding rect:", pokemonRect);

    if (
      ballRect.left < pokemonRect.right &&
      ballRect.right > pokemonRect.left &&
      ballRect.top < pokemonRect.bottom &&
      ballRect.bottom > pokemonRect.top
    ) {
      console.log("Collision detected! Pokémon caught.");
      alert("You caught the Pokémon!");
      fetchPokemon(); // Load a new Pokémon
    } else {
      console.log("No collision. Pokémon escaped.");
      alert("The Pokémon escaped!");
    }

    // Reset PokéBall position
    pokeball.style.transition = "none";
    pokeball.style.transform = "none";
    pokeball.style.left = "50%";
    pokeball.style.top = "auto";
    pokeball.style.bottom = "25px";
    pokeball.style.transform = "translateX(-50%)";

    // Restore idle animation
    pokeball.style.animation = "pokeballBounce 1s infinite";

    console.log("PokéBall reset to initial position.");
  }, 1000);
}

// Function to animate PokéBall back to dock
function animateBackToDock() {
    console.log("Animating PokéBall back to dock...");
  
    // Smooth animation back to dock
    pokeball.style.transition = "all 0.5s ease-in-out"; // Smoothly transition position and transform
    pokeball.style.left = "50%"; // Center horizontally
    pokeball.style.bottom = "25px"; // Align to the dock
    pokeball.style.top = "0"; // Reset Y-axis interference
    pokeball.style.transform = "translateX(-50%)"; // Center X-axis
  
    // Restore bouncing animation after returning to dock
    setTimeout(() => {
      pokeball.style.transition = "none"; // Remove the smooth transition
      pokeball.style.animation = "pokeballBounce 1.2s infinite"; // Restore bounce
      console.log("PokéBall returned to dock and bouncing animation restored.");
    }, 500); // Match the duration of the smooth animation
  }
  

// Add event listeners for both mouse and touch events
pokeball.addEventListener("mousedown", handleDragStart);
document.addEventListener("mousemove", handleDragMove);
document.addEventListener("mouseup", handleDragEnd);

pokeball.addEventListener("touchstart", handleDragStart);
document.addEventListener("touchmove", handleDragMove);
document.addEventListener("touchend", handleDragEnd);

// Load the first Pokémon
console.log("Game initialized. Loading the first Pokémon...");
fetchPokemon();
