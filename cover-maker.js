document.addEventListener('DOMContentLoaded', () => {
    // 1. تحديد العناصر الرئيسية في الصفحة
    const designCanvas = document.getElementById('designCanvas');
    const designText = document.getElementById('designText');
    const designIcon = document.getElementById('designIcon'); // الأيقونة الجديدة
    const canvasContainer = document.getElementById('canvasContainer');
    const downloadBtn = document.getElementById('downloadBtn');

    // 2. تحديد عناصر التحكم (Inputs)
    const sizeSelector = document.getElementById('sizeSelector');
    const coverText = document.getElementById('coverText');
    const backgroundColor = document.getElementById('backgroundColor');
    const textColor = document.getElementById('textColor');
    const textSize = document.getElementById('textSize');
    const fontSelector = document.getElementById('fontSelector');
    
    // عناصر التحكم بالصورة
    const imageUpload = document.getElementById('imageUpload');
    const removeImageBtn = document.getElementById('removeImageBtn');
    
    // عناصر التحكم بالأيقونة الجديدة
    const iconSelector = document.getElementById('iconSelector');
    const iconColor = document.getElementById('iconColor');
    const iconSize = document.getElementById('iconSize');
    
    // دالة لتحديث المعاينة بناءً على المدخلات
    function updateCanvas() {
        // تحديث النص والخط
        designText.textContent = coverText.value;
        designText.style.color = textColor.value;
        designText.style.fontSize = `${textSize.value}px`;
        designText.style.fontFamily = fontSelector.value;
        
        // تحديث لون الخلفية (إذا لم تكن هناك صورة خلفية)
        if (!designCanvas.style.backgroundImage || designCanvas.style.backgroundImage === 'none') {
            designCanvas.style.backgroundColor = backgroundColor.value;
        }
        
        // تحديث الأبعاد
        const selectedSize = sizeSelector.value.split('x');
        const width = selectedSize[0] + 'px';
        const height = selectedSize[1] + 'px';

        designCanvas.style.width = width;
        designCanvas.style.height = height;
        canvasContainer.style.maxWidth = width;
        
        // **********************************************
        // منطق التحكم بالأيقونة الجديدة
        // **********************************************
        const selectedIconClass = iconSelector.value;
        
        if (selectedIconClass === 'none') {
            designIcon.style.display = 'none';
        } else {
            // *تعديل: التأكد من مسح جميع الكلاسات السابقة قبل إضافة الجديد*
            designIcon.className = ''; // مسح جميع الكلاسات
            designIcon.classList.add(...selectedIconClass.split(' ')); // إضافة الكلاسات الجديدة
            designIcon.style.display = 'block';
            
            // تحديث اللون والحجم
            designIcon.style.color = iconColor.value;
            designIcon.style.fontSize = `${iconSize.value}px`;
        }
    }

    // **********************************************
    // ربط الأحداث (Events)
    // **********************************************
    coverText.addEventListener('input', updateCanvas);
    backgroundColor.addEventListener('input', updateCanvas);
    textColor.addEventListener('input', updateCanvas);
    textSize.addEventListener('input', updateCanvas);
    sizeSelector.addEventListener('change', updateCanvas);
    fontSelector.addEventListener('change', updateCanvas); 

    // ربط أحداث الأيقونة الجديدة
    iconSelector.addEventListener('change', updateCanvas);
    iconColor.addEventListener('input', updateCanvas);
    iconSize.addEventListener('input', updateCanvas);

    // منطق التحكم بالصورة
    imageUpload.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(event) {
                designCanvas.style.backgroundImage = `url(${event.target.result})`;
                // *تعديل: استخدام 'contain' لضمان ظهور الصورة كاملة*
                designCanvas.style.backgroundSize = 'contain'; 
                designCanvas.style.backgroundRepeat = 'no-repeat'; // لمنع تكرار الصورة
                designCanvas.style.backgroundPosition = 'center';
                removeImageBtn.style.display = 'block';
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    removeImageBtn.addEventListener('click', function() {
        designCanvas.style.backgroundImage = 'none';
        designCanvas.style.backgroundColor = backgroundColor.value; 
        imageUpload.value = ''; 
        removeImageBtn.style.display = 'none';
        updateCanvas(); 
    });
    
    // دالة التنزيل (بدون تغيير)
    downloadBtn.addEventListener('click', () => {
        downloadBtn.disabled = true;
        downloadBtn.textContent = 'جاري المعالجة...';

        html2canvas(designCanvas, { 
            scale: 2, 
            logging: false,
            // *تعديل: تجاهل التمرير لضمان التقاط كامل المحتوى إذا كان هناك تمرير*
            windowWidth: designCanvas.scrollWidth,
            windowHeight: designCanvas.scrollHeight,
            x: designCanvas.scrollLeft,
            y: designCanvas.scrollTop 
        }).then(canvas => {
            const imageURL = canvas.toDataURL("image/png");
            
            const link = document.createElement('a');
            link.href = imageURL;
            link.download = 'Cover_Design_' + Date.now() + '.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            downloadBtn.disabled = false;
            downloadBtn.innerHTML = '<i class="fas fa-download me-2"></i> تنزيل الغلاف (PNG)';
        });
    });

    // تشغيل التحديث الأولي عند تحميل الصفحة
    updateCanvas();
});
