const burger   = document.getElementById('burger'),
      navLinks = document.getElementById('navLinks'),
      overlay  = document.getElementById('navOverlay'),
      closeBtn = document.getElementById('menuClose');

const closeMenu = () => {
  navLinks.classList.remove('open');
  burger.classList.remove('open');
  overlay.classList.remove('open');
  closeBtn.classList.remove('open');
  burger.setAttribute('aria-expanded','false');
  document.body.style.overflow = '';
};
const openMenu = () => {
  navLinks.classList.add('open');
  burger.classList.add('open');
  overlay.classList.add('open');
  closeBtn.classList.add('open');
  burger.setAttribute('aria-expanded','true');
  document.body.style.overflow = 'hidden';
};
burger.addEventListener('click', () => navLinks.classList.contains('open') ? closeMenu() : openMenu());
closeBtn.addEventListener('click', closeMenu);
overlay.addEventListener('click', closeMenu);
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));