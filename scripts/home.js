/*
 * This JavaScript file manages the functionality of the homepage carousel.
 * It includes logic for initializing the carousel, handling slide transitions,
 * creating interactive navigation dots, and ensuring seamless looping of slides.
 * The carousel is animated and allows users to navigate through slides by clicking on the dots.
 */


document.addEventListener("DOMContentLoaded", () => {
    const carouselInner = document.querySelector('.carousel-inner');
    const slides = [...document.querySelectorAll('.carousel-item')];
    const dotsContainer = document.querySelector('.carousel-dots');
    const totalSlides = slides.length;

    // Variables for animation
    let translateX = 0;
    const slideWidth = slides[0].offsetWidth + 10; // Includes the gap
    const animationSpeed = 0.5; // Movement per frame in pixels
    let currentIndex = 0;

    // Duplicate slides for seamless looping
    slides.forEach(slide => {
        const clone = slide.cloneNode(true);
        carouselInner.appendChild(clone);
    });

    // Create interactive dots
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('carousel-dot');
        if (index === 0) dot.classList.add('active'); // Highlight the first dot
        dot.addEventListener('click', () => goToSlide(index)); // Navigate to slide on click
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.carousel-dot');

    // Function to update active dot
    function updateDots(index) {
        dots.forEach(dot => dot.classList.remove('active'));
        dots[index].classList.add('active');
    }

    // Function to navigate to a specific slide
    function goToSlide(index) {
        currentIndex = index;
        if (currentIndex != 0) {
            translateX = -(currentIndex * slideWidth) + 400; //400 to put the image on the center
        }
        else {
            translateX = -(currentIndex * slideWidth);
        }
        carouselInner.style.transition = 'transform 0.5s ease'; // Smooth transition
        carouselInner.style.transform = `translateX(${translateX}px)`;
        updateDots(currentIndex);
    }

    // Function to animate the carousel
    function animateCarousel() {
        translateX -= animationSpeed; // Move left by animation speed

        // Check if we've reached the end of the slides
        if (Math.abs(translateX) >= totalSlides * slideWidth) {
            translateX = 0; // Reset the position to the start
            currentIndex = 0;
            carouselInner.style.transition = 'none'; // Remove transition for instant reset
        }

        // Update the transform
        carouselInner.style.transform = `translateX(${translateX}px)`;

        // Check if a slide is in the middle of the screen
        const centerPosition = Math.abs(translateX) + window.innerWidth / 2;
        const centeredSlideIndex = Math.floor(centerPosition / slideWidth) % totalSlides;

        // Update dots if the centered slide has changed
        if (currentIndex !== centeredSlideIndex) {
            currentIndex = centeredSlideIndex;
            updateDots(currentIndex);
        }

        // Request the next animation frame
        requestAnimationFrame(animateCarousel);
    }

    // Start the animation
    animateCarousel();
});






/*        RANDOM POKEMON PART OF THE SCRIPT!!!!!!!!!             */

let preloadedPokemon = []; // Queue to hold preloaded Pokémon

// Fetch a random Pokémon ID
function getRandomPokemonId() {
    const totalPokemon = 1010; // Total number of Pokémon in the API (as of Gen 9)
    return Math.floor(Math.random() * totalPokemon) + 1; // Random ID between 1 and 1010
}

// Preload a random Pokémon and add it to the queue
async function preloadPokemon() {
    const randomId = getRandomPokemonId();
    const apiUrl = `https://pokeapi.co/api/v2/pokemon/${randomId}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Failed to fetch Pokémon data.");
        const pokemon = await response.json();
        preloadedPokemon.push(pokemon); // Add the Pokémon data to the queue
    } catch (error) {
        console.error("Error preloading Pokémon:", error);
    }
}

// Populate the card with Pokémon data
function populateCard(pokemon) {
    // Fill in the title and subtitle
    document.querySelector('.card-title').innerHTML = `
        ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
        <span class="card-subtitle">#${String(pokemon.id).padStart(4, '0')}</span>
    `;

    // Fill in the type
    const typeContainer = document.querySelector('.card-type .type');
    typeContainer.textContent = pokemon.types.map(type => String(type.type.name).charAt(0).toUpperCase() + String(type.type.name).slice(1)).join(", ");
    typeContainer.style.backgroundColor = getTypeColor(pokemon.types[0].type.name); // Set color based on type

    // Fill in the description (needs a separate API call)
    fetchPokemonSpeciesData(pokemon.id);

    // Set the Pokémon image
    const imgElement = document.querySelector('.card-img img');
    imgElement.src = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;
    imgElement.alt = `Image of ${pokemon.name}`;
}

// Fetch Pokémon species data for the description
async function fetchPokemonSpeciesData(pokemonId) {
    const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`;

    try {
        const response = await fetch(speciesUrl);
        if (!response.ok) throw new Error("Failed to fetch Pokémon species data.");
        const speciesData = await response.json();

        // Populate description
        const description = speciesData.flavor_text_entries.find(
            entry => entry.language.name === "en"
        );
        document.querySelector('.card-description').textContent = description
            ? description.flavor_text.replace(/\s+/g, " ")
            : "Description not available.";
    } catch (error) {
        console.error(error);
    }
}

// Map of Pokémon types to background colors
function getTypeColor(type) {
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
    return typeColors[type] || '#A8A77A'; // Default to normal type color
}

/**
 * Function to show the next pokemon
 */
function showNextPokemon(first) {

    // Get the card element
    const cardElement = document.querySelector('.card');

    // Get the pokemon
    const nextPokemon = preloadedPokemon.shift();

    // If is the first time
    if (first) {

        // Set the timeout for the first animation
        setTimeout(() => {

            // Remove the class
            cardElement.classList.remove('BeforeFirstActive');

            // Add the class
            cardElement.classList.add('firstActive');

            // Populate the card with the next Pokémon data
            populateCard(nextPokemon);
        }, 500);
        return;
    }

    // Remove all the previous class
    cardElement.classList.remove('BeforeFirstActive');
    cardElement.classList.remove('firstActive');
    cardElement.classList.remove('active');

    // Apply the "swipe-out" animation
    cardElement.classList.add('swipe-out');

    // After the swipe-out animation completes
    setTimeout(() => {

        // Remove the "swipe-out" class
        cardElement.classList.remove('swipe-out');

        // Populate the card with the next Pokémon data
        populateCard(nextPokemon);

        // Add the "swipe-in" animation
        cardElement.classList.add('swipe-in');

        // After the swipe-in animation completes
        setTimeout(() => {

            // Remove the "swipe-in" class and set the card to "active"
            cardElement.classList.remove('swipe-in');
            cardElement.classList.add('active');
        }, 500);
    }, 500);

    // Preload another Pokémon to maintain the queue
    preloadPokemon();
}

/**
 * Function to preload three Pokémon initially
 */
(async function preloadInitialPokemon() {
    for (let i = 0; i < 3; i++) {
        await preloadPokemon();
    }
    
    // Show the first Pokémon from the preloaded list
    showNextPokemon(true);
})();

// Add an event listener to the Random Pokemon button
document.getElementById('nextPokemonButton').addEventListener('click', function (event) {
  const button = event.currentTarget;

  // Add a scale-down effect
  button.style.transform = 'scale(0.9)';
  button.style.transition = 'transform 0.2s ease-out';

  // After the scale-down effect, scale it back up
  setTimeout(() => {
      button.style.transform = 'scale(1)';

      // Reset the inline style after the animation to allow hover effects
      setTimeout(() => {
          button.style.transform = ''; // Remove inline style
      }, 200); // Matches the second scale duration
  }, 200); // Matches the scale-down duration

  // Trigger the Pokémon display function
  showNextPokemon(false);
});

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



function startCoolAnimation(elementId) {
  const element = document.getElementById(elementId);
  let scale = 1; // Default scale
  let angle = 0; // Current rotation angle
  let bounce = 0; // Current bounce height
  let swingDirection = 1; // Direction of the swing (1 = right, -1 = left)
  let bounceDirection = 1; // Direction of the bounce (1 = up, -1 = down)

  setInterval(() => {
      // Update the swing angle
      angle += swingDirection * 2; // Rotate 2 degrees per frame
      if (angle >= 15 || angle <= -15) swingDirection *= -1; // Reverse swing at 15 degrees

      // Update the bounce height
      bounce += bounceDirection * 2; // Bounce 2px per frame
      if (bounce >= 10 || bounce <= 0) bounceDirection *= -1; // Reverse bounce at bounds

      // Apply the transform with scaling
      element.style.transform = `translateY(-${bounce}px) rotate(${angle}deg) scale(${scale})`;
  }, 50); // Adjust the interval for smoothness

  // Handle hover state
  element.addEventListener("mouseover", () => {
      scale = 1.5; // Scale up when hovered
  });

  element.addEventListener("mouseout", () => {
      scale = 1; // Reset scale when hover ends
  });
}

// Start the animation for both elements
startCoolAnimation("pokeball");
startCoolAnimation("battle");