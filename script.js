document.addEventListener('DOMContentLoaded', () => {
    // 1. الدالة الرئيسية لتهيئة السلة وتحديث العداد
    function initializeCart() {
        // قراءة السلة من التخزين المحلي. إذا لم توجد، ابدأ بمصفوفة فارغة.
        let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        updateCartCount(cart);
        
        // إعداد المستمعين لجميع أزرار الإضافة إلى السلة
        setupAddToCartListeners();

        // إعداد وظيفة "العودة للأعلى"
        setupBackToTopButton();
    }

    // 2. تحديث عدد المنتجات في أيقونة السلة
    function updateCartCount(cart) {
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            // حساب العدد الإجمالي للمنتجات (الكميات)
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.textContent = totalItems;
        }
    }

    // 3. إعداد وظيفة الأزرار
    function setupAddToCartListeners() {
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                // الوصول إلى بطاقة المنتج الأم
                const productCard = event.target.closest('.product-card');
                
                // التأكد من وجود البطاقة
                if (!productCard) return; 

                // استخراج البيانات من HTML
                const productId = productCard.getAttribute('data-product-id');
                const price = parseFloat(productCard.getAttribute('data-price'));
                
                // استخراج الكمية المدخلة
                const quantityInput = productCard.querySelector(`input[id="qty-${productId}"]`);
                const quantity = parseInt(quantityInput.value) || 1; 

                // استخراج اسم المنتج (نعتمد على وسم h3)
                const name = productCard.querySelector('h3').textContent.trim();
                
                // استخراج مسار الصورة (نعتمد على وسم img)
                const imageSrc = productCard.querySelector('img').getAttribute('src');

                // إضافة المنتج إلى السلة
                addItemToCart({
                    id: productId,
                    name: name,
                    price: price,
                    quantity: quantity,
                    image: imageSrc
                });
                
                // تنبيه المستخدم (يمكن استبداله بتنبيه أجمل لاحقاً)
                alert(`تم إضافة ${quantity} من ${name} إلى السلة!`);
            });
        });
    }

    // 4. منطق إضافة المنتج وتخزينه
    function addItemToCart(product) {
        let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        let itemExists = false;

        // التحقق مما إذا كان المنتج موجوداً بالفعل في السلة
        cart = cart.map(item => {
            if (item.id === product.id) {
                // إذا كان موجوداً، قم بزيادة الكمية
                item.quantity += product.quantity;
                itemExists = true;
            }
            return item;
        });

        // إذا لم يكن موجوداً، قم بإضافته كمنتج جديد
        if (!itemExists) {
            cart.push(product);
        }

        // حفظ السلة المحدثة في التخزين المحلي
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
        
        // تحديث العداد
        updateCartCount(cart);
    }
    
    // 5. وظيفة زر العودة للأعلى (كانت موجودة مسبقاً)
    function setupBackToTopButton() {
        const backToTopButton = document.getElementById("backToTop");
        if (backToTopButton) {
            window.onscroll = function() {
                if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
                    backToTopButton.style.display = "block";
                } else {
                    backToTopButton.style.display = "none";
                }
            };
        }
    }

    // تشغيل وظيفة تهيئة السلة عند تحميل الصفحة
    initializeCart();
});
