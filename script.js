// ==========================================================
// script.js - ملف الأكواد البرمجية الموحد لمتجر عالم الجوالات
// ==========================================================

// 1. وظائف قائمة التنقل (القائمة المنسدلة في وضع الجوال)
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

// وظيفة فتح/إغلاق القائمة عند النقر على أيقونة الهامبرغر
menuToggle.addEventListener('click', () => {
    mainNav.classList.toggle('active');
});

// وظيفة إغلاق القائمة عند النقر على أي رابط داخلها (مهم في وضع الجوال)
const navLinks = document.querySelectorAll('.main-nav ul li a');
navLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        const href = link.getAttribute('href');
        // تفحص ما إذا كان الرابط يؤدي إلى قسم في نفس الصفحة (#) أو رابط خارجي
        if (href === '#store-hero' || href.startsWith('#')) {
            mainNav.classList.remove('active');
        } 
        else {
            // إغلاق القائمة بعد تأخير بسيط للسماح للانتقال بالحدوث
            setTimeout(() => {
               mainNav.classList.remove('active');
            }, 50); 
        }
    });
});


// 2. تحديث السنة الحالية في الفوتر تلقائياً
document.getElementById('current-year').textContent = new Date().getFullYear();


// 3. وظائف زر العودة للأعلى (#backToTop)

let mybutton = document.getElementById("backToTop");

// عرض/إخفاء الزر عند التمرير
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  // يظهر الزر بعد التمرير 20 بكسل
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}

// وظيفة العودة إلى أعلى الصفحة عند النقر على الزر
function topFunction() {
  // للوصول إلى أعلى الصفحة في متصفحات كروم/سفاري/فايرفوكس
  document.body.scrollTop = 0; 
  // للوصول إلى أعلى الصفحة في متصفحات IE/Edge وبعض المتصفحات الأخرى
  document.documentElement.scrollTop = 0; 
}
