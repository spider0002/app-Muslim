// دالة تبديل حالة القائمة (فتح / إغلاق)
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

// إغلاق القائمة عند الضغط في أي مكان خارجها أو عند الضغط على زر الـ X
document.addEventListener('click', function(e) {
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.querySelector('.open-sidebar-btn');
    const closeBtn = document.querySelector('.close-sidebar-btn');

    // إذا كانت القائمة مش موجودة أو غير مفعلة لا تفعل شيئاً
    if (!sidebar || !sidebar.classList.contains('active')) return;

    // 1. الضغط على زر الـ X
    if (closeBtn && closeBtn.contains(e.target)) {
        sidebar.classList.remove('active');
        return;
    }

    // 2. الضغط في مكان خارجي (بعيد عن القائمة وزر الفتح)
    if (!sidebar.contains(e.target) && !openBtn.contains(e.target)) {
        sidebar.classList.remove('active');
    }
});

