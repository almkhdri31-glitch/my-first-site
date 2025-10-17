/* =========================================================
   SCRIPT.JS - الوظائف الرئيسية لمتجر عالم الجوالات (النسخة النهائية الموحدة)
   تم حذف جميع معالجات الإرسال البرمجية لتجاوز خطأ الخادم 500.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. تعريف وظيفة تنسيق العملة
    const formatCurrency = (amount) => {
        const number = parseFloat(amount);
        return `$${isNaN(number) ? '0.00' : number.toFixed(2)}`;
    };

    // 2. إدارة السلة (التحميل والحفظ والحساب)
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const saveCart = () => {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        
        // إعادة عرض محتويات السلة والملخص بعد كل تعديل
        if (document.getElementById('cart-items')) {
            renderCartItems();
        }
        if (document.querySelector('.checkout-container')) { // استخدم محدد مختلف
            updateCheckoutSummary();
            prepareCheckoutForm(); // تحديث حقل الإرسال المخفي
        }
    };

    const calculateCartTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const updateCartCount = () => {
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            const totalItems = cart.reduce((count, item) => count + item.quantity, 0);
            cartCountElement.textContent = totalItems;
        }
    };

    // 3. وظيفة إضافة منتج إلى السلة
    const addToCart = (productId, name, price, quantity) => {
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ id: productId, name, price, quantity });
        }
        
        saveCart();
        alert(`تمت إضافة ${quantity} من ${name} إلى سلة المشتريات بنجاح!`);
    };

    // 4. معالج النقر على زر "أضف إلى السلة" (في index.html)
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            if (!card) return;

            const productId = card.dataset.productId;
            
            const priceText = card.dataset.price;
            const price = priceText ? parseFloat(priceText) : 0;
            
            const productNameElement = card.querySelector('h3');
            const name = productNameElement ? productNameElement.textContent.trim() : 'منتج غير معروف';

            const qtyInput = card.querySelector(`input[type="number"]`); 
            const quantity = qtyInput ? parseInt(qtyInput.value) : 1;
            
            if (productId && price > 0 && quantity > 0) {
                addToCart(productId, name, price, quantity);
            } else {
                alert('عذراً، لا يمكن إضافة هذا المنتج حالياً. يرجى التأكد من توفر السعر والكمية.');
            }
        });
    });
    
    // 5. وظيفة تحديث الكمية في صفحة السلة (cart.html)
    const updateCartItemQuantity = (productId, newQuantity) => {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = parseInt(newQuantity);
            if (item.quantity <= 0) {
                removeFromCart(productId);
            } else {
                saveCart();
            }
        }
    };

    // 6. وظيفة حذف منتج من السلة (cart.html)
    const removeFromCart = (productId) => {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
    };

    // 7. وظيفة عرض محتويات السلة في صفحة cart.html
    const renderCartItems = () => {
        const cartItemsContainer = document.getElementById('cart-items'); 
        const cartTotalElement = document.getElementById('cart-total');   
        if (!cartItemsContainer || !cartTotalElement) return;

        cartItemsContainer.innerHTML = ''; 

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-center" style="font-size: 18px; color: #888;">سلة مشترياتك فارغة حالياً.</p>';
            cartTotalElement.textContent = formatCurrency(0);
            const checkoutLink = document.querySelector('.checkout-link');
            if(checkoutLink) checkoutLink.style.display = 'none';
            return;
        }
        
        const checkoutLink = document.querySelector('.checkout-link');
        if(checkoutLink) checkoutLink.style.display = 'block';

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            
            const imagePath = `img/products/${item.id}.png`; 

            const itemHTML = `
                <div class="cart-item" data-product-id="${item.id}">
                    <div class="item-details">
                        <img src="${imagePath}" alt="${item.name}" onerror="this.onerror=null;this.src='placeholder.png';" style="max-width: 60px;">
                        <h3>${item.name}</h3>
                    </div>
                    
                    <div class="item-price">
                         <span class="price-label">السعر: </span> 
                         <span class="price-value">${formatCurrency(item.price)}</span>
                    </div>

                    <div class="quantity-control">
                        <label for="qty-${item.id}">الكمية:</label>
                        <input type="number" id="qty-${item.id}" class="item-quantity-input" value="${item.quantity}" min="1" data-product-id="${item.id}">
                    </div>

                    <div class="item-total">
                        <span class="total-label">المجموع: </span> 
                        <span class="total-amount">${formatCurrency(itemTotal)}</span>
                    </div>
                    
                    <button class="delete-item-btn" data-product-id="${item.id}" title="حذف المنتج">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            cartItemsContainer.insertAdjacentHTML('beforeend', itemHTML);
        });

        // تحديث المجموع الكلي
        cartTotalElement.textContent = formatCurrency(calculateCartTotal());
        
        // ربط الأحداث بمحدثات الكمية وأزرار الحذف
        document.querySelectorAll('.item-quantity-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const productId = e.target.dataset.productId;
                const newQuantity = parseInt(e.target.value);
                if (newQuantity >= 1) {
                     updateCartItemQuantity(productId, newQuantity);
                } else {
                    e.target.value = 1;
                    updateCartItemQuantity(productId, 1);
                }
            });
        });
        
        document.querySelectorAll('.delete-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.closest('.delete-item-btn').dataset.productId;
                if(confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
                   removeFromCart(productId);
                }
            });
        });
    };
    
    // *** تفعيل زر "إتمام الشراء" في صفحة السلة للنقل إلى checkout.html ***
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length > 0) {
                window.location.href = 'checkout.html';
            } else {
                alert('سلة المشتريات فارغة. لا يمكن إتمام الشراء.');
            }
        });
    }

    /* =======================================
       وظائف صفحة إتمام الشراء (checkout.html)
       ======================================= */
       
    // 8. وظيفة تحديث ملخص الطلب في صفحة checkout.html
    const updateCheckoutSummary = () => {
        const summaryElement = document.getElementById('checkout-summary');
        const totalElement = document.getElementById('checkout-total');
        const checkoutContainer = document.querySelector('.checkout-container');
        
        if (!summaryElement || !totalElement || !checkoutContainer) return;
        
        const checkoutForm = checkoutContainer.querySelector('form');
        
        if (cart.length === 0) {
            summaryElement.innerHTML = '<p style="color: red; font-weight: 700;">سلة المشتريات فارغة! يرجى العودة لصفحة <a href="cart.html">السلة</a>.</p>';
            totalElement.textContent = formatCurrency(0);
            if(checkoutForm) checkoutForm.querySelector('.confirm-order-btn').disabled = true;
            return;
        }
        
        if(checkoutForm) checkoutForm.querySelector('.confirm-order-btn').disabled = false;

        let summaryHTML = '<ul style="list-style: none; padding-right: 0;">';
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            summaryHTML += `
                <li style="margin-bottom: 5px; list-style: disc; margin-right: 20px; font-size: 15px;">
                    ${item.name} (${item.quantity} × ${formatCurrency(item.price)}) = <span style="font-weight: 700; color: var(--color-brand-secondary);">${formatCurrency(itemTotal)}</span>
                </li>
            `;
        });
        summaryHTML += '</ul>';

        summaryElement.innerHTML = summaryHTML;
        totalElement.textContent = formatCurrency(calculateCartTotal());
    };
    
    // 9. وظيفة تجميع تفاصيل الطلب وتعبئتها في الحقل المخفي مباشرةً
    // 🔴 تم حذف معالج الإرسال البرمجي بالكامل لتجنب خطأ الخادم 500
    const prepareCheckoutForm = () => {
        const checkoutForm = document.querySelector('.checkout-container form');
        if (!checkoutForm || cart.length === 0) {
            return;
        }

        // تجميع تفاصيل الطلب
        const orderDetails = cart.map(item => 
            `\n - ${item.name} | الكمية: ${item.quantity} | السعر: ${formatCurrency(item.price)} | الإجمالي: ${formatCurrency(item.price * item.quantity)}`
        ).join('');
        
        const finalTotal = formatCurrency(calculateCartTotal());
        
        const fullMessage = `
            ========================================
            🛒 تفاصيل الطلبية (المجموع: ${finalTotal}): 
            ${orderDetails}
            ========================================
        `;

        // 10. وضع الرسالة الكاملة في الحقل المخفي ليتم إرسالها مع النموذج (عبر HTML Form Action)
        const hiddenInput = document.getElementById('order-details-for-html-form');
        if (hiddenInput) {
             hiddenInput.value = fullMessage;
        }

        // إضافة معالج لزر الإرسال لمسح السلة (يتم تشغيله قبل الإرسال التلقائي لـ HTML)
        const confirmButton = checkoutForm.querySelector('.confirm-order-btn');
        if (confirmButton) {
             confirmButton.addEventListener('click', (e) => {
                if (cart.length > 0) {
                    // مسح السلة بعد نجاح الإرسال التلقائي من HTML
                    cart = [];
                    saveCart(); 
                } else {
                    e.preventDefault(); // منع الإرسال إذا كانت السلة فارغة
                }
            });
        }
        
    };

    // 🔴 لا يوجد معالج لصفحة الاتصال هنا، الإرسال يعتمد على HTML فقط
    

    /* =======================================
       وظائف عامة (UI/UX)
       ======================================= */
       
    // 11. وظيفة زر العودة للأعلى
    const backToTopButton = document.getElementById("backToTop");
    if (backToTopButton) {
        const scrollFunction = () => {
            if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
                backToTopButton.style.display = "block";
            } else {
                backToTopButton.style.display = "none";
            }
        };
        window.onscroll = scrollFunction;
        scrollFunction(); 

        window.topFunction = () => {
            document.body.scrollTop = 0; 
            document.documentElement.scrollTop = 0; 
        };
    }

    // 12. وظيفة فتح/إغلاق القائمة في وضع الجوال
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if(mainNav.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // 13. تعيين السنة الحالية في الفوتر
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
    
    // 14. تحديث حالة السلة عند تحميل أي صفحة
    updateCartCount();
    
    // 15. تفعيل وظيفة عرض السلة إذا كنا في cart.html
    if (document.getElementById('cart-items')) {
        renderCartItems();
    }
    
    // 16. تفعيل وظيفة تجهيز نموذج الشراء إذا كنا في checkout.html
    if (document.querySelector('.checkout-container')) {
        updateCheckoutSummary();
        prepareCheckoutForm();
    }
});