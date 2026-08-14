let countdownInterval;

// حفظ موقع المستخدم ليستخدمه النظام العالمي في كل الصفحات
function saveUserLocation(latitude, longitude) {
    try {
        localStorage.setItem('userLocation', JSON.stringify({ lat: latitude, lon: longitude }));
    } catch (e) {}
}

// دالة تحويل الوقت بنظام 12 ساعة
function formatTime(time24) {
    if (!time24) return '--:--';
    const cleanTime = time24.split(' ')[0];
    let [hours, minutes] = cleanTime.split(':');
    hours = parseInt(hours, 10);
    if (isNaN(hours)) return time24;
    
    const period = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${period}`;
}

// دالة لجلب مواقيت الصلاة وبدء العداد
async function getPrayerTimes(latitude, longitude) {
    const locationText = document.getElementById('locationText');
    saveUserLocation(latitude, longitude);
    
    try {
        const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=5`);
        const result = await response.json();
        
        if (result.code === 200) {
            const timings = result.data.timings;
            // مصدر مشترك لمواقيت اليوم حتى تستخدمها الصفحة الرئيسية والإشعارات بنفس القيم.
            try {
                localStorage.setItem('prayerTimesShared', JSON.stringify({
                    timings,
                    date: new Date().toDateString(),
                    savedAt: Date.now()
                }));
            } catch (e) {}
            const dateInfo = result.data.date.hijri;

            if (locationText) {
                locationText.innerText = `التاريخ الهجري: ${dateInfo.day} ${dateInfo.month.ar} ${dateInfo.year} هـ`;
            }

            // عرض الأوقات في الكروت
            const setElemText = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.innerText = formatTime(val);
            };

            setElemText('fajr', timings.Fajr);
            setElemText('sunrise', timings.Sunrise);
            setElemText('dhuhr', timings.Dhuhr);
            setElemText('asr', timings.Asr);
            setElemText('maghrib', timings.Maghrib);
            setElemText('isha', timings.Isha);

            // بدء حساب الصلاة القادمة والعداد التنازلي
            startNextPrayerCountdown(timings);
            
            // استدعاء دالة الإشعارات بحماية في حال كانت معرفة في ملف آخر
            if (typeof checkPrayerTimeNotifications === 'function') {
                checkPrayerTimeNotifications(result.data.timings);
            }
        }
    } catch (error) {
        console.error('خطأ في جلب مواقيت الصلاة:', error);
        if (locationText) {
            locationText.innerText = 'عذراً، تعذر جلب مواقيت الصلاة حالياً.';
        }
    }
}

// دالة تحديد الصلاة القادمة والعد التنازلي
function startNextPrayerCountdown(timings) {
    if (countdownInterval) clearInterval(countdownInterval);

    const prayerOrder = [
        { name: 'الفجر', time: timings.Fajr },
        { name: 'الظهر', time: timings.Dhuhr },
        { name: 'العصر', time: timings.Asr },
        { name: 'المغرب', time: timings.Maghrib },
        { name: 'العشاء', time: timings.Isha }
    ];

    const updateTimer = () => {
        const now = new Date();
        let nextPrayer = null;
        let nextPrayerTime = null;

        // البحث عن الصلاة القادمة خلال اليوم
        for (let prayer of prayerOrder) {
            const cleanTime = prayer.time.split(' ')[0];
            const [hours, minutes] = cleanTime.split(':');
            const pTime = new Date();
            pTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

            if (pTime > now) {
                nextPrayer = prayer.name;
                nextPrayerTime = pTime;
                break;
            }
        }

        // لو كل صلوات النهاردة خلصت، يبقى الصلاة الجاية هي فجر بكرة
        if (!nextPrayer) {
            nextPrayer = 'الفجر';
            const cleanTime = timings.Fajr.split(' ')[0];
            const [hours, minutes] = cleanTime.split(':');
            nextPrayerTime = new Date();
            nextPrayerTime.setDate(nextPrayerTime.getDate() + 1);
            nextPrayerTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        }

        const diff = nextPrayerTime - now;

        const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
        const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secondsLeft = Math.floor((diff % (1000 * 60)) / 1000);

        const pad = (n) => String(n).padStart(2, '0');

        const nameElem = document.getElementById('nextPrayerName');
        const timerElem = document.getElementById('countdownTimer');

        if (nameElem) nameElem.innerText = nextPrayer;
        if (timerElem) timerElem.innerText = `${pad(hoursLeft)}:${pad(minutesLeft)}:${pad(secondsLeft)}`;
    };

    updateTimer();
    countdownInterval = setInterval(updateTimer, 1000);
}

// الحصول على الموقع والتشغيل
function initPrayerTimes() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                getPrayerTimes(position.coords.latitude, position.coords.longitude);
            },
            () => {
                const locationText = document.getElementById('locationText');
                if (locationText) locationText.innerText = 'الموقع الافتراضي: القاهرة';
                getPrayerTimes(30.0444, 31.2357);
            }
        );
    } else {
        getPrayerTimes(30.0444, 31.2357);
    }
}

document.addEventListener('DOMContentLoaded', initPrayerTimes);

// دالة فتح وإغلاق القائمة الجانبية
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    
    if (sidebar) sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
}