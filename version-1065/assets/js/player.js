import { H as Hls } from "./hls-dru42stk.js";

document.addEventListener("DOMContentLoaded", function () {
  var video = document.getElementById("movie-player");
  var playButton = document.querySelector("[data-play-button]");

  if (!video) {
    return;
  }

  var source = video.dataset.src;

  function attachSource() {
    if (!source) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function playVideo() {
    attachSource();
    if (playButton) {
      playButton.classList.add("is-hidden");
    }

    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        video.controls = true;
      });
    }
  }

  attachSource();

  if (playButton) {
    playButton.addEventListener("click", playVideo);
  }

  video.addEventListener("play", function () {
    if (playButton) {
      playButton.classList.add("is-hidden");
    }
  });
});
