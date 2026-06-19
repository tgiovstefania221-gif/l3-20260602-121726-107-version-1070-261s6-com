(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var sliders = document.querySelectorAll("[data-hero-slider]");
  sliders.forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var current = 0;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });

    show(0);

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }
  });

  var searchInput = document.querySelector("[data-search-input]");
  var yearFilter = document.querySelector("[data-year-filter]");
  var cardList = document.querySelector("[data-card-list]");
  var emptyState = document.querySelector("[data-empty-state]");

  if (cardList) {
    var cards = Array.prototype.slice.call(cardList.querySelectorAll(".movie-card"));
    var years = [];

    cards.forEach(function (card) {
      var year = card.getAttribute("data-year") || "";
      if (year && years.indexOf(year) === -1) {
        years.push(year);
      }
    });

    years.sort(function (a, b) {
      return Number(b) - Number(a);
    });

    if (yearFilter) {
      years.forEach(function (year) {
        var option = document.createElement("option");
        option.value = year;
        option.textContent = year + " 年";
        yearFilter.appendChild(option);
      });
    }

    function filterCards() {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var yearValue = yearFilter ? yearFilter.value : "";
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-year") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-genre") || "",
          card.getAttribute("data-tags") || ""
        ].join(" ").toLowerCase();

        var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
        var yearMatched = !yearValue || card.getAttribute("data-year") === yearValue;
        var matched = keywordMatched && yearMatched;

        card.style.display = matched ? "" : "none";

        if (matched) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", visibleCount === 0);
      }
    }

    if (searchInput) {
      searchInput.addEventListener("input", filterCards);
    }

    if (yearFilter) {
      yearFilter.addEventListener("change", filterCards);
    }
  }
})();
