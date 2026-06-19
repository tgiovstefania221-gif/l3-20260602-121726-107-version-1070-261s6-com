import { H as Hls } from './hls-dru42stk.js';

document.querySelectorAll('[data-player]').forEach(function (panel) {
  var video = panel.querySelector('video');
  var cover = panel.querySelector('[data-stream]');
  var hls = null;
  var started = false;
  var start = function () {
    if (!video || !cover || started) {
      return;
    }
    started = true;
    var src = cover.getAttribute('data-stream');
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
    } else {
      video.src = src;
    }
    cover.classList.add('is-hidden');
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        video.setAttribute('controls', 'controls');
      });
    }
  };
  if (cover) {
    cover.addEventListener('click', start);
  }
  if (video) {
    video.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });
    video.addEventListener('error', function () {
      if (cover) {
        cover.classList.remove('is-hidden');
        cover.querySelector('strong').textContent = '重新播放';
      }
      if (hls) {
        hls.destroy();
        hls = null;
      }
      started = false;
    });
  }
});
