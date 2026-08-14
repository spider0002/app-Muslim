// ================= بيانات وتواريخ رمضان =================
const ramadanDates = [
    { year: 2025, month: 3, day: 1, hijri: '1446' },
    { year: 2026, month: 2, day: 18, hijri: '1447' },
    { year: 2027, month: 2, day: 8, hijri: '1448' },
    { year: 2028, month: 1, day: 28, hijri: '1449' },
    { year: 2029, month: 1, day: 16, hijri: '1450' },
];

const AR_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const AR_MONTHS = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

// دالة مساعدة للحصول على موعد رمضان القادم
function getNextRamadanDate() {
    const now = new Date();
    const nextDate = ramadanDates.find(rd => new Date(rd.year, rd.month - 1, rd.day) > now);
    
    if (nextDate) {
        return new Date(nextDate.year, nextDate.month - 1, nextDate.day);
    }

    // تقدير تقريبي في حال انتهاء القائمة
    const lastKnown = new Date(2029, 0, 16);
    const yearsDiff = Math.ceil((now - lastKnown) / (365.25 * 24 * 60 * 60 * 1000));
    return new Date(lastKnown.getTime() + (yearsDiff * 354 * 24 * 60 * 60 * 1000));
}

function formatArabicDate(d) {
    return `${d.getDate()} ${AR_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// ================= تفاصيل رمضان =================
function updateRamadanDetails() {
    const next = getNextRamadanDate();
    const totalDays = 30;
    const end = new Date(next);
    end.setDate(next.getDate() + totalDays - 1);

    const updateText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.innerText = text;
    };

    updateText('mStartDay', AR_DAYS[next.getDay()]);
    updateText('mStartDate', formatArabicDate(next));
    updateText('mEndDay', AR_DAYS[end.getDay()]);
    updateText('mEndDate', formatArabicDate(end));
    updateText('mDays', totalDays);
}

// ================= العداد التنازلي =================
function updateCountdown() {
    const ramadanDate = getNextRamadanDate();
    const now = new Date();
    const diff = ramadanDate - now;

    const pad = (n) => String(n).padStart(2, '0');

    if (diff <= 0) {
        ['days', 'hours', 'minutes', 'seconds'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerText = '00';
        });
        const subtitle = document.querySelector('.ramadan-subtitle');
        if (subtitle) subtitle.innerText = '🌟 رمضان مبارك! 🌟';
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const setElementText = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = pad(val);
    };

    setElementText('days', days);
    setElementText('hours', hours);
    setElementText('minutes', minutes);
    setElementText('seconds', seconds);
}

// ================= القائمة الجانبية =================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    
    if (sidebar) sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
}

// ================= التهيئة =================
document.addEventListener('DOMContentLoaded', () => {
    updateCountdown();
    updateRamadanDetails();
    setInterval(updateCountdown, 1000);
});

document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");

    if (sidebar) sidebar.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
});