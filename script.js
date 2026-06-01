// Theme toggle
const html = document.documentElement;
const toggle = document.getElementById('theme-toggle');
const stored = localStorage.getItem('theme');

if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  html.classList.add('dark');
}

toggle.addEventListener('click', () => {
  html.classList.toggle('dark');
  localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
});

// navbar
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = ['about', 'experience', 'stack', 'projects', 'certs', 'contact'];

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);

  let closest = { id: '', dist: Infinity };
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const dist = Math.abs(el.getBoundingClientRect().top);
    if (dist < closest.dist) closest = { id, dist };
  });

  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.section === closest.id);
  });
}, { passive: true });

// Back to top
document.getElementById('back-top').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Project card image carousel
class ProjectCardCarousel {
  constructor(card) {
    this.card = card;
    this.images = card.dataset.images ? card.dataset.images.split(',').map(img => img.trim()) : [];
    this.currentIndex = 0;
    this.isAnimating = false;
    this.carouselInterval = null;
    
    if (this.images.length > 0) {
      this.init();
    }
  }

  init() {
    const container = this.card.querySelector('.project-image-container');
    if (!container) return;

    // Create image elements
    this.images.forEach((imageSrc, index) => {
      const img = document.createElement('img');
      img.src = imageSrc;
      img.className = 'project-image';
      if (index === 0) img.classList.add('active');
      img.onerror = () => {
        // Fallback if image doesn't exist
        img.style.display = 'none';
      };
      container.appendChild(img);
    });

    // Add event listeners
    this.card.addEventListener('mouseenter', () => this.handleHoverStart());
    this.card.addEventListener('mouseleave', () => this.handleHoverEnd());
    this.card.addEventListener('touchstart', () => this.handleHoverStart(), { passive: true });
    this.card.addEventListener('touchend', () => this.handleHoverEnd());
  }

  handleHoverStart() {
    this.card.classList.add('expanded');
    
    // Start carousel if multiple images
    if (this.images.length > 1) {
      this.startCarousel();
    }
  }

  handleHoverEnd() {
    this.card.classList.remove('expanded');
    this.stopCarousel();
    this.resetCarousel();
  }

  startCarousel() {
    if (this.carouselInterval) return;

    this.carouselInterval = setInterval(() => {
      this.nextImage();
    }, 4000); // Change image every 4 seconds
  }

  stopCarousel() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
      this.carouselInterval = null;
    }
  }

  nextImage() {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const images = this.card.querySelectorAll('.project-image');
    const currentImg = images[this.currentIndex];
    const nextIndex = (this.currentIndex + 1) % this.images.length;
    const nextImg = images[nextIndex];

    // Fade out current, fade in next
    currentImg.classList.remove('active');
    nextImg.classList.add('active');

    this.currentIndex = nextIndex;
    
    setTimeout(() => {
      this.isAnimating = false;
    }, 800); // Wait for fade transition
  }

  resetCarousel() {
    const images = this.card.querySelectorAll('.project-image');
    images.forEach((img, index) => {
      img.classList.toggle('active', index === 0);
    });
    this.currentIndex = 0;
  }
}

// Initialize all project cards
document.querySelectorAll('.project-card[data-images]').forEach(card => {
  new ProjectCardCarousel(card);
});
