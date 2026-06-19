import { H as Hls } from "./hls.js";

function setupPlayer(wrapper) {
  var video = wrapper.querySelector("video");
  var overlay = wrapper.querySelector("[data-play-button]");
  var status = wrapper.querySelector("[data-player-status]");
  var hlsInstance = null;
  var initialized = false;

  if (!video || !overlay) {
    return;
  }

  function setStatus(message) {
    if (status) {
      status.textContent = message || "";
    }
  }

  function attachSource() {
    if (initialized) {
      return;
    }

    initialized = true;

    var source = video.getAttribute("data-src") || "";
    if (!source) {
      setStatus("当前影片暂不可播放");
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);

      hlsInstance.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus("播放加载失败，请稍后重试");
        }
      });
    } else {
      video.src = source;
    }
  }

  function play() {
    attachSource();
    overlay.classList.add("is-hidden");
    video.controls = true;

    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        overlay.classList.remove("is-hidden");
        setStatus("点击视频区域继续播放");
      });
    }
  }

  overlay.addEventListener("click", play);

  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener("playing", function () {
    overlay.classList.add("is-hidden");
    setStatus("");
  });

  video.addEventListener("pause", function () {
    if (!video.ended) {
      overlay.classList.remove("is-hidden");
      setStatus("点击继续播放");
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

document.querySelectorAll("[data-player]").forEach(setupPlayer);
