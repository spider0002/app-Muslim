// ================= قائمة الأذكار =================
const azkarList = [
    "سبحان الله",
    "الحمد لله",
    "لا إله إلا الله",
    "الله أكبر",
    "أستغفر الله العظيم",
    "لا حول ولا قوة إلا بالله",
    "اللهم صلِّ وسلم على نبينا محمد",
    "سبحان الله وبحمده",
    "سبحان الله العظيم",
    "الحمد لله على كل حال",
    "اللهم اغفر لي",
    "رب اغفر لي وتب علي إنك أنت التواب الرحيم",
    "اللهم إني أسألك العفو والعافية",
    "اللهم إني أسألك الهدى والتقى والعفاف والغنى",
    "اللهم اجعل في قلبي نوراً",
    "اللهم إني أسألك الجنة وأعوذ بك من النار",
    "اللهم احفظني من بين يدي ومن خلفي",
    "اللهم إني توكلت عليك",
    "اللهم إني ظلمت نفسي ظلماً كثيراً",
    "اللهم أنت السلام ومنك السلام تباركت يا ذا الجلال والإكرام"
];

const azkarTranslations = {
    "سبحان الله": "Glory be to Allah",
    "الحمد لله": "Praise be to Allah",
    "لا إله إلا الله": "There is no god but Allah",
    "الله أكبر": "Allah is the Greatest",
    "أستغفر الله العظيم": "I seek forgiveness from Allah",
    "لا حول ولا قوة إلا بالله": "There is no power or might except from Allah",
    "اللهم صلِّ وسلم على نبينا محمد": "O Allah, bless and grant peace to our Prophet Muhammad",
    "سبحان الله وبحمده": "Glory and praise be to Allah",
    "سبحان الله العظيم": "Glorious is Allah the Almighty",
    "الحمد لله على كل حال": "Praise be to Allah in all circumstances",
    "اللهم اغفر لي": "O Allah, forgive me",
    "رب اغفر لي وتب علي إنك أنت التواب الرحيم": "My Lord, forgive me and accept my repentance",
    "اللهم إني أسألك العفو والعافية": "O Allah, I ask You for pardon and well-being",
    "اللهم إني أسألك الهدى والتقى والعفاف والغنى": "O Allah, I ask You for guidance, piety, chastity, and self-sufficiency",
    "اللهم اجعل في قلبي نوراً": "O Allah, place light in my heart",
    "اللهم إني أسألك الجنة وأعوذ بك من النار": "O Allah, I ask You for Paradise and seek refuge from the Fire",
    "اللهم احفظني من بين يدي ومن خلفي": "O Allah, protect me from before me and behind me",
    "اللهم إني توكلت عليك": "O Allah, I put my trust in You",
    "اللهم إني ظلمت نفسي ظلماً كثيراً": "O Allah, I have wronged myself greatly",
    "اللهم أنت السلام ومنك السلام تباركت يا ذا الجلال والإكرام": "O Allah, You are Peace and from You is peace, blessed are You, O Possessor of Majesty and Honor"
};

// ================= الصوت والأذان =================
const adhanSound = new Audio('./audio.mp3');

function playAdhanSound() {
    const isAdhanActive = localStorage.getItem('adhanActive') === 'true';
    if (isAdhanActive) {
        adhanSound.currentTime = 0;
        adhanSound.play().catch(err => {
            console.warn('تعذر تشغيل الصوت محلياً، جارِ استخدام صوت احتياطي...');
            const backupAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            backupAudio.play().catch(e => console.log('المتصفح يمنع تشغيل الصوت تلقائياً بدون تفاعل من المستخدم'));
        });
    }
}

// ================= متغيرات الإشعارات =================
let notificationInterval = null;
let isNotifActive = false;

function setLanguage(lang) {
    if (typeof currentLang !== 'undefined' && currentLang === lang) return;
    
    currentLang = lang;
    localStorage.setItem('lang', lang);
    
    if (lang === 'ar') {
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.setAttribute('lang', 'ar');
    } else {
        document.documentElement.setAttribute('dir', 'ltr');
        document.documentElement.setAttribute('lang', 'en');
    }
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    
    if (typeof updateUITexts === 'function') updateUITexts();
    updateNotifPreview();
    
    try { 
        localStorage.setItem('lang-changed', String(Date.now())); 
    } catch (e) {}
}

// ================= نظام الإشعارات =================
function showInPageToast(message, type) {
    const container = document.getElementById('inPageToastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'inpage-toast' + (type ? ' ' + type : '');
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

async function requestNotifPermission() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    
    try {
        const result = await Notification.requestPermission();
        return result === 'granted';
    } catch (e) {
        return false;
    }
}

function getRandomZikr() {
    const index = Math.floor(Math.random() * azkarList.length);
    return azkarList[index];
}

function sendNotification() {
    const zikr = getRandomZikr();
    const activeLang = typeof currentLang !== 'undefined' ? currentLang : (localStorage.getItem('lang') || 'ar');
    const title = activeLang === 'ar' ? '📿 تذكير بالأذكار' : '📿 Zikr Reminder';
    const body = activeLang === 'ar' ? zikr : (azkarTranslations[zikr] || zikr);
    
if ('Notification' in window && Notification.permission === 'granted') {
        try {
            new Notification(title, {
                body: body,
                icon: '📿'
            });
        } catch (e) {}
    }
    
    showInPageToast(title + ' — ' + body, 'success');
    // عرض تنبيه داخل الصفحة يبقى ظاهراً عند التنقل (دون إذن المتصفح)
    if (typeof showGlobalToast === 'function') {
        showGlobalToast(title + ': ' + body, 'azkar', true);
    }
    updateNotifPreview(zikr);
}

function updateNotifPreview(zikr) {
    const preview = document.getElementById('zkrPreviewText');
    if (preview) {
        const activeLang = typeof currentLang !== 'undefined' ? currentLang : (localStorage.getItem('lang') || 'ar');
        if (zikr) {
            preview.textContent = activeLang === 'ar' ? zikr : (azkarTranslations[zikr] || zikr);
            preview.style.direction = activeLang === 'ar' ? 'rtl' : 'ltr';
        } else {
            preview.textContent = typeof getLangText === 'function' ? getLangText('--', '--') : '--';
        }
    }
}

async function startNotifications() {
    // الإشعارات تُدار مركزياً من quran-api.js.
    // صفحة الإعدادات تحفظ الحالة والمدة فقط ولا تنشئ Timer خاصاً بها،
    // حتى لا يتكرر الإشعار عند فتح/إغلاق صفحة الإعدادات.
    if (notificationInterval) {
        clearTimeout(notificationInterval);
        notificationInterval = null;
    }

    const intervalSelect = document.getElementById('notifInterval');
    let intervalMinutes = intervalSelect ? parseInt(intervalSelect.value, 10) : 30;
    if (isNaN(intervalMinutes) || intervalMinutes < 1) intervalMinutes = 30;

    isNotifActive = true;
    localStorage.setItem('notifActive', 'true');
    localStorage.setItem('notifInterval', String(intervalMinutes));

    // عند التفعيل نبدأ العد من هذه اللحظة، فلا يصل أول ذكر فوراً.
    localStorage.setItem('lastAzkarNotifTime', String(Date.now()));

    try { localStorage.setItem('storage-nudge', String(Date.now())); } catch (e) {}
    updateNotifUI();
}

function stopNotifications() {
    if (notificationInterval) {
        clearTimeout(notificationInterval);
        notificationInterval = null;
    }
    isNotifActive = false;
    localStorage.setItem('notifActive', 'false');
    try { localStorage.setItem('storage-nudge', String(Date.now())); } catch (e) {}
    updateNotifUI();
}

function toggleNotifications() {
    if (isNotifActive) stopNotifications();
    else startNotifications();
}

// ================= نظام إشعارات الصلاة =================
let prayerNotifInterval = null;
let isPrayerNotifActive = false;
let prayerTimesData = null;
let notifiedPrayers = {};

function saveUserLocation(latitude, longitude) {
    try {
        localStorage.setItem('userLocation', JSON.stringify({ lat: latitude, lon: longitude }));
    } catch (e) {}
}

async function fetchPrayerTimes(latitude, longitude) {
    saveUserLocation(latitude, longitude);
    try {
        const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=5`);
        const result = await response.json();
        
        if (result.code === 200) {
            prayerTimesData = result.data.timings;
            const locationStatus = document.getElementById('locationStatusText');
            if (locationStatus) {
                const dateInfo = result.data.date.hijri;
                const langFunc = typeof getLangText === 'function' ? getLangText : (ar, en) => ar;
                locationStatus.textContent = langFunc(
                    `✅ الموقع: ${dateInfo.day} ${dateInfo.month.ar} ${dateInfo.year} هـ`,
                    `✅ Location: ${dateInfo.day} ${dateInfo.month.en} ${dateInfo.year} AH`
                );
            }
            return true;
        }
    } catch (error) {
        console.error('Error fetching prayer times:', error);
        const locationStatus = document.getElementById('locationStatusText');
        if (locationStatus) {
            const langFunc = typeof getLangText === 'function' ? getLangText : (ar, en) => ar;
            locationStatus.textContent = langFunc(
                '❌ تعذر جلب مواقيت الصلاة',
                '❌ Failed to fetch prayer times'
            );
        }
    }
    return false;
}

function initPrayerLocation() {
    const locationStatus = document.getElementById('locationStatusText');
    const langFunc = typeof getLangText === 'function' ? getLangText : (ar, en) => ar;
    if (locationStatus) {
        locationStatus.textContent = langFunc('جاري تحديد الموقع...', 'Detecting location...');
    }
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                await fetchPrayerTimes(position.coords.latitude, position.coords.longitude);
            },
            async () => {
                const status = document.getElementById('locationStatusText');
                if (status) {
                    status.textContent = langFunc('📍 الموقع الافتراضي: القاهرة', '📍 Default Location: Cairo');
                }
                await fetchPrayerTimes(30.0444, 31.2357);
            }
        );
    } else {
        fetchPrayerTimes(30.0444, 31.2357);
    }
}

function timeToDate(timeStr) {
    if (!timeStr) return new Date();
    const cleanTime = timeStr.split(' ')[0];
    const [hours, minutes] = cleanTime.split(':');
    const d = new Date();
    d.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    return d;
}

function checkPrayerTimes() {
    if (!prayerTimesData) return;
    
    const langFunc = typeof getLangText === 'function' ? getLangText : (ar, en) => ar;
    const prayerOrder = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const prayerNames = {
        Fajr: langFunc('الفجر', 'Fajr'),
        Dhuhr: langFunc('الظهر', 'Dhuhr'),
        Asr: langFunc('العصر', 'Asr'),
        Maghrib: langFunc('المغرب', 'Maghrib'),
        Isha: langFunc('العشاء', 'Isha')
    };
    
    const now = new Date();
    const selectElem = document.getElementById('prayerNotifBefore');
    const beforeMinutes = selectElem ? parseInt(selectElem.value, 10) : 0;
    const today = now.toDateString();
    
    for (const prayer of prayerOrder) {
        const prayerTime = timeToDate(prayerTimesData[prayer]);
        const notifTime = new Date(prayerTime.getTime() - beforeMinutes * 60 * 1000);
        const key = `${today}_${prayer}_${beforeMinutes}`;
        
        if (now >= notifTime && now < new Date(prayerTime.getTime() + 60000) && !notifiedPrayers[key]) {
            notifiedPrayers[key] = true;
            
            if (beforeMinutes === 0) {
                playAdhanSound();
            }
            
            if ('Notification' in window && Notification.permission === 'granted') {
                const msgBody = beforeMinutes === 0
                    ? langFunc(`🕌 حان الآن موعد أذان ${prayerNames[prayer]}`, `🕌 It is now time for ${prayerNames[prayer]} prayer`)
                    : langFunc(`🕌 ستصلى صلاة ${prayerNames[prayer]} بعد ${beforeMinutes} دقائق`, `🕌 ${prayerNames[prayer]} prayer is in ${beforeMinutes} minutes`);
                
                new Notification(langFunc('🕌 تنبيه الصلاة', '🕌 Prayer Alert'), {
                    body: msgBody,
                    icon: '🕌'
                });
            }
            
            const lastAlertDiv = document.getElementById('lastPrayerAlertDiv');
            const lastAlertText = document.getElementById('lastPrayerAlertText');
            if (lastAlertDiv && lastAlertText) {
                lastAlertDiv.style.display = 'block';
                lastAlertText.textContent = `${prayerNames[prayer]} - ${beforeMinutes === 0 ? langFunc('الآن', 'Now') : langFunc('قبل ' + beforeMinutes + ' دقائق', beforeMinutes + ' min before')}`;
            }
        }
    }
}

async function startPrayerNotifications() {
    // الإشعارات الفعلية تُدار من quran-api.js فقط.
    // لا ننشئ setInterval ثانياً داخل صفحة الإعدادات.
    if (prayerNotifInterval) {
        clearInterval(prayerNotifInterval);
        prayerNotifInterval = null;
    }

    isPrayerNotifActive = true;
    localStorage.setItem('prayerNotifActive', 'true');
    try { localStorage.setItem('storage-nudge', String(Date.now())); } catch (e) {}
    updatePrayerNotifUI();

    const langFunc = typeof getLangText === 'function' ? getLangText : (ar, en) => ar;
    showInPageToast(langFunc('✅ تم تفعيل إشعارات الصلاة', '✅ Prayer alerts enabled'), 'success');
}

function stopPrayerNotifications() {
    if (prayerNotifInterval) {
        clearInterval(prayerNotifInterval);
        prayerNotifInterval = null;
    }
    isPrayerNotifActive = false;
    localStorage.setItem('prayerNotifActive', 'false');
    try { localStorage.setItem('storage-nudge', String(Date.now())); } catch (e) {}
    updatePrayerNotifUI();
}

function togglePrayerNotifications() {
    if (isPrayerNotifActive) stopPrayerNotifications();
    else startPrayerNotifications();
}

function updatePrayerNotifUI() {
    const btn = document.getElementById('prayerNotifBtn');
    const status = document.getElementById('prayerNotifStatus');
    if (!btn || !status) return;
    
    const langFunc = typeof getLangText === 'function' ? getLangText : (ar, en) => ar;
    if (isPrayerNotifActive) {
        btn.textContent = langFunc('⏹ إيقاف إشعارات الصلاة', '⏹ Stop Prayer Alerts');
        btn.className = 'notif-btn stop';
        status.textContent = langFunc('✅ إشعارات الصلاة نشطة', '✅ Prayer Alerts Active');
        status.className = 'notif-status active';
    } else {
        btn.textContent = langFunc('🔔 تفعيل إشعارات الصلاة', '🔔 Enable Prayer Alerts');
        btn.className = 'notif-btn start';
        status.textContent = langFunc('إشعارات الصلاة متوقفة', 'Prayer Alerts Stopped');
        status.className = 'notif-status inactive';
    }
}

function updateNotifUI() {
    const btn = document.getElementById('notificationBtn') || document.getElementById('notifToggleBtn');
    const status = document.getElementById('notifStatus');
    if (!btn || !status) return;
    
    const langFunc = typeof getLangText === 'function' ? getLangText : (ar, en) => ar;
    if (isNotifActive) {
        btn.textContent = langFunc('⏹ إيقاف الإشعارات', '⏹ Stop Notifications');
        btn.className = 'notif-btn stop';
        status.textContent = langFunc('✅ الإشعارات نشطة', '✅ Notifications Active');
        status.className = 'notif-status active';
    } else {
        btn.textContent = langFunc('🔔 بدء الإشعارات', '🔔 Start Notifications');
        btn.className = 'notif-btn start';
        status.textContent = langFunc('الإشعارات متوقفة', 'Notifications Stopped');
        status.className = 'notif-status inactive';
    }
}

// ================= حفظ واسترجاع الإعدادات =================
function saveSettings() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    if (typeof currentLang !== 'undefined') localStorage.setItem('lang', currentLang);
    
    const intervalSelect = document.getElementById('notifInterval');
    if (intervalSelect) localStorage.setItem('notifInterval', intervalSelect.value);
    
    localStorage.setItem('notifActive', isNotifActive ? 'true' : 'false');
    
    const prayerNotifBeforeSelect = document.getElementById('prayerNotifBefore');
    if (prayerNotifBeforeSelect) localStorage.setItem('prayerNotifBefore', prayerNotifBeforeSelect.value);
    
    localStorage.setItem('prayerNotifActive', isPrayerNotifActive ? 'true' : 'false');
    
    const adhanToggle = document.getElementById('adhanToggle');
    if (adhanToggle) localStorage.setItem('adhanActive', adhanToggle.checked ? 'true' : 'false');
}

function loadSettings() {
    const langFunc = typeof getLangText === 'function' ? getLangText : (ar, en) => ar;
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const themeIcon = document.getElementById('themeIcon');
        const themeText = document.getElementById('themeText');
        if (themeIcon) themeIcon.innerText = '☀️';
        if (themeText) themeText.innerText = langFunc('الوضع النهار', 'Light Mode');
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) darkModeToggle.checked = true;
    }
    
    const savedLang = localStorage.getItem('lang') || 'ar';
    setLanguage(savedLang);
    
    const savedInterval = localStorage.getItem('notifInterval');
    if (savedInterval) {
        const select = document.getElementById('notifInterval');
        if (select) select.value = savedInterval;
    }
    
const savedNotifActive = localStorage.getItem('notifActive');
    // استعادة حالة الزر فقط. لا نعيد تشغيل/إعادة ضبط المؤقت عند فتح الإعدادات.
    isNotifActive = savedNotifActive === 'true';
    updateNotifUI();
    
    const savedAdhanActive = localStorage.getItem('adhanActive');
    const adhanToggle = document.getElementById('adhanToggle');
    if (adhanToggle && savedAdhanActive !== null) {
        adhanToggle.checked = savedAdhanActive === 'true';
    }
}

// ================= التهيئة =================
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', function() {
            if (typeof toggleDarkMode === 'function') toggleDarkMode();
        });
    }
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            setLanguage(this.dataset.lang);
        });
    });
    
// زر تفعيل إشعارات الأذكار (id = notificationBtn في settings.html)
    const notifBtn = document.getElementById('notificationBtn') || document.getElementById('notifToggleBtn');
    if (notifBtn) notifBtn.addEventListener('click', toggleNotifications);
    
    window.addEventListener('beforeunload', saveSettings);
    
    initPrayerLocation();
    
    const prayerNotifBtn = document.getElementById('prayerNotifBtn');
    if (prayerNotifBtn) prayerNotifBtn.addEventListener('click', togglePrayerNotifications);
    
    const adhanToggle = document.getElementById('adhanToggle');
    if (adhanToggle) {
        adhanToggle.addEventListener('change', function() {
            localStorage.setItem('adhanActive', this.checked ? 'true' : 'false');
        });
    }
    
    const savedPrayerNotifActive = localStorage.getItem('prayerNotifActive');
    const savedPrayerNotifBefore = localStorage.getItem('prayerNotifBefore');
    const prayerNotifBeforeSelect = document.getElementById('prayerNotifBefore');
    
    if (prayerNotifBeforeSelect && savedPrayerNotifBefore) {
        prayerNotifBeforeSelect.value = savedPrayerNotifBefore;
    }
    
    // استعادة حالة الزر فقط. النظام المركزي في quran-api.js هو الذي يراقب الوقت.
    isPrayerNotifActive = savedPrayerNotifActive === 'true';
    updatePrayerNotifUI();

    // === فك حظر التشغيل التلقائي للصوت فور أول ضغطة للمستخدم ===
    document.addEventListener('click', () => {
        if (typeof adhanSound !== 'undefined') {
            adhanSound.play().then(() => {
                adhanSound.pause();
                adhanSound.currentTime = 0;
            }).catch(() => {});
        }
    }, { once: true });
});  

