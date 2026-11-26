import { backend, configured } from './backend.js';
import { $, $$, say, friendly } from './ui.js';

const form = $('#auth'), status = $('.status', form), button = $('[type=submit]', form);
let mode = 'login', busy = false;
$$('[data-mode]').forEach(b => b.onclick = () => {
  mode = b.dataset.mode; const reg = mode === 'register';
  $$('[data-mode]').forEach(x => x.ariaPressed = String(x === b));
  $$('[data-reg]').forEach(el => { el.hidden = !reg; $('input', el).required = reg; });
  button.textContent = reg ? 'Create profile' : 'Sign in';
  form.elements.password.autocomplete = reg ? 'new-password' : 'current-password';
  $('#reset').hidden = reg; say(status, '');
});

if (!configured) {
  $('#offline').hidden = false;
  $('#offline').textContent = 'Client profiles are not open yet. Please use the contact page for now.';
  $$('input, button', form).forEach(el => el.disabled = true);
} else {
  form.onsubmit = e => e.preventDefault();
  const api = await backend().catch(err => {
    $('#offline').hidden = false; $('#offline').textContent = 'Could not reach the sign-in service. Check your connection and reload the page.';
    throw err;
  });
  api.onUser(u => { if (u && !busy) location.replace('portal.html'); });
  form.onsubmit = async e => {
    e.preventDefault(); busy = true; button.disabled = true; say(status, 'Please wait…');
    const v = Object.fromEntries(new FormData(form));
    try {
      await (mode === 'register' ? api.register(v) : api.login(v.email, v.password));
      location.replace('portal.html');
    } catch (err) {
      // If the account was made but saving the profile failed, the portal lets them save it again.
      if (await api.currentUser()) return location.replace('portal.html');
      say(status, friendly(err), true); busy = false; button.disabled = false;
    }
  };
  $('#reset').onclick = async () => {
    const email = form.elements.email;
    if (!email.value || !email.checkValidity()) return say(status, 'Type your email above, then choose “Forgot password?” again.', true);
    try { await api.reset(email.value); say(status, 'If that email has a profile, a reset link is on its way.'); }
    catch (err) { say(status, friendly(err), true); }
  };
}
