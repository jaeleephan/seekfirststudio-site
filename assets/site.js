/* Seek First Studio site script.
   FORM_ENDPOINT: paste the Apps Script web app URL here (see "Website form setup" in Drive).
   Until it is set, the form opens a pre-filled email instead. */
var SF = {
  FORM_ENDPOINT: 'https://script.google.com/macros/s/AKfycbzmuHQ12uZj0r0IkCZsdjc5ZHeqJ0TDxk_PEuGDInVXaNTZfLm_qqKgDOW0uMsjig8cWw/exec',
  EMAIL: 'jae@seekfirststudio.com'
};

(function () {
  var preview = !!window.SF_PREVIEW;

  /* nav: solid background after scrolling, mobile menu */
  var nav = document.querySelector('.nav');
  var onScroll = function () { if (nav) nav.classList.toggle('solid', window.scrollY > 40); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var menuBtn = document.querySelector('.menu-btn');
  var links = document.querySelector('.nav-links');
  if (menuBtn && links) {
    var setMenu = function (open) {
      links.setAttribute('data-open', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.textContent = open ? 'Close' : 'Menu';
    };
    var mq = window.matchMedia('(max-width: 860px)');
    var sync = function () { setMenu(!mq.matches); };
    sync();
    if (mq.addEventListener) mq.addEventListener('change', sync);
    menuBtn.addEventListener('click', function () { setMenu(links.getAttribute('data-open') !== 'true'); });
    links.addEventListener('click', function (e) { if (mq.matches && e.target.closest('a')) setMenu(false); });
  }

  /* thumbnails that fail to load fall back to the designed poster underneath */
  document.querySelectorAll('img[data-fallback]').forEach(function (img) {
    var drop = function () { img.remove(); };
    if (img.complete && img.naturalWidth === 0) drop();
    else img.addEventListener('error', drop);
  });

  /* work filters */
  var grid = document.querySelector('.grid');
  var chips = document.querySelectorAll('.chip');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.getAttribute('data-filter');
      chips.forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
      document.querySelectorAll('.card').forEach(function (card) {
        var tags = (card.getAttribute('data-tags') || '').split(' ');
        card.hidden = !(f === 'all' || tags.indexOf(f) > -1);
      });
      if (grid) grid.classList.toggle('filtered', f !== 'all');
    });
  });

  /* video player (lightbox). In the preview, links open Vimeo in a new tab instead. */
  var dlg = document.getElementById('player');
  if (dlg && !preview && typeof dlg.showModal === 'function') {
    var frame = dlg.querySelector('.player-frame');
    var title = dlg.querySelector('.player-title');
    var csLink = dlg.querySelector('.player-cs');
    var close = function () { dlg.close(); };
    dlg.addEventListener('close', function () { frame.innerHTML = ''; });
    dlg.querySelector('.player-close').addEventListener('click', close);
    dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
    document.querySelectorAll('[data-vimeo]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var id = a.getAttribute('data-vimeo');
        var r = (a.getAttribute('data-ratio') || '16/9').split('/');
        var ratio = parseFloat(r[0]) / parseFloat(r[1]);
        frame.style.aspectRatio = r[0] + ' / ' + r[1];
        frame.style.width = 'min(100%, calc(78vh * ' + ratio.toFixed(4) + '))';
        frame.innerHTML = '<iframe src="https://player.vimeo.com/video/' + id +
          '?autoplay=1&title=0&byline=0&portrait=0&dnt=1" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="' +
          (a.getAttribute('data-title') || 'Video') + '"></iframe>';
        title.textContent = a.getAttribute('data-title') || '';
        var cs = a.getAttribute('data-case');
        if (cs) { csLink.href = cs; csLink.hidden = false; } else { csLink.hidden = true; }
        dlg.showModal();
      });
    });
  }

  /* case study pages: click the poster to play the film in place */
  if (!preview) {
    document.querySelectorAll('[data-embed]').forEach(function (box) {
      var a = box.querySelector('a');
      if (!a) return;
      a.addEventListener('click', function (e) {
        e.preventDefault();
        box.innerHTML = '<iframe src="https://player.vimeo.com/video/' + box.getAttribute('data-embed') +
          '?autoplay=1&title=0&byline=0&portrait=0&dnt=1" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="' +
          (box.getAttribute('data-title') || 'Video') + '"></iframe>';
      });
    });
  }

  /* service links preselect the project type in the form */
  var typeSel = document.getElementById('f-type');
  document.querySelectorAll('[data-type]').forEach(function (a) {
    a.addEventListener('click', function () { if (typeSel) typeSel.value = a.getAttribute('data-type'); });
  });

  /* contact form */
  var form = document.getElementById('inquiry');
  if (form) {
    var status = form.querySelector('.status');
    var btn = form.querySelector('button[type="submit"]');
    var say = function (msg, cls) { status.textContent = msg; status.className = 'status ' + (cls || ''); };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var fd = new FormData(form);
      fd.set('page', location.href);
      var first = String(fd.get('name') || '').split(' ')[0];

      if (preview) {
        say('Preview only. On the live site this goes to your Pipeline and your inbox.', 'ok');
        return;
      }
      if (!SF.FORM_ENDPOINT) {
        var body = ['Name: ' + fd.get('name'), 'Email: ' + fd.get('email'), 'Phone: ' + (fd.get('phone') || ''),
          'Project: ' + fd.get('type'), 'Budget: ' + (fd.get('budget') || ''), 'Timing: ' + (fd.get('timing') || ''),
          'Found us: ' + (fd.get('source') || ''), '', fd.get('message')].join('\n');
        window.location.href = 'mailto:' + SF.EMAIL + '?subject=' + encodeURIComponent('Project inquiry: ' + fd.get('type')) +
          '&body=' + encodeURIComponent(body);
        say('Opening your email app. If nothing opens, email ' + SF.EMAIL + '.', 'ok');
        return;
      }
      btn.disabled = true;
      say('Sending...');
      fetch(SF.FORM_ENDPOINT, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(fd) })
        .then(function () {
          form.reset();
          say('Thanks' + (first ? ', ' + first : '') + '. We got it and will reply within one business day.', 'ok');
        })
        .catch(function () {
          say('That didn’t send. Email ' + SF.EMAIL + ' and we’ll take it from there.', 'err');
        })
        .finally(function () { btn.disabled = false; });
    });
  }

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
