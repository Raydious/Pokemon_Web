let currentIndex = 0;

function showSlide(index) {
  const slides = document.querySelectorAll(".carousel-item");
  const totalSlides = slides.length;

  // Normalize index
  currentIndex = (index + totalSlides) % totalSlides;

  // Update the transform property
  const carouselInner = document.querySelector(".carousel-inner");
  carouselInner.style.transform = `translateX(-${currentIndex * 100}%)`;

  // Update active class
  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === currentIndex);
  });
}

function prevSlide() {
  showSlide(currentIndex - 1);
}

function nextSlide() {
  showSlide(currentIndex + 1);
}

// Initialize the first slide
showSlide(currentIndex);
