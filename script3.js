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