// ================= نظام اللغة المشترك (لجميع الصفحات) =================

let currentLang = localStorage.getItem('lang') || 'ar';

function getLangText(arabic, english) {
    return currentLang === 'ar' ? arabic : english;
}

function updateUITexts() {
    // تحديث النصوص حسب اللغة للعناصر التي تحتوي على data-ar و data-en
    const elements = document.querySelectorAll('[data-ar][data-en]');
    elements.forEach(el => {
        el.textContent = getLangText(el.dataset.ar, el.dataset.en);
    });

    // تحديث placeholders
    const placeholderElements = document.querySelectorAll('[data-ar-placeholder][data-en-placeholder]');
    placeholderElements.forEach(el => {
        el.placeholder = getLangText(el.dataset.arPlaceholder, el.dataset.enPlaceholder);
    });

    // تحديث value للـ input/button elements
    const valueElements = document.querySelectorAll('[data-ar-value][data-en-value]');
    valueElements.forEach(el => {
        el.value = getLangText(el.dataset.arValue, el.dataset.enValue);
    });
}

function applyLanguage() {
    currentLang = localStorage.getItem('lang') || 'ar';

    // تحديث اتجاه الصفحة
    if (currentLang === 'ar') {
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.setAttribute('lang', 'ar');
    } else {
        document.documentElement.setAttribute('dir', 'ltr');
        document.documentElement.setAttribute('lang', 'en');
    }

    // تحديث جميع النصوص
    updateUITexts();
}

// ================= دالة فتح وإغلاق القائمة الجانبية =================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

// ================= نظام الوضع الليلي المشترك =================

function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }

    // تحديث أيقونة ونص الوضع الليلي إذا وجدت
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    if (themeIcon) {
        themeIcon.innerText = savedTheme === 'dark' ? '☀️' : '🌙';
    }
    if (themeText) {
        themeText.innerText = getLangText(
            savedTheme === 'dark' ? 'الوضع النهار' : 'الوضع الليلي',
            savedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'
        );
    }
}

function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark-mode');

    const isDarkMode = body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');

    // معالجة خاصة لصفحة رمضان
    if (window.location.pathname.includes('ramadan.html')) {
        if (isDarkMode) {
            body.classList.remove('light-mode-ramadan');
        } else {
            body.classList.add('light-mode-ramadan');
        }
    }

    // تحديث أيقونة الوضع الليلي إذا وجدت
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    if (themeIcon) {
        themeIcon.innerText = isDarkMode ? '☀️' : '🌙';
    }
    if (themeText) {
        themeText.innerText = getLangText(
            isDarkMode ? 'الوضع النهار' : 'الوضع الليلي',
            isDarkMode ? 'Light Mode' : 'Dark Mode'
        );
    }
}

document.addEventListener('DOMContentLoaded', () => {
    applyLanguage();
    applySavedTheme();
});

window.addEventListener('storage', (e) => {
    if (e.key === 'lang' || e.key === 'lang-changed') {
        applyLanguage();
    }
    if (e.key === 'theme') {
        applySavedTheme();
    }
});

