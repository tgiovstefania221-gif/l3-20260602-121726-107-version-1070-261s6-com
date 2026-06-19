(function () {
  var navButton = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-mobile-nav]");

  if (navButton && nav) {
    navButton.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var input = document.querySelector("[data-filter-input]");
  var yearSelect = document.querySelector("[data-filter-year]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

  function filterCards() {
    var keyword = input ? input.value.trim().toLowerCase() : "";
    var minYear = yearSelect && yearSelect.value !== "all" ? Number(yearSelect.value) : 0;

    cards.forEach(function (card) {
      var text = (card.getAttribute("data-key") || card.textContent || "").toLowerCase();
      var year = Number(card.getAttribute("data-year")) || 0;
      var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
      var yearMatch = !minYear || year >= minYear;
      card.classList.toggle("is-hidden", !(keywordMatch && yearMatch));
    });
  }

  if (input) {
    input.addEventListener("input", filterCards);
  }

  if (yearSelect) {
    yearSelect.addEventListener("change", filterCards);
  }
})();
