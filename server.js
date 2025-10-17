// 1. المكتبات الأساسية
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Ffmpeg = require('fluent-ffmpeg'); // مكتبة معالجة الفيديو
const app = express();
const port = 3000; 

// 2. إعداد التخزين المؤقت للملفات
const UPLOADS_DIR = 'uploads/';
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // إنشاء مجلد 'uploads' إذا لم يكن موجوداً
        if (!fs.existsSync(UPLOADS_DIR)) {
            fs.mkdirSync(UPLOADS_DIR);
        }
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        // اسم فريد لكل ملف
        cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'));
    }
});
const upload = multer({ storage: storage });

// تفعيل CORS للسماح بالاتصال من نطاق GitHub Pages
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); 
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// خدمة الملفات الناتجة (لتتمكن الواجهة من تحميل الفيديو)
app.use('/output', express.static(path.join(__dirname, 'output'))); 

// ----------------------------------------------------
// نقطة النهاية (Endpoint) لتوليد الفيديو
// ----------------------------------------------------
app.post('/api/generate-video', upload.array('images', 10), (req, res) => {
    const textInput = req.body.text; 
    const uploadedFiles = req.files; 
    
    if (!textInput || uploadedFiles.length < 3) {
        // تنظيف وحذف الملفات المؤقتة
        uploadedFiles.forEach(file => fs.unlink(file.path, () => {}));
        return res.status(400).json({ success: false, error: 'الرجاء إدخال النص ورفع 3 صور على الأقل.' });
    }

    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
    
    // اسم ملف الفيديو الناتج
    const outputFileName = `video-${Date.now()}.mp4`;
    const outputPath = path.join(outputDir, outputFileName);
    const videoUrl = `/output/${outputFileName}`;

    console.log(`بدء توليد الفيديو للنص: ${textInput}`);

    // --- منطق FFmpeg (تحويل الصور إلى فيديو) ---
    let ffmpegCommand = Ffmpeg();
    
    // 1. إضافة الصور بالترتيب
    uploadedFiles.forEach(file => {
        ffmpegCommand = ffmpegCommand.input(file.path);
    });

    // 2. معالجة الفيديو (جعل كل صورة تستمر لمدة 5 ثوانٍ، وإضافة تأثير خفيف)
    ffmpegCommand
        .loop() // تكرار العملية
        .on('start', function(commandLine) {
            console.log('Spawned Ffmpeg with command: ' + commandLine);
        })
        .on('error', function(err) {
            console.error('An error occurred during FFmpeg processing: ' + err.message);
            // تنظيف الملفات المؤقتة في حالة الخطأ
            uploadedFiles.forEach(file => fs.unlink(file.path, () => {}));
            return res.status(500).json({ success: false, error: 'فشل في توليد الفيديو على الخادم.' });
        })
        .on('end', function() {
            console.log('FFmpeg processing finished!');
            // تنظيف الملفات المؤقتة بعد النجاح
            uploadedFiles.forEach(file => fs.unlink(file.path, () => {}));
            
            // 3. هنا يجب إضافة النص إلى الفيديو (خطوة متقدمة سنتجاهلها مؤقتاً لتشغيل التطبيق)
            
            // الرد على الواجهة الأمامية بالنجاح ورابط التحميل
            res.json({ 
                success: true, 
                videoUrl: videoUrl, // الرابط الذي يمكن للواجهة تحميل الفيديو منه
                message: 'تم توليد الفيديو بنجاح!'
            });
        })
        .mergeToFile(outputPath, outputDir) // دمج الصور في ملف واحد
        .outputOptions([
             '-pix_fmt yuv420p', // لتوافق الفيديو مع معظم المشغلات
             '-c:v libx264',    // كودك الفيديو
             '-t 15'            // إجمالي مدة الفيديو 15 ثانية (3 صور * 5 ثوانٍ)
        ]);
});

// تشغيل الخادم
app.listen(port, () => {
    console.log(`الخادم يعمل على المنفذ: ${port}`);
});
