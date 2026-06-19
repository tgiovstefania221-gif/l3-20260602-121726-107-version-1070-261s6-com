document.addEventListener("DOMContentLoaded", function () {
  var header = document.querySelector("[data-header]");
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");
  var hero = document.querySelector("[data-hero]");
  var searchInputs = Array.from(document.querySelectorAll("[data-search-input]"));
  var yearFilters = Array.from(document.querySelectorAll("[data-filter-year]"));

  function updateHeader() {
    if (!header) {
      return;
    }

    if (window.scrollY > 12) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  if (hero) {
    var slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.dataset.heroDot || 0));
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function collectCards() {
    return Array.from(document.querySelectorAll(".searchable-card"));
  }

  function currentQuery() {
    return searchInputs.map(function (input) {
      return input.value.trim().toLowerCase();
    }).filter(Boolean).join(" ");
  }

  function currentYear() {
    var selected = yearFilters.map(function (select) {
      return select.value;
    }).find(Boolean);
    return selected || "";
  }

  function applyFilters() {
    var query = currentQuery();
    var year = currentYear();

    collectCards().forEach(function (card) {
      var haystack = [
        card.dataset.title,
        card.dataset.year,
        card.dataset.type,
        card.dataset.region,
        card.dataset.genre,
        card.dataset.channel,
        card.textContent
      ].join(" ").toLowerCase();
      var matchesText = !query || haystack.indexOf(query) !== -1;
      var matchesYear = !year || card.dataset.year === year;
      card.classList.toggle("is-filtered-out", !(matchesText && matchesYear));
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener("input", applyFilters);
  });

  yearFilters.forEach(function (select) {
    select.addEventListener("change", applyFilters);
  });
});
