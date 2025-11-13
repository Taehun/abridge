// Mobile menu toggle functionality
(function() {
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  if (!menuToggle || !mobileMenu) return;

  // Toggle menu
  function toggleMenu() {
    mobileMenu.classList.toggle('active');
    document.body.classList.toggle('menu-open');
  }

  // Open menu
  menuToggle.addEventListener('click', toggleMenu);

  // Close menu when clicking close button (pseudo-element)
  mobileMenu.addEventListener('click', function(e) {
    const rect = mobileMenu.getBoundingClientRect();
    const closeButtonArea = {
      left: rect.right - 48,
      right: rect.right - 8,
      top: rect.top + 8,
      bottom: rect.top + 48
    };

    if (e.clientX >= closeButtonArea.left &&
        e.clientX <= closeButtonArea.right &&
        e.clientY >= closeButtonArea.top &&
        e.clientY <= closeButtonArea.bottom) {
      toggleMenu();
    }
  });

  // Close menu when clicking overlay
  document.body.addEventListener('click', function(e) {
    if (document.body.classList.contains('menu-open') &&
        !mobileMenu.contains(e.target) &&
        e.target !== menuToggle) {
      toggleMenu();
    }
  });

  // Close menu when clicking a menu link
  const menuLinks = mobileMenu.querySelectorAll('a');
  menuLinks.forEach(function(link) {
    link.addEventListener('click', function() {
      toggleMenu();
    });
  });

  // Close menu on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
      toggleMenu();
    }
  });
})();
