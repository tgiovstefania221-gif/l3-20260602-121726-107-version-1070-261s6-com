import { H as Hls } from "./hls.js";
import { SEARCH_MOVIES } from "./search-data.js";

const rootPrefix = (() => {
  const path = window.location.pathname.replace(/\\/g, "/");
  if (path.includes("/movie/") || path.includes("/category/")) {
    return "../";
  }
  return "./";
})();

function bySelector(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

function setupMobileNav() {
  const button = document.querySelector(".mobile-menu-button");
  const menu = document.querySelector(".mobile-nav");
  if (!button || !menu) {
    return;
  }
  button.addEventListener("click", () => {
    menu.classList.toggle("is-open");
  });
}

function setupHero() {
  const slider = document.querySelector(".hero-slider");
  if (!slider) {
    return;
  }
  const slides = bySelector(".hero-slide", slider);
  const dots = bySelector(".hero-dot", slider);
  const prev = slider.querySelector(".hero-prev");
  const next = slider.querySelector(".hero-next");
  let index = 0;
  let timer = null;

  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
  }

  function restart() {
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(() => show(index + 1), 5200);
  }

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      show(i);
      restart();
    });
  });

  if (prev) {
    prev.addEventListener("click", () => {
      show(index - 1);
      restart();
    });
  }

  if (next) {
    next.addEventListener("click", () => {
      show(index + 1);
      restart();
    });
  }

  restart();
}

function resultMarkup(item) {
  const href = rootPrefix + item.url;
  const image = rootPrefix + item.image;
  const meta = [item.region, item.year, item.genre].filter(Boolean).join(" · ");
  return `
    <a class="search-result-item" href="${href}">
      <img src="${image}" alt="${item.title}" loading="lazy">
      <span>
        <strong>${item.title}</strong>
        <span>${meta}</span>
      </span>
    </a>
  `;
}

function setupSearch() {
  bySelector(".site-search").forEach((form) => {
    const input = form.querySelector(".site-search-input");
    const results = form.querySelector(".site-search-results");
    if (!input || !results) {
      return;
    }

    function render() {
      const query = input.value.trim().toLowerCase();
      if (!query) {
        results.classList.remove("is-open");
        results.innerHTML = "";
        return;
      }
      const matches = SEARCH_MOVIES.filter((item) => item.search.includes(query)).slice(0, 12);
      if (!matches.length) {
        results.innerHTML = '<div class="search-result-item"><span><strong>暂无匹配影片</strong><span>换一个关键词试试</span></span></div>';
      } else {
        results.innerHTML = matches.map(resultMarkup).join("");
      }
      results.classList.add("is-open");
    }

    input.addEventListener("input", render);
    input.addEventListener("focus", render);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const first = results.querySelector("a");
      if (first) {
        window.location.href = first.href;
      }
    });
  });

  document.addEventListener("click", (event) => {
    bySelector(".site-search").forEach((form) => {
      if (!form.contains(event.target)) {
        const results = form.querySelector(".site-search-results");
        if (results) {
          results.classList.remove("is-open");
        }
      }
    });
  });
}

function setupPageFilters() {
  const input = document.querySelector(".page-filter-input");
  const cards = bySelector("[data-card]");
  const selects = bySelector("[data-filter-select]");
  if (!cards.length || (!input && !selects.length)) {
    return;
  }

  function apply() {
    const query = input ? input.value.trim().toLowerCase() : "";
    const values = new Map(selects.map((select) => [select.dataset.filterSelect, select.value]));
    cards.forEach((card) => {
      const text = (card.dataset.search || "").toLowerCase();
      const region = card.dataset.region || "";
      const year = card.dataset.year || "";
      const matchQuery = !query || text.includes(query);
      const matchRegion = !values.get("region") || region === values.get("region");
      const matchYear = !values.get("year") || year === values.get("year");
      card.classList.toggle("is-hidden", !(matchQuery && matchRegion && matchYear));
    });
  }

  if (input) {
    input.addEventListener("input", apply);
  }
  selects.forEach((select) => select.addEventListener("change", apply));
}

function setupPlayers() {
  bySelector(".movie-player").forEach((player) => {
    const video = player.querySelector("video");
    const button = player.querySelector(".player-overlay");
    const stream = player.getAttribute("data-stream");
    let loaded = false;
    let hls = null;

    async function startPlayback() {
      if (!video || !stream) {
        player.classList.add("has-error");
        return;
      }

      if (!loaded) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (Hls.isSupported()) {
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data && data.fatal) {
              player.classList.add("has-error");
            }
          });
        } else {
          player.classList.add("has-error");
          return;
        }
        loaded = true;
      }

      player.classList.add("is-playing");
      player.classList.remove("has-error");
      try {
        await video.play();
      } catch (error) {
        player.classList.remove("is-playing");
      }
    }

    if (button) {
      button.addEventListener("click", startPlayback);
    }

    if (video) {
      video.addEventListener("play", () => player.classList.add("is-playing"));
      video.addEventListener("pause", () => {
        if (!video.ended) {
          player.classList.remove("is-playing");
        }
      });
      video.addEventListener("ended", () => player.classList.remove("is-playing"));
    }

    window.addEventListener("beforeunload", () => {
      if (hls) {
        hls.destroy();
      }
    });
  });
}

setupMobileNav();
setupHero();
setupSearch();
setupPageFilters();
setupPlayers();
