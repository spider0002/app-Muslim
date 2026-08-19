


// ================= 1. فتح وإغلاق القائمة الجانبية =================
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    if (sidebar && overlay) {
        sidebar.classList.toggle("active");
        overlay.classList.toggle("active");
    }
}

// ================= 2. الأذكار المتغيرة كل 24 ساعة =================
const azkarList = [
    "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
    "لا حَوْلَ وَلا قُوَّةَ إِلاَّ بِاللَّهِ الْعَلِيِّ الْعَلِيمِ",
    "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لا إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ",
    "اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
    "لا إِلَهَ إِلاَّ أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    "الْحَمْدُ لِلَّهِ حَمْدًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ",
    "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ"
];

function updateDailyThikr() {
    const thikrElement = document.getElementById("daily-thikr");
    if (!thikrElement) return;

    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    const thikrIndex = dayOfYear % azkarList.length;
    thikrElement.innerHTML = `<p>${azkarList[thikrIndex]}</p>`;
}

// ================= 3. مواقيت الصلاة الحقيقية والعد التنازلي =================
let nextPrayerTimeObj = null;

async function fetchPrayerTimes() {
    try {
        // أولاً استخدم نفس مواقيت اليوم التي جلبتها صفحة الصلاة، إن وُجدت.
        try {
            const shared = JSON.parse(localStorage.getItem('prayerTimesShared') || 'null');
            if (shared && shared.timings && shared.date === new Date().toDateString()) {
                processPrayerTimes(shared.timings);
                return;
            }
        } catch (e) {}

        // إن لم توجد بيانات مشتركة، استخدم الموقع المحفوظ بدلاً من إجبار القاهرة.
        let url = 'https://api.aladhan.com/v1/timingsByCity?city=Cairo&country=Egypt&method=5';
        try {
            const loc = JSON.parse(localStorage.getItem('userLocation') || 'null');
            if (loc && Number.isFinite(Number(loc.lat)) && Number.isFinite(Number(loc.lon))) {
                url = `https://api.aladhan.com/v1/timings?latitude=${loc.lat}&longitude=${loc.lon}&method=5`;
            }
        } catch (e) {}

        const response = await fetch(url);
        const data = await response.json();
        
        if (data.code === 200) {
            processPrayerTimes(data.data.timings);
            try {
                localStorage.setItem('prayerTimesShared', JSON.stringify({
                    timings: data.data.timings,
                    date: new Date().toDateString(),
                    savedAt: Date.now()
                }));
            } catch (e) {}
        }
    } catch (error) {
        console.error("خطأ في جلب مواقيت الصلاة:", error);
        document.getElementById("next-prayer-name").textContent = "المغرب";
        document.getElementById("next-prayer-time").textContent = "07:42 م";
    }
}

function processPrayerTimes(timings) {
    const prayerNames = {
        Fajr: "الفجر",
        Dhuhr: "الظهر",
        Asr: "العصر",
        Maghrib: "المغرب",
        Isha: "العشاء"
    };

    const now = new Date();
    let upcomingPrayer = null;
    let upcomingTime = null;

    for (const [key, name] of Object.entries(prayerNames)) {
        const [hours, minutes] = timings[key].split(':').map(Number);
        
        const prayerDate = new Date();
        prayerDate.setHours(hours, minutes, 0, 0);

        if (prayerDate > now) {
            upcomingPrayer = name;
            upcomingTime = prayerDate;
            break;
        }
    }

    if (!upcomingPrayer) {
        upcomingPrayer = prayerNames.Fajr;
        const [hours, minutes] = timings.Fajr.split(':').map(Number);
        upcomingTime = new Date();
        upcomingTime.setDate(upcomingTime.getDate() + 1);
        upcomingTime.setHours(hours, minutes, 0, 0);
    }

    nextPrayerTimeObj = upcomingTime;

    document.getElementById("next-prayer-name").textContent = upcomingPrayer;
    
    let hours = upcomingTime.getHours();
    const mins = upcomingTime.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12 || 12;
    
    document.getElementById("next-prayer-time").textContent = `${hours.toString().padStart(2, '0')}:${mins} ${ampm}`;
}

function updateCountdown() {
    if (!nextPrayerTimeObj) return;

    const now = new Date();
    const diff = nextPrayerTimeObj - now;

    if (diff <= 0) {
        fetchPrayerTimes();
        return;
    }

    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    document.getElementById("hours").textContent = hours.toString().padStart(2, '0');
    document.getElementById("minutes").textContent = minutes.toString().padStart(2, '0');
    document.getElementById("seconds").textContent = seconds.toString().padStart(2, '0');
}

window.addEventListener("load", function () {
    const intro = document.getElementById("newIntro");

    if (!intro) return;

    // لو الـIntro ظهر قبل كده في نفس الجلسة، احذفه فورًا
    if (sessionStorage.getItem("introShown") === "true") {
        intro.remove();
        return;
    }

    // سجّل إن الـIntro ظهر
    sessionStorage.setItem("introShown", "true");

    // اخفاء الـIntro بعد ثانيتين
    setTimeout(function () {
        intro.classList.add("hide");

        setTimeout(function () {
            intro.remove();
        }, 500);
    }, 2000);
});

    
    if (typeof applyLanguage === 'function') {
        applyLanguage();
    } else if (typeof updateUITexts === 'function') {
        updateUITexts();
    }
    
    updateDailyThikr();
    fetchPrayerTimes();
    setInterval(updateCountdown, 1000);
    ;

// ================= قراءة وتطبيق الوضع الليلي في الصفحة الرئيسية =================
(function applyTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-theme");
    } else {
        document.body.classList.remove("dark-theme");
    }
})();

document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");

    if (sidebar) sidebar.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
});

