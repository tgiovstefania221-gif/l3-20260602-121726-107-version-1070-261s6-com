(function () {
  var navButton = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');
  if (navButton && nav) {
    navButton.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var show = function (next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        show(index + 1);
      }, 5600);
    }
  }

  var searchPage = document.querySelector('[data-search-page]');
  if (searchPage) {
    var input = searchPage.querySelector('[data-search-input]');
    var region = searchPage.querySelector('[data-filter-region]');
    var type = searchPage.querySelector('[data-filter-type]');
    var clear = searchPage.querySelector('[data-clear-search]');
    var cards = Array.prototype.slice.call(searchPage.querySelectorAll('.movie-card'));
    var empty = searchPage.querySelector('[data-empty-result]');
    var params = new URLSearchParams(window.location.search);
    if (input && params.get('q')) {
      input.value = params.get('q');
    }
    var apply = function () {
      var q = input ? input.value.trim().toLowerCase() : '';
      var selectedRegion = region ? region.value : '';
      var selectedType = type ? type.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        var ok = true;
        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (selectedRegion && card.getAttribute('data-region') !== selectedRegion) {
          ok = false;
        }
        if (selectedType && card.getAttribute('data-type') !== selectedType) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    };
    [input, region, type].forEach(function (el) {
      if (el) {
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
      }
    });
    if (clear) {
      clear.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (region) {
          region.value = '';
        }
        if (type) {
          type.value = '';
        }
        apply();
      });
    }
    apply();
  }
})();
