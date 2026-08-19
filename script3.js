// ================= 1. تعريف الصوت وإتاحة التفاعل =================
// ملاحظة: الاسم adhanSound مُعرَّف في settings.js لصفحة الإعدادات،
// لذا نستخدم اسماً فريداً هنا لصفحة الصلاة لتجنب تعارض في النطاق العام
const adhanSoundLocal = new Audio('./audio.mp3');

// فك حظر التشغيل التلقائي للصوت فور أول ضغطة للمستخدم
document.addEventListener('click', () => {
    if (typeof adhanSoundLocal !== 'undefined') {
        adhanSoundLocal.play().then(() => {
            adhanSoundLocal.pause();
            adhanSoundLocal.currentTime = 0;
        }).catch(() => {});
    }
}, { once: true });

// ================= 2. فتح وإغلاق القائمة الجانبية =================
function toggleSidebar(forceState) {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    if (!sidebar || !overlay) return;
    
    const isForce = typeof forceState === 'boolean';
    sidebar.classList.toggle('active', isForce ? forceState : undefined);
    overlay.classList.toggle('active', isForce ? forceState : undefined);
}

// ================= 3. الشاشة الترحيبية =================
document.addEventListener('DOMContentLoaded', () => {
    const intro = document.getElementById('introScreen');
    if (intro) {
        if (sessionStorage.getItem('introPlayed')) {
            intro.classList.add('intro-hidden');
            intro.style.display = 'none';
        } else {
            sessionStorage.setItem('introPlayed', 'true');
            setTimeout(() => {
                intro.classList.add('intro-hidden');
                intro.style.display = 'none';
            }, 3200);
        }
    }

    // مواقيت الصلاة والإشعارات تُدار من script2.js + quran-api.js.
});

// ================= 4. نظام الإشعارات =================
// ================= نظام الإشعارات =================
function rpZEAWYtiB6bJ16NuLbGCc6CZ6jJdKfb63() {
    if (!("Notification" in window)) {
        alert("متصفحك لا يدعم نظام الإشعارات.");
        return;
    }

    Notification.requestPermission().then((permission) => {
        updateNotificationButtonUI(permission);
        if (permission === "granted") {
            sendNotification("تم تفعيل الإشعارات!", "سنقوم بتنبيهك عند حلول وقت كل صلاة.");
        } else if (permission === "denied") {
            alert("لقد قمت برفض الإشعارات، يمكنك تفعيلها من إعدادات المتصفح.");
        }
    });
}

// دالة لتحديث شكل الزر تلقائياً
function updateNotificationButtonUI(permission) {
    const btn = document.getElementById('notificationBtn');
    if (!btn) return;

    if (permission === "granted") {
        btn.innerText = "🔔 الإشعارات مفعلة";
        btn.style.backgroundColor = "#2e8b57";
    } else if (permission === "denied") {
        btn.innerText = "🔕 الإشعارات محظورة";
        btn.style.backgroundColor = "#a83232";
    } else {
        btn.innerText = "🔔 تفعيل إشعارات الصلاة";
        btn.style.backgroundColor = "";
    }
}

// فحص حالة الإذن فور تحميل الصفحة لتحديث شكل الزر
document.addEventListener('DOMContentLoaded', () => {
    if ("Notification" in window) {
        updateNotificationButtonUI(Notification.permission);
    }
});

function sendNotification(title, body) {
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, {
            body: body,
            icon: "https://cdn-icons-png.flaticon.com/512/2913/2913520.png"
        });
    }
}

// ================= 5. جلب المواقيت وحفظها =================
function fetchPrayerTimes() {
    // يمكنك تعديل المدينة والدولة حسب المطلوب
    fetch('https://api.aladhan.com/v1/timingsByCity?city=Cairo&country=Egypt&method=5')
        .then(res => res.json())
        .then(data => {
            if (data && data.data && data.data.timings) {
                const timings = data.data.timings;
                
                // حفظ البيانات في localStorage لكي يجدها كود الفحص
                localStorage.setItem('prayerTimes', JSON.stringify(timings));
                
                // تشغيل دالة التنبيهات
                startPrayerChecker();
            }
        })
        .catch(err => console.error("خطأ في جلب مواقيت الصلاة:", err));
}

// ================= 6. فحص الوقت وتشغيل الأذان والصوت =================
let lastNotifiedPrayer = null;

function startPrayerChecker() {
    // معطّل عمداً لمنع وجود مؤقت إشعارات ثانٍ.
    // quran-api.js هو مدير الإشعارات الوحيد الآن.
}
document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");

    if (sidebar) sidebar.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
});

// ================= جلب مواقيت الصلاة والموقع =================

// دالة جلب الإحداثيات عند ضغط الزر
function getUserLocation() {
    const locText = document.getElementById('locationText');
    const locBtn = document.getElementById('getLocBtn');

    if (!navigator.geolocation) {
        if (locText) locText.textContent = "خدمة الموقع غير مدعومة في متصفحك";
        return;
    }

    if (locText) locText.textContent = "جاري تحديد الموقع...";
    if (locBtn) locBtn.disabled = true;

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // حفظ الإحداثيات للاستخدام المستقبلي
            localStorage.setItem('userLat', lat);
            localStorage.setItem('userLng', lng);

            fetchPrayerTimesByCoords(lat, lng);
            if (locBtn) locBtn.disabled = false;
        },
        (error) => {
            if (locBtn) locBtn.disabled = false;
            if (locText) {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        locText.textContent = "تم رفض إذن الوصول للموقع.";
                        break;
                    default:
                        locText.textContent = "تعذر تحديد الموقع الجغرافي.";
                        break;
                }
            }
        }
    );
}

// دالة جلب المواقيت من Aladhan API بالإحداثيات
async function fetchPrayerTimesByCoords(lat, lng) {
    const locText = document.getElementById('locationText');
    try {
        const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=5`);
        const data = await response.json();

        if (data && data.code === 200) {
            const timings = data.data.timings;
            const meta = data.data.meta;

            // تحديث العرض في الصفحة
            document.getElementById('fajr').textContent = formatTime(timings.Fajr);
            document.getElementById('sunrise').textContent = formatTime(timings.Sunrise);
            document.getElementById('dhuhr').textContent = formatTime(timings.Dhuhr);
            document.getElementById('asr').textContent = formatTime(timings.Asr);
            document.getElementById('maghrib').textContent = formatTime(timings.Maghrib);
            document.getElementById('isha').textContent = formatTime(timings.Isha);

            if (locText) {
                locText.textContent = `📍 المنطقة الزمنية: ${meta.timezone}`;
            }
        }
    } catch (err) {
        if (locText) locText.textContent = "حدث خطأ أثناء جلب مواقيت الصلاة.";
    }
}

// دالة تحويل الوقت لنظام 12 ساعة
function formatTime(time24) {
    const [hours, minutes] = time24.split(':');
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'م' : 'ص';
    h = h % 12 || 12;
    return `${h}:${minutes} ${ampm}`;
}

// تشغيل جلب المواقيت تلقائياً إذا كان الموقع مخزناً سابقاً
document.addEventListener('DOMContentLoaded', () => {
    const savedLat = localStorage.getItem('userLat');
    const savedLng = localStorage.getItem('userLng');

    if (savedLat && savedLng) {
        fetchPrayerTimesByCoords(savedLat, savedLng);
    }
});