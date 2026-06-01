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
