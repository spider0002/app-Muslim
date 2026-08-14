/**
 * Quran Audio Player API & Global Notification System
 * يستخدم روابط مباشرة لتشغيل القرآن الكريم بصوت أشهر القراء
 * المصدر: mp3quran.net - خوادم مباشرة (API v3)
 *
 * يتضمن:
 * 1. مشغل صوت القرآن الكريم مع حفظ الموضع تلقائياً في localStorage
 * 2. نظام التنبيهات والأذكار الموحد (Global Toast & Browser Notifications)
 * 3. نظام مواقيت الصلاة وصوت الأذان
 * 4. إدارة التنقل بين الصفحات (SPA Navigation)
 */

// ================ 1. تعريفات القراء ================

const RECITERS = {
    'ar.alafasy': {
        name: 'مشاري راشد العفاسي',
        nameEn: 'Mishary Alafasy',
        servers: [
            { url: 'https://server8.mp3quran.net/afs', code: 'afs' },
            { url: 'https://server6.mp3quran.net/afs', code: 'afs' },
            { url: 'https://server7.mp3quran.net/afs', code: 'afs' }
        ]
    },
    'ar.maher': {
        name: 'ماهر المعيقلي',
        nameEn: 'Maher Al-Muaiqly',
        servers: [
            { url: 'https://server12.mp3quran.net/maher', code: 'maher' },
            { url: 'https://server6.mp3quran.net/maher', code: 'maher' },
            { url: 'https://server7.mp3quran.net/maher', code: 'maher' }
        ]
    },
    'ar.abdulbasit': {
        name: 'عبد الباسط عبد الصمد',
        nameEn: 'Abdul Basit',
        servers: [
            { url: 'https://server7.mp3quran.net/basit', code: 'basit' },
            { url: 'https://server6.mp3quran.net/basit', code: 'basit' },
            { url: 'https://server8.mp3quran.net/basit', code: 'basit' }
        ]
    },
    'ar.sudais': {
        name: 'عبد الرحمن السديس',
        nameEn: 'Abdul Rahman Al-Sudais',
        servers: [
            { url: 'https://server11.mp3quran.net/sds', code: 'sds' },
            { url: 'https://server6.mp3quran.net/sds', code: 'sds' },
            { url: 'https://server7.mp3quran.net/sds', code: 'sds' }
        ]
    },
    'ar.yasser': {
        name: 'ياسر الدوسري',
        nameEn: 'Yasser Al-Dosari',
        servers: [
            { url: 'https://server11.mp3quran.net/yasser', code: 'yasser' },
            { url: 'https://server6.mp3quran.net/yasser', code: 'yasser' },
            { url: 'https://server7.mp3quran.net/yasser', code: 'yasser' }
        ]
    }
};

// ================ 2. حالة مشغل القرآن ================

let currentAudio = null;
let currentReciterId = '';
let currentSurahNumber = 0;
let currentSurahLabel = '';
let pausedPosition = null; // موقع الإيقاف المؤقت للاستئناف منه

function getServerCode(reciterId) {
    if (reciterId === 'ar.alafasy') return 'afs';
    if (reciterId === 'ar.maher') return 'maher';
    if (reciterId === 'ar.abdulbasit') return 'basit';
    if (reciterId === 'ar.sudais') return 'sds';
    if (reciterId === 'ar.yasser') return 'yasser';
    return '';
}

/**
 * تشغيل سورة لقارئ معين
 */
function playSurah(reciterId, surahNumber, surahLabel, startTime) {
    const reciter = RECITERS[reciterId];
    if (!reciter) {
        console.error('❌ قارئ غير معروف:', reciterId);
        return;
    }

    stopAudio(true); // إيقاف أي صوت سابق دون تحديث الواجهة

    currentReciterId = reciterId;
    currentSurahNumber = surahNumber;
    currentSurahLabel = surahLabel;

    const lang = localStorage.getItem('lang') || 'ar';
    const reciterName = lang === 'ar' ? reciter.name : reciter.nameEn;
    updatePlayerUI(reciterName, surahLabel);

    const surahStr = String(surahNumber).padStart(3, '0');
    tryPlayUrl(reciter, surahStr, 0, reciterName, surahLabel, startTime || 0);
}

/**
 * محاولة التشغيل من سيرفر مع ترتيب الاحتياط
 */
function tryPlayUrl(reciter, surahStr, serverIndex, reciterName, surahLabel, startTime) {
    if (serverIndex >= reciter.servers.length) {
        if (currentAudio && !currentAudio.paused) return;
        const lang = localStorage.getItem('lang') || 'ar';
        const msg = lang === 'ar'
            ? '❌ تعذر تشغيل السورة. تحقق من اتصالك بالإنترنت.'
            : '❌ Could not play surah. Check your internet connection.';
        updatePlayerUI('', '');
        alert(msg);
        return;
    }

    const server = reciter.servers[serverIndex];
    const url = `${server.url}/${surahStr}.mp3`;

    console.log(`🔄 محاولة التشغيل من: ${url}`);
    updatePlayerUI(reciterName, surahLabel);

    const audio = new Audio(url);
    audio.preload = 'auto';
    let resolved = false;

    const startPlayback = () => {
        if (resolved) return;
        resolved = true;

        console.log(`✅ تم التحميل بنجاح من: ${url}`);
        currentAudio = audio;

        if (startTime && startTime > 0) {
            try { audio.currentTime = startTime; } catch (e) { }
        }

        audio.play().catch(err => {
            console.error('❌ فشل play:', err);
            if (currentAudio === audio && audio.paused) {
                tryPlayUrl(reciter, surahStr, serverIndex + 1, reciterName, surahLabel, startTime);
            }
        });

        // حفظ موضع الصوت باستمرار
        audio.addEventListener('timeupdate', () => {
            if (!audio.paused) {
                saveCurrentAudioState();
            }
        });
    };

    audio.addEventListener('canplaythrough', startPlayback);
    audio.addEventListener('canplay', startPlayback);

    audio.addEventListener('ended', () => {
        localStorage.setItem('quranPlayer', JSON.stringify({
            isPlaying: false,
            reciterId: '',
            reciterName: '',
            surahNumber: 0,
            surahLabel: '',
            currentTime: 0
        }));
        updatePlayerUI('', localStorage.getItem('lang') === 'en' ? 'Player Stopped' : 'المشغل متوقف');
    });

    audio.addEventListener('error', () => {
        if (resolved) return;
        console.log(`⚠️ فشل التحميل من: ${url}, نجرب السيرفر التالي...`);
        tryPlayUrl(reciter, surahStr, serverIndex + 1, reciterName, surahLabel, startTime);
    });

    audio.load();
}

/**
 * إيقاف التشغيل
 */
function stopAudio(silent) {
    if (currentAudio && currentReciterId && currentSurahNumber) {
        pausedPosition = {
            reciterId: currentReciterId,
            surahNumber: currentSurahNumber,
            surahLabel: currentSurahLabel,
            currentTime: currentAudio.currentTime || 0
        };
    }

    if (currentAudio) {
        try {
            currentAudio.pause();
            currentAudio.removeAttribute('src');
            currentAudio.load();
        } catch (e) { }
        currentAudio = null;
    }

    currentReciterId = '';
    currentSurahNumber = 0;

    localStorage.setItem('quranPlayer', JSON.stringify({
        isPlaying: false,
        reciterId: pausedPosition ? pausedPosition.reciterId : '',
        reciterName: '',
        surahNumber: pausedPosition ? pausedPosition.surahNumber : 0,
        surahLabel: pausedPosition ? pausedPosition.surahLabel : '',
        currentTime: pausedPosition ? pausedPosition.currentTime : 0
    }));

    if (!silent) {
        const lang = localStorage.getItem('lang') || 'ar';
        updatePlayerUI('', lang === 'ar' ? 'المشغل متوقف' : 'Player Stopped');
    }
}

/**
 * حفظ حالة الصوت في localStorage
 */
function saveCurrentAudioState() {
    if (currentAudio && !currentAudio.paused && currentReciterId && currentSurahNumber) {
        const currentTime = currentAudio.currentTime || 0;
        localStorage.setItem('quranPlayer', JSON.stringify({
            isPlaying: true,
            reciterId: currentReciterId,
            reciterName: '',
            surahNumber: currentSurahNumber,
            surahLabel: `سورة ${currentSurahNumber}`,
            currentTime: currentTime
        }));
    }
}

/**
 * تحديث واجهة المشغل
 */
function updatePlayerUI(reciterName, surahLabel) {
    const statusEl = document.getElementById('playerStatus');
    if (!statusEl) return;

    const lang = localStorage.getItem('lang') || 'ar';
    const isPlaying = !!(reciterName && surahLabel && surahLabel !== 'المشغل متوقف' && surahLabel !== 'Player Stopped');

    document.querySelectorAll('.main-featured-box').forEach(box => {
        const stopBtn = box.querySelector('.stop-btn');
        if (!stopBtn) return;
        const boxReciterId = getReciterIdFromBox(box);
        if (isPlaying && boxReciterId === currentReciterId) {
            stopBtn.style.display = 'inline-block';
        } else {
            stopBtn.style.display = 'none';
        }
    });

    if (isPlaying) {
        statusEl.textContent = lang === 'ar' 
            ? `🎵 جارٍ التشغيل: ${surahLabel} - ${reciterName}`
            : `🎵 Now Playing: ${surahLabel} - ${reciterName}`;
        statusEl.style.background = 'linear-gradient(135deg, #0d2818, #1b5e3b)';
    } else {
        statusEl.textContent = `🎵 ${surahLabel || (lang === 'ar' ? 'المشغل متوقف' : 'Player Stopped')}`;
        statusEl.style.background = 'linear-gradient(135deg, #1a1a2e, #16213e)';
    }
}

/**
 * تحديد معرف القارئ من العناصر
 */
function getReciterIdFromBox(box) {
    const titleEl = box.querySelector('.reciter-title');
    if (!titleEl) return null;

    const text = titleEl.textContent.trim();
    const dataAr = titleEl.getAttribute('data-ar') || '';
    const dataEn = titleEl.getAttribute('data-en') || '';

    if (text.includes('مشاري') || text.includes('العفاسي') || dataAr.includes('مشاري') || dataEn.includes('Alafasy')) return 'ar.alafasy';
    if (text.includes('ماهر') || text.includes('المعيقلي') || dataAr.includes('ماهر') || dataEn.includes('Maher')) return 'ar.maher';
    if (text.includes('عبد الباسط') || text.includes('عبد الياسط') || dataAr.includes('عبد الباسط') || dataEn.includes('Abdul Basit')) return 'ar.abdulbasit';
    if (text.includes('السديس') || dataAr.includes('السديس') || dataEn.includes('Al-Sudais')) return 'ar.sudais';
    if (text.includes('ياسر') || text.includes('الدوسري') || dataAr.includes('ياسر') || dataEn.includes('Yasser')) return 'ar.yasser';

    return null;
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds) || seconds < 0) seconds = 0;
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function addProgressBar(box, reciterId) {
    if (box.querySelector('.player-progress')) return;

    const details = box.querySelector('.reciter-details');
    if (!details) return;

    const progress = document.createElement('div');
    progress.className = 'player-progress';

    const currentTimeEl = document.createElement('span');
    currentTimeEl.className = 'time-label';
    currentTimeEl.textContent = '00:00';

    const bar = document.createElement('input');
    bar.type = 'range';
    bar.className = 'progress-bar';
    bar.min = 0;
    bar.max = 100;
    bar.value = 0;

    const durationEl = document.createElement('span');
    durationEl.className = 'time-label';
    durationEl.textContent = '00:00';

    progress.appendChild(currentTimeEl);
    progress.appendChild(bar);
    progress.appendChild(durationEl);
    details.appendChild(progress);

    let seeking = false;
    bar.addEventListener('input', () => {
        seeking = true;
        currentTimeEl.textContent = formatTime((bar.value / 100) * (currentAudio ? currentAudio.duration : 0));
    });
    bar.addEventListener('change', () => {
        if (currentAudio && currentAudio.duration) {
            const target = (bar.value / 100) * currentAudio.duration;
            try { currentAudio.currentTime = target; } catch (e) { }
        }
        seeking = false;
    });

    box._progress = { progress, currentTimeEl, bar, durationEl, seeking: () => seeking };
}

function updateProgressUI() {
    const activeReciterId = currentReciterId;
    document.querySelectorAll('.main-featured-box').forEach(box => {
        const boxReciterId = getReciterIdFromBox(box);
        const ref = box._progress;
        if (!ref) return;

        const isActive = !!activeReciterId && boxReciterId === activeReciterId;

        if (isActive && currentAudio) {
            ref.progress.style.display = 'flex';
            const current = ref.seeking() ? parseFloat(ref.bar.value) / 100 * (currentAudio.duration || 0) : (currentAudio.currentTime || 0);
            const dur = currentAudio.duration || 0;
            const pct = dur ? (current / dur) * 100 : 0;

            ref.bar.value = pct;
            ref.bar.style.setProperty('--progress', pct + '%');
            ref.currentTimeEl.textContent = formatTime(current);
            ref.durationEl.textContent = formatTime(dur);
        } else {
            ref.progress.style.display = 'none';
        }
    });
}

function initQuranPlayers() {
    const boxes = document.querySelectorAll('.main-featured-box');

    boxes.forEach((box) => {
        const select = box.querySelector('.surah-select');
        const playBtn = box.querySelector('.main-play-btn');
        const stopBtn = box.querySelector('.stop-btn');

        if (!select || !playBtn) return;

        const reciterId = getReciterIdFromBox(box);
        if (!reciterId) return;

        addProgressBar(box, reciterId);

        playBtn.addEventListener('click', () => {
            const surahNumber = parseInt(select.value);

            if (pausedPosition && pausedPosition.reciterId === reciterId && pausedPosition.surahNumber === surahNumber) {
                playSurah(reciterId, surahNumber, pausedPosition.surahLabel || `سورة ${surahNumber}`, pausedPosition.currentTime);
                return;
            }

            if (!surahNumber) {
                const lang = localStorage.getItem('lang') || 'ar';
                alert(lang === 'ar' ? 'الرجاء اختيار سورة أولاً' : 'Please select a surah first');
                return;
            }

            const selectedOption = select.options[select.selectedIndex];
            const surahLabel = selectedOption ? selectedOption.textContent : `سورة ${surahNumber}`;

            playSurah(reciterId, surahNumber, surahLabel);
        });

        if (stopBtn) {
            stopBtn.addEventListener('click', () => stopAudio(false));
        }
    });

    setInterval(updateProgressUI, 500);
}

function restorePlayerState() {
    const saved = localStorage.getItem('quranPlayer');
    if (!saved) return;

    try {
        const state = JSON.parse(saved);
        if (state.isPlaying && state.reciterId && state.surahNumber) {
            playSurah(state.reciterId, state.surahNumber, state.surahLabel || `سورة ${state.surahNumber}`, state.currentTime || 0);
        } else {
            const lang = localStorage.getItem('lang') || 'ar';
            updatePlayerUI('', lang === 'ar' ? 'المشغل متوقف' : 'Player Stopped');
        }
    } catch (e) {
        console.warn('⚠️ فشل استعادة حالة المشغل:', e);
    }
}

// ================ 3. نظام الإشعارات والتنبيهات الموحد (Toast) ================

const TOAST_CONTAINER_ID = 'globalToastContainer';
const PENDING_TOAST_KEY = 'pendingGlobalToast';

function ensureToastStyles() {
    if (document.getElementById('globalToastStyles')) return;
    const style = document.createElement('style');
    style.id = 'globalToastStyles';
    style.textContent = `
.global-toast-container{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:99999;display:flex;flex-direction:column;align-items:center;gap:10px;pointer-events:none;width:90%;max-width:420px}
.global-toast{pointer-events:auto;width:100%;background:#ffffff;color:#2d3748;border:1px solid #e2e8f0;border-right:5px solid #1b5e3b;border-radius:12px;padding:14px 18px;box-shadow:0 8px 25px rgba(0,0,0,0.2);animation:globalToastIn .3s ease;font-family:'Amiri',serif;font-size:1.1rem;text-align:center;direction:rtl}
body.dark-mode .global-toast{background:#1e262c;color:#f7fafc;border-color:#2d3748;border-right-color:#2e8b57}
.global-toast.azkar{border-right-color:#2e8b57}
.global-toast.prayer{border-right-color:#1b5e3b}
.global-toast.hide{animation:globalToastOut .3s ease forwards}
@keyframes globalToastIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes globalToastOut{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(20px)}}
`;
    document.head.appendChild(style);
}

function ensureToastContainer() {
    ensureToastStyles();
    let container = document.getElementById(TOAST_CONTAINER_ID);
    if (container) return container;
    container = document.createElement('div');
    container.id = TOAST_CONTAINER_ID;
    container.className = 'global-toast-container';
    document.body.appendChild(container);
    return container;
}

function showGlobalToast(message, type, persist) {
    const container = ensureToastContainer();
    const toast = document.createElement('div');
    toast.className = 'global-toast' + (type ? ' ' + type : '');
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
    }, 4000);

    if (persist) {
        try {
            localStorage.setItem(PENDING_TOAST_KEY, JSON.stringify({ message, type: type || '', time: Date.now() }));
        } catch (e) { }
    }
}

function showPendingGlobalToast() {
    try {
        const raw = localStorage.getItem(PENDING_TOAST_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (data && data.message && Date.now() - data.time < 5000) {
            showGlobalToast(data.message, data.type, false);
        }
        localStorage.removeItem(PENDING_TOAST_KEY);
    } catch (e) {
        localStorage.removeItem(PENDING_TOAST_KEY);
    }
}

// ================ 4. نظام الأذكار الموحد ================

const GLOBAL_AZKAR = [
    "سبحان الله", "الحمد لله", "لا إله إلا الله", "الله أكبر",
    "أستغفر الله العظيم", "لا حول ولا قوة إلا بالله",
    "اللهم صلِّ وسلم على نبينا محمد", "سبحان الله وبحمده",
    "سبحان الله العظيم", "الحمد لله على كل حال", "اللهم اغفر لي",
    "اللهم إني أسألك العفو والعافية", "اللهم اجعل في قلبي نوراً",
    "اللهم إني أسألك الجنة وأعوذ بك من النار", "اللهم إني توكلت عليك"
];
const GLOBAL_AZKAR_EN = {
    "سبحان الله": "Glory be to Allah",
    "الحمد لله": "Praise be to Allah",
    "لا إله إلا الله": "There is no god but Allah",
    "الله أكبر": "Allah is the Greatest",
    "أستغفر الله العظيم": "I seek forgiveness from Allah",
    "لا حول ولا قوة إلا بالله": "There is no power or might except from Allah",
    "اللهم صلِّ وسلم على نبينا محمد": "O Allah, bless our Prophet Muhammad",
    "سبحان الله وبحمده": "Glory and praise be to Allah",
    "سبحان الله العظيم": "Glorious is Allah the Almighty",
    "الحمد لله على كل حال": "Praise be to Allah in all circumstances",
    "اللهم اغفر لي": "O Allah, forgive me",
    "اللهم إني أسألك العفو والعافية": "O Allah, I ask for pardon and well-being",
    "اللهم اجعل في قلبي نوراً": "O Allah, place light in my heart",
    "اللهم إني أسألك الجنة وأعوذ بك من النار": "O Allah, I ask for Paradise",
    "اللهم إني توكلت عليك": "O Allah, I put my trust in You"
};

const LAST_AZKAR_KEY = 'lastAzkarNotifTime';
let globalAzkarInterval = null;

function globalLang() { return localStorage.getItem('lang') || 'ar'; }

function globalSendAzkar() {
    if (localStorage.getItem('notifActive') !== 'true') return;
    const lastSent = parseInt(localStorage.getItem(LAST_AZKAR_KEY) || '0');
    const minutes = parseInt(localStorage.getItem('notifInterval') || '30');
    const ms = (isNaN(minutes) || minutes < 1 ? 30 : minutes) * 60 * 1000;

    if (lastSent && (Date.now() - lastSent) < ms) return;

    const zikr = GLOBAL_AZKAR[Math.floor(Math.random() * GLOBAL_AZKAR.length)];
    const lang = globalLang();
    const body = lang === 'ar' ? zikr : (GLOBAL_AZKAR_EN[zikr] || zikr);
    const title = lang === 'ar' ? '📿 تذكير بالأذكار' : '📿 Zikr Reminder';

    try {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body,
                icon: 'https://cdn-icons-png.flaticon.com/512/2913/2913520.png'
            });
        }
    } catch (e) { }

    showGlobalToast(title + ': ' + body, 'azkar', true);
    localStorage.setItem(LAST_AZKAR_KEY, String(Date.now()));
}

function startGlobalAzkar() {
    if (globalAzkarInterval) clearTimeout(globalAzkarInterval);

    const minutes = parseInt(localStorage.getItem('notifInterval') || '30');
    const ms = (isNaN(minutes) || minutes < 1 ? 30 : minutes) * 60 * 1000;

    let lastSent = parseInt(localStorage.getItem(LAST_AZKAR_KEY) || '0');
    if (!lastSent) {
        lastSent = Date.now();
        localStorage.setItem(LAST_AZKAR_KEY, String(lastSent));
    }

    const elapsed = Date.now() - lastSent;
    const nextDelay = elapsed >= ms ? 0 : ms - elapsed;

    const schedule = (delay) => {
        if (globalAzkarInterval) clearTimeout(globalAzkarInterval);
        globalAzkarInterval = setTimeout(() => {
            globalSendAzkar();
            schedule(ms);
        }, Math.max(0, delay));
    };

    schedule(nextDelay);
}

// ================ 5. نظام إشعارات الصلاة والأذان ================

const GLOBAL_PRAYER_ORDER = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const GLOBAL_PRAYER_NAMES = { Fajr: 'الفجر', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء' };
const GLOBAL_PRAYER_NAMES_EN = { Fajr: 'Fajr', Dhuhr: 'Dhuhr', Asr: 'Asr', Maghrib: 'Maghrib', Isha: 'Isha' };

const ADHAN_URLS = [
    'https://cdn.islamic.network/media/audio/adhan/makkah/128/adhan-makkah-128kbps.mp3',
    'https://www.islamcan.com/audio/adhan/azan1.mp3',
    'https://everyayah.com/data/Adhan/azan_1.mp3'
];

const NOTIFIED_PRAYERS_KEY = 'notifiedPrayersGlobal';
const ADHAN_PLAYED_KEY = 'adhanPlayedGlobal';
const USER_LOCATION_KEY = 'userLocation';

let globalPrayerInterval = null;
let globalPrayerTimes = null;
let globalNotified = {};
let globalPrayerInitStarted = false;
let audioUnlocked = false;
let adhanAudio = null;

function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    try {
        const t = new Audio();
        t.volume = 0;
        t.play().then(() => { t.pause(); }).catch(() => { });
    } catch (e) { }
}

function loadNotifiedPrayers() {
    try { globalNotified = JSON.parse(localStorage.getItem(NOTIFIED_PRAYERS_KEY) || '{}'); } 
    catch (e) { globalNotified = {}; }
}

function saveNotifiedPrayers() {
    try { localStorage.setItem(NOTIFIED_PRAYERS_KEY, JSON.stringify(globalNotified)); } catch (e) { }
}

function loadAdhanPlayed() {
    try { return JSON.parse(localStorage.getItem(ADHAN_PLAYED_KEY) || '{}'); } 
    catch (e) { return {}; }
}

function saveAdhanPlayed(obj) {
    try { localStorage.setItem(ADHAN_PLAYED_KEY, JSON.stringify(obj)); } catch (e) { }
}

function playAdhan() {
    if (adhanAudio) {
        try { adhanAudio.pause(); } catch (e) { }
    }
    adhanAudio = new Audio();
    adhanAudio.volume = 1.0;
    let index = 0;

    function tryNext() {
        if (index >= ADHAN_URLS.length) return;
        adhanAudio.src = ADHAN_URLS[index];
        adhanAudio.play().catch(() => {
            index++;
            tryNext();
        });
    }

    adhanAudio.addEventListener('canplay', () => {
        adhanAudio.play().catch(() => {
            index++;
            tryNext();
        });
    });
    adhanAudio.addEventListener('error', () => {
        index++;
        tryNext();
    });

    tryNext();
}

function getGlobalLocation() {
    try {
        const saved = localStorage.getItem(USER_LOCATION_KEY);
        if (saved) {
            const loc = JSON.parse(saved);
            if (loc && loc.lat && loc.lon) return loc;
        }
    } catch (e) { }
    return { lat: 30.0444, lon: 31.2357 }; // القليوبية/القاهرة كافتراضي
}

async function globalFetchPrayerTimes() {
    try {
        const loc = getGlobalLocation();
        const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${loc.lat}&longitude=${loc.lon}&method=5`);
        const data = await res.json();
        if (data && data.code === 200) {
            globalPrayerTimes = data.data.timings;
        }
    } catch (e) { }
}

function globalTimeToDate(timeStr) {
    if (!timeStr) return null;
    const p = timeStr.split(':');
    const d = new Date();
    d.setHours(parseInt(p[0]), parseInt(p[1]), 0, 0);
    return d;
}

function globalCheckPrayer() {
    if (!globalPrayerTimes) return;
    const before = parseInt(localStorage.getItem('prayerNotifBefore') || '5');
    const now = new Date();
    const today = now.toDateString();
    const lang = globalLang();
    const adhanPlayed = loadAdhanPlayed();
    const adhanEnabled = localStorage.getItem('adhanActive') !== 'false';

    for (const p of GLOBAL_PRAYER_ORDER) {
        const pt = globalTimeToDate(globalPrayerTimes[p]);
        if (!pt) continue;
        const nt = new Date(pt.getTime() - before * 60000);
        const key = `${today}_${p}`;
        const adhanKey = `${today}_${p}`;

        if (now >= nt && now < pt && !globalNotified[key]) {
            globalNotified[key] = true;
            saveNotifiedPrayers();
            if ('Notification' in window && Notification.permission === 'granted') {
                const name = lang === 'ar' ? GLOBAL_PRAYER_NAMES[p] : GLOBAL_PRAYER_NAMES_EN[p];
                try {
                    new Notification(lang === 'ar' ? '🕌 حان وقت الصلاة' : '🕌 Prayer Time Approaching', {
                        body: lang === 'ar'
                            ? `🕌 ستصلى صلاة ${name} بعد ${before} دقائق`
                            : `🕌 ${name} prayer is in ${before} minutes`,
                        icon: 'https://cdn-icons-png.flaticon.com/512/2913/2913520.png'
                    });
                } catch (e) { }
            }
        }

        if (adhanEnabled && !adhanPlayed[adhanKey] && now >= pt && now < new Date(pt.getTime() + 120 * 1000)) {
            adhanPlayed[adhanKey] = true;
            saveAdhanPlayed(adhanPlayed);
            playAdhan();
            if ('Notification' in window && Notification.permission === 'granted') {
                const name = lang === 'ar' ? GLOBAL_PRAYER_NAMES[p] : GLOBAL_PRAYER_NAMES_EN[p];
                try {
                    new Notification(lang === 'ar' ? '📢 حان الآن وقت صلاة ' + name : '📢 ' + name + ' prayer time is now', {
                        body: lang === 'ar' ? `📢 حان الآن وقت صلاة ${name}` : `📢 ${name} prayer time has arrived`,
                        icon: 'https://cdn-icons-png.flaticon.com/512/2913/2913520.png'
                    });
                } catch (e) { }
            }
        }
    }

    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yStr = y.toDateString();
    Object.keys(globalNotified).forEach(k => {
        if (k.startsWith(yStr)) delete globalNotified[k];
    });
    saveNotifiedPrayers();

    const adhan = loadAdhanPlayed();
    Object.keys(adhan).forEach(k => {
        if (k.startsWith(yStr)) delete adhan[k];
    });
    saveAdhanPlayed(adhan);
}

function startGlobalPrayer() {
    if (globalPrayerInterval) clearInterval(globalPrayerInterval);
    if (!globalPrayerInitStarted) {
        globalPrayerInitStarted = true;
        globalFetchPrayerTimes();
    }
    loadNotifiedPrayers();
    globalCheckPrayer();
    globalPrayerInterval = setInterval(globalCheckPrayer, 1000);
}

function initGlobalNotifications() {
    if (localStorage.getItem('notifActive') === 'true') {
        startGlobalAzkar();
    }

    if (localStorage.getItem('prayerNotifActive') === 'true') {
        startGlobalPrayer();
    }

    window.addEventListener('storage', (e) => {
        if (e.key === 'notifActive' || e.key === 'notifInterval') {
            if (globalAzkarInterval) clearTimeout(globalAzkarInterval);
            if (localStorage.getItem('notifActive') === 'true') startGlobalAzkar();
        }
        if (e.key === 'prayerNotifActive' || e.key === 'prayerNotifBefore') {
            if (globalPrayerInterval) clearInterval(globalPrayerInterval);
            if (localStorage.getItem('prayerNotifActive') === 'true') startGlobalPrayer();
        }
    });
}

// ================ 6. التبديل بين صفحات التطبيق (SPA) ================

function navigateTo(page) {
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });

    const target = document.getElementById(`page-${page}`);
    if (target) {
        target.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ================ 7. تهيئة التطبيق عند جاهزية DOM ================

document.addEventListener('DOMContentLoaded', () => {
    // تهيئة عناصر المشغل والربط بالأزرار
    initQuranPlayers();

    // استعادة حالة الصوت المسجلة
    restorePlayerState();

    // عرض أي إشعارات معلقة
    showPendingGlobalToast();

    // تفعيل مراقبة الإشعارات العامة
    initGlobalNotifications();

    // فك حظر تشغيل الصوت لأول تفاعل
    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('touchstart', unlockAudio, { once: true });
    document.addEventListener('keydown', unlockAudio, { once: true });
});