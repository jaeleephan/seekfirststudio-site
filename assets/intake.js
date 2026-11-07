(function () {
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbzmuHQ12uZj0r0IkCZsdjc5ZHeqJ0TDxk_PEuGDInVXaNTZfLm_qqKgDOW0uMsjig8cWw/exec';
  var form = document.getElementById('intake');
  var status = form.querySelector('.status');
  var btn = form.querySelector('button[type="submit"]');
  var say = function (m, c) { status.textContent = m; status.className = 'status ' + (c || ''); };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    var lines = [];
    form.querySelectorAll('[data-q], [data-group]').forEach(function (el) {
      if (el.hasAttribute('data-group')) {
        var picked = [].map.call(el.querySelectorAll('input[type=checkbox]:checked'), function (c) { return c.value; });
        if (picked.length) lines.push(el.getAttribute('data-group') + ': ' + picked.join('; '));
        return;
      }
      var v = (el.value || '').trim();
      if (v) lines.push(el.getAttribute('data-q') + ': ' + v);
    });
    var athlete = document.getElementById('i-athlete').value.trim();
    // split into parts under the sheet's 5,000-character cell limit
    var parts = [], cur = '';
    lines.forEach(function (l) {
      if (l.length > 4700) l = l.slice(0, 4700) + '...';
      if (cur && (cur.length + l.length + 2) > 4700) { parts.push(cur); cur = ''; }
      cur += (cur ? '\n\n' : '') + l;
    });
    if (cur) parts.push(cur);
    var bodies = parts.map(function (msg, i) {
      var b = new URLSearchParams();
      b.set('name', form.name.value.trim());
      b.set('email', form.email.value.trim());
      b.set('phone', form.phone.value.trim());
      b.set('type', 'Intake form: ' + athlete + (parts.length > 1 ? ' (part ' + (i + 1) + ' of ' + parts.length + ')' : ''));
      b.set('timing', document.getElementById('i-deadline').value.trim());
      b.set('source', 'Client intake');
      b.set('message', msg);
      b.set('page', location.href);
      b.set('company_website', form.company_website.value);
      return b;
    });

    btn.disabled = true;
    say('Sending...');
    bodies.reduce(function (chain, b) {
      return chain.then(function () { return fetch(ENDPOINT, { method: 'POST', mode: 'no-cors', body: b }); });
    }, Promise.resolve())
      .then(function () {
        form.style.display = 'none';
        document.querySelector('.done').style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch(function () {
        say('That didn’t send. Please try again, or email jae@seekfirststudio.com.', 'err');
        btn.disabled = false;
      });
  });
})();
