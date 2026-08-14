/**
 * Audio SharedWorker - عامل مشترك يحمل كائن الصوت الوحيد
 * 
 * المشكلة: كل صفحة HTML منفصلة، وعند التنقل بين الصفحات كان كائن الصوت
 * يُدمَّر مع الصفحة، لذا كان القرآن يتوقف ويعيد التشغيل من البداية.
 * 
 * الحل: هذا العامل المشترك يعيش في الخلفية بين الصفحات، ويحمل كائن
 * الصوت الوحيد. أي صفحة تتصل به فقط لعرض الحالة والتحكم.
 */

// كائن الصوت الوحيد المستمر
let audio = null;
let currentReciter = '';
let currentSurah = 0;
let audioLoaded = false;

// قائمة الصفحات المتصلة
const clients = new Set();

// قائمة السيرفرات المعروفة (لإعادة المحاولة)
const SERVERS = {
    'afs': ['https://server8.mp3quran.net/afs', 'https://server6.mp3quran.net/afs', 'https://server7.mp3quran.net/afs'],
    'maher': ['https://server12.mp3quran.net/maher', 'https://server6.mp3quran.net/maher', 'https://server7.mp3quran.net/maher'],
    'basit': ['https://server7.mp3quran.net/basit', 'https://server6.mp3quran.net/basit', 'https://server8.mp3quran.net/basit'],
    'sds': ['https://server11.mp3quran.net/sds', 'https://server6.mp3quran.net/sds', 'https://server7.mp3quran.net/sds'],
    'yasser': ['https://server11.mp3quran.net/yasser', 'https://server6.mp3quran.net/yasser', 'https://server7.mp3quran.net/yasser']
};

// بث الحالة لجميع الصفحات المتصلة
function broadcast() {
    const state = {
        type: 'state',
        isPlaying: audio ? !audio.paused : false,
        reciterId: currentReciter,
        surahNumber: currentSurah,
        currentTime: audio ? (audio.currentTime || 0) : 0,
        duration: audio ? (audio.duration || 0) : 0
    };
    
    clients.forEach(port => {
        try {
            port.postMessage(state);
        } catch (e) {
            // تجاهل الأخطاء
        }
    });
}

// إنشاء كائن الصوت
function ensureAudio() {
    if (!audio) {
        audio = new Audio();
        audio.preload = 'auto';

        // تحديث الحالة أثناء التشغيل
        audio.addEventListener('timeupdate', broadcast);
        audio.addEventListener('play', broadcast);
        audio.addEventListener('pause', broadcast);

        audio.addEventListener('ended', () => {
            broadcast();
        });
    }
    return audio;
}

// محاولة تشغيل من سيرفر مع ترتيب
function tryServer(code, surahStr, serverIndex, startTime) {
    const servers = SERVERS[code] || [];
    if (serverIndex >= servers.length) {
        // كل السيرفرات فشلت
        broadcast();
        return;
    }

    const url = `${servers[serverIndex]}/${surahStr}.mp3`;
    const a = ensureAudio();
    let resolved = false;

    a.addEventListener('canplaythrough', () => {
        if (resolved) return;
        resolved = true;
        if (startTime && startTime > 0) {
            try { a.currentTime = startTime; } catch (e) {}
        }
        a.play().catch(() => {
            // فشل التشغيل، نجرب السيرفر التالي
            tryServer(code, surahStr, serverIndex + 1, startTime);
        });
        broadcast();
    });

    a.addEventListener('canplay', () => {
        if (resolved) return;
        resolved = true;
        if (startTime && startTime > 0) {
            try { a.currentTime = startTime; } catch (e) {}
        }
        a.play().catch(() => {});
        broadcast();
    });

    a.addEventListener('error', () => {
        if (resolved) return;
        tryServer(code, surahStr, serverIndex + 1, startTime);
    });

    a.src = url;
    a.load();
}

// معالجة الأوامر القادمة من الصفحات
function handleMessage(msg, port) {
    if (!msg || !msg.type) return;

    switch (msg.type) {
        case 'connect':
            // صفحة جديدة اتصلت - أرسل لها الحالة الحالية
            broadcast();
            break;

        case 'play': {
            const { code, surahNumber, startTime } = msg;
            // إيقاف أي صوت سابق
            stopAudio();
            currentReciter = code;
            currentSurah = surahNumber;
            const surahStr = String(surahNumber).padStart(3, '0');
            tryServer(code, surahStr, 0, startTime || 0);
            break;
        }

        case 'stop':
            stopAudio();
            break;

        case 'getState':
            broadcast();
            break;
    }
}

function stopAudio() {
    if (audio) {
        try {
            audio.pause();
            audio.removeAttribute('src');
            audio.load();
        } catch (e) {}
    }
    currentReciter = '';
    currentSurah = 0;
    broadcast();
}

self.onconnect = function(e) {
    const port = e.ports[0];
    clients.add(port);

    port.onmessage = function(event) {
        handleMessage(event.data, port);
    };

    // إرسال الحالة الحالية للصفحة المتصلة حديثاً
    broadcast();
    port.start();
};
