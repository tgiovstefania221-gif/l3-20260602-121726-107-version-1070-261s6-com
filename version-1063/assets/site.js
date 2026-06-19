
(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupHeader() {
    var header = document.querySelector("[data-header]");
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");

    function syncHeader() {
      if (header) {
        header.classList.toggle("is-scrolled", window.scrollY > 18);
      }
    }

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });

    if (button && nav) {
      button.addEventListener("click", function () {
        nav.classList.toggle("is-open");
        document.body.classList.toggle("menu-open", nav.classList.contains("is-open"));
      });
    }
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var panels = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-text]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
      panels.forEach(function (panel, panelIndex) {
        panel.style.display = panelIndex === current ? "block" : "none";
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    show(0);
    start();
  }

  function setupFilters() {
    var groups = Array.prototype.slice.call(document.querySelectorAll("[data-filter-area]"));
    groups.forEach(function (group) {
      var input = group.querySelector("[data-search-input]");
      var select = group.querySelector("[data-year-filter]");
      var cards = Array.prototype.slice.call(group.querySelectorAll("[data-movie-card]"));
      var empty = group.querySelector("[data-empty-state]");

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var year = select ? select.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-category"),
            card.getAttribute("data-year")
          ].join(" ").toLowerCase();
          var matchQuery = !query || text.indexOf(query) !== -1;
          var matchYear = !year || card.getAttribute("data-year") === year;
          var ok = matchQuery && matchYear;
          card.classList.toggle("is-hidden", !ok);
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      if (select) {
        select.addEventListener("change", apply);
      }

      apply();
    });
  }

  window.initMoviePage = function (source) {
    var video = document.querySelector("[data-player-video]");
    var layer = document.querySelector("[data-player-layer]");
    var button = document.querySelector("[data-player-button]");
    var readyToPlay = false;

    function attach() {
      if (!video || readyToPlay) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      readyToPlay = true;
    }

    function play() {
      attach();
      if (!video) {
        return;
      }
      video.controls = true;
      if (layer) {
        layer.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }

    if (layer) {
      layer.addEventListener("click", play);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
    }
  };

  ready(function () {
    setupHeader();
    setupHero();
    setupFilters();
  });
})();
