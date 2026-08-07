// Theme toggle
const html = document.documentElement;
const toggle = document.getElementById('theme-toggle');
const stored = localStorage.getItem('theme');

if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  html.classList.add('dark');
}

if (toggle) {
  toggle.addEventListener('click', () => {
    html.classList.toggle('dark');
    localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
  });
}

// navbar
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.nav-links');
const sections = ['about', 'experience', 'stack', 'projects', 'contact'];
const currentPath = window.location.pathname;
const isBlogPage = currentPath.includes('/blog') || currentPath.endsWith('/blog');

if (menuToggle && mobileNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  mobileNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);

    if (isBlogPage) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.section === 'blog');
      });
      return;
    }

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
}

// Back to top
const backTopButton = document.getElementById('back-top');
if (backTopButton) {
  backTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

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

// Blog search and genre filters
function initBlogFilters() {
  const blogList = document.querySelector('.blog-list');
  if (!blogList) return;

  const searchInput = document.getElementById('blog-search');
  const sortSelect = document.getElementById('blog-sort');
  const genreContainer = document.getElementById('filter-genres');
  const clearButton = document.getElementById('filter-clear');
  const emptyMessage = document.getElementById('blog-empty');
  const cards = Array.from(blogList.querySelectorAll('.blog-card'));

  const cardData = cards.map(card => {
    const title = card.querySelector('.blog-card-title')?.textContent.trim() || '';
    const desc = card.querySelector('.blog-card-desc')?.textContent.trim() || '';
    const tag = card.querySelector('.blog-card-tag')?.textContent.trim() || '';
    const dateText = card.querySelector('.blog-card-date')?.textContent.replace(/^Published\s+/, '').trim() || '';
    const dateValue = dateText ? new Date(dateText) : new Date(0);
    return { card, title, desc, tag, dateValue };
  });

  const genres = Array.from(new Set(cardData.map(item => item.tag))).sort();

  genres.forEach(genre => {
    const id = `genre-${genre.toLowerCase().replace(/\s+/g, '-')}`;
    const label = document.createElement('label');
    label.className = 'filter-genre';
    label.htmlFor = id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = id;
    checkbox.value = genre;
    checkbox.className = 'filter-checkbox';

    const span = document.createElement('span');
    span.className = 'filter-genre-label';
    span.textContent = genre;

    label.append(checkbox, span);
    genreContainer.append(label);
  });

  function updateFilters() {
    const query = searchInput?.value.trim().toLowerCase() || '';
    const sortValue = sortSelect?.value || 'newest';
    const selectedGenres = Array.from(genreContainer.querySelectorAll('input:checked')).map(input => input.value);

    const visibleItems = [];

    cardData.forEach(({ card, title, desc, tag }) => {
      const matchesSearch = !query || [title, desc, tag].some(value => value.toLowerCase().includes(query));
      const matchesGenre = selectedGenres.length === 0 || selectedGenres.includes(tag);
      const visible = matchesSearch && matchesGenre;

      card.style.display = visible ? '' : 'none';
      if (visible) visibleItems.push({ card, title, dateValue: cardData.find(item => item.card === card).dateValue });
    });

    visibleItems.sort((a, b) => {
      if (sortValue === 'oldest') return a.dateValue - b.dateValue;
      if (sortValue === 'title-asc') return a.title.localeCompare(b.title);
      if (sortValue === 'title-desc') return b.title.localeCompare(a.title);
      return b.dateValue - a.dateValue;
    });

    visibleItems.forEach(item => blogList.appendChild(item.card));

    if (emptyMessage) {
      emptyMessage.classList.toggle('visible', visibleItems.length === 0);
    }
  }

  searchInput?.addEventListener('input', updateFilters);
  sortSelect?.addEventListener('change', updateFilters);
  genreContainer.addEventListener('change', updateFilters);
  clearButton?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    if (sortSelect) sortSelect.value = 'newest';
    genreContainer.querySelectorAll('input').forEach(input => {
      input.checked = false;
    });
    updateFilters();
  });

  updateFilters();
}

initBlogFilters();
