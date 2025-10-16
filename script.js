document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // وظائف أساسية مشتركة (تهيئة، تحديث العداد، العودة للأعلى)
    // ----------------------------------------------------

    // 1. الدالة الرئيسية لتهيئة السلة وتحديد وظائف الصفحة الحالية
    function initializeCart() {
        // قراءة السلة من التخزين المحلي وتحديث العداد في كل الصفحات
        let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        updateCartCount(cart);

        // إعداد المستمعين لأزرار الإضافة (يعمل في index.html)
        setupAddToCartListeners();

        // إذا كنا في صفحة cart.html، قم بعرض محتويات السلة
        if (document.title.includes('سلة المشتريات')) {
            renderCartItems();
        }

        // إعداد وظيفة "العودة للأعلى"
        setupBackToTopButton();
    }

    // 2. تحديث عدد المنتجات في أيقونة السلة (يعمل في كل الصفحات)
    function updateCartCount(cart) {
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            // حساب العدد الإجمالي للمنتجات (الكميات)
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.textContent = totalItems;
        }
    }
    
    // 3. وظيفة زر العودة للأعلى
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


    // ----------------------------------------------------
    // وظائف صفحة Index.html (إضافة المنتجات)
    // ----------------------------------------------------
    
    // 4. إعداد وظيفة الأزرار في صفحة index.html
    function setupAddToCartListeners() {
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const productCard = event.target.closest('.product-card');
                if (!productCard) return; 

                // استخراج البيانات
                const productId = productCard.getAttribute('data-product-id');
                const price = parseFloat(productCard.getAttribute('data-price'));
                const quantityInput = productCard.querySelector(`input[id="qty-${productId}"]`);
                const quantity = parseInt(quantityInput.value) || 1; 
                const name = productCard.querySelector('h3').textContent.trim();
                const imageSrc = productCard.querySelector('img').getAttribute('src');

                // إضافة المنتج إلى السلة
                addItemToCart({
                    id: productId,
                    name: name,
                    price: price,
                    quantity: quantity,
                    image: imageSrc
                });
                
                // رسالة تأكيد
                alert(`تم إضافة ${quantity} من ${name} إلى السلة!`);
            });
        });
    }

    // 5. منطق إضافة المنتج وتخزينه في localStorage
    function addItemToCart(product) {
        let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        let itemExists = false;

        // التحقق مما إذا كان المنتج موجوداً لزيادة الكمية
        cart = cart.map(item => {
            if (item.id === product.id) {
                item.quantity += product.quantity;
                itemExists = true;
            }
            return item;
        });

        // إذا لم يكن موجوداً، قم بإضافته كمنتج جديد
        if (!itemExists) {
            cart.push(product);
        }

        localStorage.setItem('shoppingCart', JSON.stringify(cart));
        updateCartCount(cart);
    }

    // ----------------------------------------------------
    // وظائف صفحة Cart.html (عرض وتعديل السلة)
    // ----------------------------------------------------

    // 6. عرض محتويات السلة على الشاشة
    function renderCartItems() {
        const cartContainer = document.getElementById('cart-items-container');
        const summaryTotal = document.getElementById('cart-total-amount');
        const emptyMessage = document.getElementById('empty-cart-message');
        const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        let total = 0;
        
        cartContainer.innerHTML = ''; // مسح المحتوى القديم

        if (cart.length === 0) {
            if (emptyMessage) emptyMessage.style.display = 'block';
            if (summaryTotal) summaryTotal.textContent = '0.00$';
            return;
        } else {
            if (emptyMessage) emptyMessage.style.display = 'none';
        }

        // بناء الهيكل لكل منتج
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart-item');
            // هنا نستخدم تنسيقات بسيطة مضمنة لضمان العرض الصحيح
            cartItemDiv.style.cssText = 'display: flex; align-items: center; border-bottom: 1px solid #eee; padding: 15px 0; gap: 15px;';
            
            cartItemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 5px;">
                <div style="flex-grow: 1;">
                    <h4 style="margin: 0; font-size: 16px;">${item.name}</h4>
                    <p style="margin: 5px 0 0; color: #888;">السعر: ${item.price.toFixed(2)}$</p>
                </div>
                
                <div class="item-qty-control" style="text-align: center; width: 100px;">
                    <label>الكمية:</label>
                    <input type="number" 
                           value="${item.quantity}" 
                           min="1" 
                           data-item-id="${item.id}"
                           class="cart-qty-input"
                           style="width: 50px; text-align: center; padding: 5px;">
                </div>
                
                <div style="font-weight: bold; width: 100px; text-align: left;">
                    ${itemTotal.toFixed(2)}$
                </div>
                
                <button class="remove-item-btn" data-item-id="${item.id}" style="background: none; border: none; color: red; font-size: 18px; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            cartContainer.appendChild(cartItemDiv);
        });

        // تحديث المجموع الكلي
        if (summaryTotal) {
            summaryTotal.textContent = `${total.toFixed(2)}$`;
        }

        // إعداد مستمعي الأزرار بعد إنشاء عناصرها
        setupCartControls();
    }

    // 7. دالة تحديث كمية منتج واحد
    function updateItemQuantity(itemId, newQuantity) {
        if (newQuantity < 1) return; // منع الكمية السلبية

        let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        
        cart = cart.map(item => {
            if (item.id === itemId) {
                item.quantity = newQuantity;
            }
            return item;
        });

        localStorage.setItem('shoppingCart', JSON.stringify(cart));
        updateCartCount(cart);
        renderCartItems(); 
    }

    // 8. دالة لحذف منتج
    function removeItemFromCart(itemId) {
        let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        cart = cart.filter(item => item.id !== itemId);
        
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
        updateCartCount(cart);
        renderCartItems(); 
    }

    // 9. إعداد المستمعين لأزرار الحذف وتغيير الكمية في صفحة السلة
    function setupCartControls() {
        // مستمع لزر الحذف
        const removeButtons = document.querySelectorAll('.remove-item-btn');
        removeButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const itemId = event.currentTarget.getAttribute('data-item-id');
                removeItemFromCart(itemId);
            });
        });
        
        // مستمع لتغيير الكمية
        const qtyInputs = document.querySelectorAll('.cart-qty-input');
        qtyInputs.forEach(input => {
            input.addEventListener('change', (event) => {
                const itemId = event.target.getAttribute('data-item-id');
                const newQuantity = parseInt(event.target.value);
                updateItemQuantity(itemId, newQuantity);
            });
        });
    }

    // 10. تشغيل الدالة الرئيسية عند تحميل الصفحة
    initializeCart();
});

// هذا الكود الخارجي يسمح باستدعاء الدالة من HTML مباشرة (لتحديث الكمية)
window.updateItemQuantity = function(inputElement) {
    const itemId = inputElement.getAttribute('data-item-id');
    const newQuantity = parseInt(inputElement.value);
    
    // لضمان استدعاء الدالة الداخلية
    const updateFunc = document.querySelector('script').onload = () => {
        document.querySelector('.cart-qty-input').dispatchEvent(new Event('change'));
    };
    
    // حل بسيط للتأكد من تحديث الكمية في الـ LocalStorage
    if (newQuantity >= 1) {
        let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        cart = cart.map(item => {
            if (item.id === itemId) {
                item.quantity = newQuantity;
            }
            return item;
        });
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
        // إعادة تحميل محتويات السلة للعرض بعد التحديث
        if (document.title.includes('سلة المشتريات')) {
            document.dispatchEvent(new Event('DOMContentLoaded'));
        }
    } else {
         inputElement.value = 1;
    }
}
