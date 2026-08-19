let count = 0;

// زيادة العداد وحفظه
function incrementCounter() {
    count++;
    updateDisplay();
}

// إعادة الضبط للصفر
function resetCounter() {
    if (confirm("هل تريد إعادة ضبط العداد للصفر؟")) {
        count = 0;
        updateDisplay();
    }
}

// التبديل بين الأذكار
function changeZikr() {
    const selectElement = document.getElementById('tasbeehSelect');
    
    // التأكد من وجود عنصر القائمة في الصفحة قبل قراءة قيمته
    if (selectElement) {
        const selectedZikr = selectElement.value;
        // تحميل عدد الذكر المحدد من الـ LocalStorage إذا كان محفوظاً
        count = parseInt(localStorage.getItem('tasbeeh_' + selectedZikr)) || 0;
        updateDisplay();
    } else {
        console.warn("العنصر tasbeehSelect غير موجود في هذه الصفحة.");
    }
}

// تحديث الشاشة والحفظ
function updateDisplay() {
    const display = document.getElementById('counterValue');
    display.innerText = count;

    const selectedZikr = document.getElementById('tasbeehSelect').value;
    localStorage.setItem('tasbeeh_' + selectedZikr, count);
}

// استرجاع العدد فور فتح الصفحة
document.addEventListener('DOMContentLoaded', () => {
    changeZikr();
});
// دالة فتح وإغلاق القائمة
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

// الإغلاق عند الضغط خارج القائمة أو على الـ X
document.addEventListener('click', function(e) {
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.querySelector('.open-sidebar-btn');
    const closeBtn = document.querySelector('.close-sidebar-btn');

    // لو القائمة مش مفتوحة، متعملش حاجة
    if (!sidebar || !sidebar.classList.contains('active')) return;

    // لو داس على زرار الـ X
    if (closeBtn && closeBtn.contains(e.target)) {
        sidebar.classList.remove('active');
        return;
    }

    // لو داس برة القائمة خالص (في أي مكان في الشاشة)
    if (!sidebar.contains(e.target) && openBtn && !openBtn.contains(e.target)) {
        sidebar.classList.remove('active');
    }
});
// تشغيل وتطبيق الثيم المحفوظ عند تحميل أي صفحة
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle'); // أو الـ id بتاع السويتش عندك
    const savedTheme = localStorage.getItem('theme');

    // لو كان مفعل قبل كده، طبقه فوراً
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        if (themeToggle) themeToggle.checked = true;
    } else {
        document.body.classList.remove('dark-theme');
        if (themeToggle) themeToggle.checked = false;
    }

    // عند تغيير حالة مفتاح الوضع الليلي من صفحة الإعدادات
    if (themeToggle) {
        themeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('dark-theme');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.remove('dark-theme');
                localStorage.setItem('theme', 'light');
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // ابحث عن زرار السويتش بجميع الاحتمالات الممكنة للـ ID أو الـ Class
    const themeToggle = document.getElementById('theme-toggle') || 
                        document.querySelector('.theme-switch input') ||
                        document.querySelector('input[type="checkbox"]');
                        
    const savedTheme = localStorage.getItem('theme');

    // 1. تطبيق الثيم المحفوظ أول ما الصفحة تفتح
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        if (themeToggle) themeToggle.checked = true;
    } else {
        document.body.classList.remove('dark-theme');
        if (themeToggle) themeToggle.checked = false;
    }

    // 2. التغيير اللحظي أول ما تدوس على السويتش
    if (themeToggle) {
        themeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('dark-theme');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.remove('dark-theme');
                localStorage.setItem('theme', 'light');
            }
        });
    }
});