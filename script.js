const cover = document.getElementById('cover');
const openButton = document.getElementById('openInvitation');
const mainContent = document.getElementById('mainContent');
const music = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
const musicLabel = document.getElementById('musicLabel');

// Optional personalized guest name: index.html?to=Nama%20Tamu
const params = new URLSearchParams(window.location.search);
const guest = params.get('to');
if (guest) document.getElementById('guestName').textContent = guest.replace(/\+/g, ' ');

openButton.addEventListener('click', async () => {
  cover.classList.add('closed');
  mainContent.classList.remove('hidden');
  document.body.classList.remove('locked');
  // Browsers permit audio playback after a visitor clicks a button.
  try {
    await music.play();
    musicToggle.classList.add('playing');
    musicLabel.textContent = 'Musik aktif';
  } catch (e) {
    musicLabel.textContent = 'Putar musik';
  }
  setTimeout(() => cover.setAttribute('aria-hidden', 'true'), 850);
});

musicToggle.addEventListener('click', async () => {
  if (music.paused) {
    try {
      await music.play();
      musicToggle.classList.add('playing');
      musicLabel.textContent = 'Musik aktif';
    } catch (e) {
      musicLabel.textContent = 'Tambahkan MP3';
      alert('Tambahkan file musik bernama "music.mp3" ke folder assets agar musik latar dapat diputar.');
    }
  } else {
    music.pause();
    musicToggle.classList.remove('playing');
    musicLabel.textContent = 'Musik';
  }
});

const weddingDate = new Date('2026-12-06T08:00:00+07:00').getTime();
function updateCountdown() {
  let distance = weddingDate - Date.now();
  if (distance < 0) distance = 0;
  const days = Math.floor(distance / 86400000);
  const hours = Math.floor((distance % 86400000) / 3600000);
  const minutes = Math.floor((distance % 3600000) / 60000);
  const seconds = Math.floor((distance % 60000) / 1000);
  document.getElementById('days').textContent = String(days).padStart(2, '0');
  document.getElementById('hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

// Botanical particles appear only after the invitation is opened.
const leafLayer = document.getElementById('floatingLeaves');
if (leafLayer) {
  const leafSymbols = ['❧', '❦', '✦'];
  for (let i = 0; i < 13; i++) {
    const leaf = document.createElement('span');
    leaf.className = 'floating-leaf';
    leaf.textContent = leafSymbols[i % leafSymbols.length];
    leaf.style.left = `${(i * 17 + 6) % 100}%`;
    leaf.style.setProperty('--duration', `${16 + (i % 6) * 3}s`);
    leaf.style.setProperty('--delay', `${-(i % 9) * 2.1}s`);
    leaf.style.setProperty('--drift', `${(i % 2 ? -1 : 1) * (35 + (i % 5) * 18)}px`);
    leafLayer.appendChild(leaf);
  }
}
const originalOpenHandler = openButton.onclick;
openButton.addEventListener('click', () => {
  if (leafLayer) leafLayer.classList.add('visible');
});

// Copy bank account number.
const copyAccountButton = document.getElementById('copyAccount');
if (copyAccountButton) {
  copyAccountButton.addEventListener('click', async () => {
    const account = document.getElementById('accountNumber').textContent.trim();
    const feedback = document.getElementById('copyFeedback');
    try {
      await navigator.clipboard.writeText(account);
      feedback.textContent = 'Nomor rekening berhasil disalin.';
    } catch (e) {
      const temp = document.createElement('textarea');
      temp.value = account; document.body.appendChild(temp); temp.select();
      try { document.execCommand('copy'); feedback.textContent = 'Nomor rekening berhasil disalin.'; }
      catch (_) { feedback.textContent = 'Silakan salin nomor rekening secara manual.'; }
      temp.remove();
    }
  });
}

// Demo guestbook: saves locally on the current browser/device.
// Shared guestbook across guests requires an online database integration.
const wishForm = document.getElementById('wishForm');
const wishesList = document.getElementById('wishesList');
const wishStorageKey = 'asri-angga-wedding-wishes-v1';
function getSavedWishes() {
  try { return JSON.parse(localStorage.getItem(wishStorageKey) || '[]'); } catch (e) { return []; }
}
function renderWishes() {
  if (!wishesList) return;
  const wishes = getSavedWishes(); wishesList.innerHTML = '';
  if (!wishes.length) {
    const empty = document.createElement('p'); empty.className = 'empty-wishes';
    empty.textContent = 'Belum ada ucapan. Jadilah yang pertama mengirim doa!';
    wishesList.appendChild(empty); return;
  }
  wishes.slice().reverse().forEach((wish) => {
    const card = document.createElement('article'); card.className = 'wish-entry';
    const head = document.createElement('div'); head.className = 'wish-entry-head';
    const name = document.createElement('strong'); name.textContent = wish.name;
    const attendance = document.createElement('span'); attendance.className = 'attendance'; attendance.textContent = wish.attendance;
    head.append(name, attendance);
    const message = document.createElement('p'); message.textContent = wish.message;
    const time = document.createElement('time'); time.textContent = wish.date;
    card.append(head, message, time); wishesList.appendChild(card);
  });
}
if (wishForm) {
  wishForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('wishName').value.trim();
    const attendance = document.getElementById('wishAttendance').value;
    const message = document.getElementById('wishMessage').value.trim();
    const feedback = document.getElementById('wishFeedback');
    if (!name || !message) { feedback.textContent = 'Mohon isi nama dan ucapan terlebih dahulu.'; return; }
    const wishes = getSavedWishes();
    wishes.push({name, attendance, message, date: new Date().toLocaleString('id-ID', {dateStyle:'medium', timeStyle:'short'})});
    try {
      localStorage.setItem(wishStorageKey, JSON.stringify(wishes.slice(-100)));
      feedback.textContent = 'Terima kasih! Ucapan tersimpan di browser ini.';
      wishForm.reset(); renderWishes();
    } catch (e) { feedback.textContent = 'Ucapan belum bisa disimpan di browser ini.'; }
  });
  renderWishes();
}
