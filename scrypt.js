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
    const selectedZikr = document.getElementById('tasbeehSelect').value;
    // تحميل عدد الذكر المحدد من الـ LocalStorage إذا كان محفوظاً
    count = parseInt(localStorage.getItem('tasbeeh_' + selectedZikr)) || 0;
    updateDisplay();
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

// دالة فتح وإغلاق القائمة الجانبية
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}
