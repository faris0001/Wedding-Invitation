const SUPABASE_URL = "https://auukdlsduwjbisffdocj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_FaYFLpAdil0-mlMaV4TCCw_tZFw3k5I";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

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

// ==========================================
// BUKU UCAPAN WEDDING ASRI & ANGGA
// Penyimpanan online menggunakan Supabase
// ==========================================

const wishForm = document.getElementById('wishForm');
const wishesList = document.getElementById('wishesList');
const wishFeedback = document.getElementById('wishFeedback');

// Mengambil ucapan dari database Supabase
async function getSavedWishes() {
    const { data, error } = await supabaseClient
        .from('ucapan')
        .select('id, nama, pesan, kehadiran, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

    if (error) {
        console.error('Gagal mengambil ucapan:', error);
        throw error;
    }

    return data.map((wish) => ({
        id: wish.id,
        name: wish.nama,
        attendance: wish.kehadiran,
        message: wish.pesan,
        date: new Date(wish.created_at).toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short'
        })
    }));
}


// Menampilkan ucapan di halaman undangan
async function renderWishes() {
    if (!wishesList) return;

    wishesList.replaceChildren();

    const loading = document.createElement('p');
    loading.className = 'empty-wishes';
    loading.textContent = 'Memuat ucapan...';

    wishesList.appendChild(loading);

    try {
        const wishes = await getSavedWishes();

        wishesList.replaceChildren();

        if (wishes.length === 0) {
            const empty = document.createElement('p');

            empty.className = 'empty-wishes';
            empty.textContent =
                'Belum ada ucapan. Jadilah yang pertama mengirim doa!';

            wishesList.appendChild(empty);
            return;
        }

        wishes.forEach((wish) => {
            const card = document.createElement('article');
            card.className = 'wish-entry';

            const head = document.createElement('div');
            head.className = 'wish-entry-head';

            const name = document.createElement('strong');
            name.textContent = wish.name;

            const attendance = document.createElement('span');
            attendance.className = 'attendance';
            attendance.textContent = wish.attendance || '';

            head.append(name, attendance);

            const message = document.createElement('p');
            message.textContent = wish.message;

            const time = document.createElement('time');
            time.textContent = wish.date;

            card.append(head, message, time);
            wishesList.appendChild(card);
        });

    } catch (error) {
        console.error('Gagal menampilkan ucapan:', error);

        wishesList.replaceChildren();

        const errorMessage = document.createElement('p');
        errorMessage.className = 'empty-wishes';
        errorMessage.textContent =
            'Ucapan belum dapat dimuat. Periksa koneksi internet dan coba lagi.';

        wishesList.appendChild(errorMessage);
    }
}


// Mengirim ucapan ke database Supabase
if (wishForm) {
    wishForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = document
            .getElementById('wishName')
            .value.trim();

        const attendance = document
            .getElementById('wishAttendance')
            .value;

        const message = document
            .getElementById('wishMessage')
            .value.trim();

        if (!name || !message) {
            wishFeedback.textContent =
                'Mohon isi nama dan ucapan terlebih dahulu.';
            return;
        }

        if (name.length > 100 || message.length > 1000) {
            wishFeedback.textContent =
                'Nama maksimal 100 karakter dan ucapan maksimal 1000 karakter.';
            return;
        }

        const submitButton = wishForm.querySelector(
            'button[type="submit"], input[type="submit"]'
        );

        if (submitButton) {
            submitButton.disabled = true;
        }

        wishFeedback.textContent = 'Mengirim ucapan...';

        try {
            const { error } = await supabaseClient
                .from('ucapan')
                .insert({
                    nama: name,
                    pesan: message,
                    kehadiran: attendance
                });

            if (error) {
                throw error;
            }

            wishFeedback.textContent =
                'Terima kasih! Ucapan berhasil dikirim.';

            wishForm.reset();

            await renderWishes();

        } catch (error) {
            console.error('Gagal menyimpan ucapan:', error);

            wishFeedback.textContent =
                'Ucapan gagal dikirim. Silakan coba lagi.';
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    });
}


// Memuat ucapan ketika halaman dibuka
renderWishes();
