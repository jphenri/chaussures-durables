(function () {
  document.documentElement.classList.add('js');

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.site-nav');

  if (!toggle || !nav) {
    return;
  }

  var openLabel = toggle.getAttribute('aria-label') || 'Open menu';
  var closeLabel = openLabel === 'Open menu' ? 'Close menu' : 'Fermer le menu';

  var closeMenu = function () {
    nav.setAttribute('data-open', 'false');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', openLabel);
  };

  var openMenu = function () {
    nav.setAttribute('data-open', 'true');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', closeLabel);
  };

  closeMenu();

  toggle.addEventListener('click', function () {
    var expanded = toggle.getAttribute('aria-expanded') === 'true';
    if (expanded) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });

  document.addEventListener('click', function (event) {
    if (!nav.contains(event.target) && !toggle.contains(event.target)) {
      closeMenu();
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 920) {
      nav.removeAttribute('data-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', openLabel);
    }
  });
})();
