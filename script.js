/* =======================================
   SCRIPT.JS - وظائف متجر عالم الجوالات
   يشمل: السلة، إتمام الشراء، التجاوب، زر العودة للأعلى
   ======================================= */

document.addEventListener('DOMContentLoaded', () => {
    // 1. تعريف وظيفة تنسيق العملة
    const formatCurrency = (amount) => {
        return `$${parseFloat(amount).toFixed(2)}`;
    };

    // 2. إدارة السلة (التحميل والحفظ والحساب)
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const saveCart = () => {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        if (document.getElementById('cart-items')) {
            renderCartItems();
        }
        if (document.getElementById('checkout-form')) {
            updateCheckoutSummary();
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

    // 4. معالج النقر على زر "أضف إلى السلة"
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            if (!card) return;

            const productId = card.dataset.productId;
            const price = parseFloat(card.dataset.price);
            
            // استخراج اسم المنتج من عنوان h3
            const productNameElement = card.querySelector('h3');
            const name = productNameElement ? productNameElement.textContent.trim() : 'منتج غير معروف';

            // استخراج الكمية من حقل الإدخال المقابل
            const qtyInput = card.querySelector(`#qty-${productId}`);
            const quantity = qtyInput ? parseInt(qtyInput.value) : 1;
            
            if (productId && price > 0 && quantity > 0) {
                addToCart(productId, name, price, quantity);
            } else {
                alert('عذراً، لا يمكن إضافة هذا المنتج حالياً.');
            }
        });
    });
    
    // 5. وظيفة تحديث الكمية في صفحة السلة (cart.html)
    const updateCartItemQuantity = (productId, newQuantity) => {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = parseInt(newQuantity);
            if (item.quantity <= 0) {
                // إذا أصبحت الكمية صفر، قم بحذفه
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
        alert('تم حذف المنتج من السلة.');
    };

    // 7. وظيفة عرض محتويات السلة في صفحة cart.html
    const renderCartItems = () => {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotalElement = document.getElementById('cart-total');
        if (!cartItemsContainer || !cartTotalElement) return;

        cartItemsContainer.innerHTML = ''; // تفريغ المحتوى الحالي

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-center" style="font-size: 18px; color: #888;">سلة مشترياتك فارغة حالياً.</p>';
            cartTotalElement.textContent = formatCurrency(0);
            document.querySelector('.checkout-link').style.display = 'none';
            return;
        }
        
        document.querySelector('.checkout-link').style.display = 'block';

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            const itemHTML = `
                <div class="cart-item" data-product-id="${item.id}">
                    <span class="delete-item-btn" data-product-id="${item.id}"><i class="fas fa-trash-alt"></i></span>
                    <div class="item-details">
                        <img src="img/products/${item.id}.png" alt="${item.name}" onerror="this.onerror=null;this.src='placeholder.png';">
                        <h3>${item.name}</h3>
                        <p class="price-per-unit">السعر: ${formatCurrency(item.price)}</p>
                    </div>
                    <div class="quantity-control">
                        <label for="qty-${item.id}">الكمية:</label>
                        <input type="number" id="qty-${item.id}" class="item-quantity-input" value="${item.quantity}" min="1" data-product-id="${item.id}">
                    </div>
                    <div class="item-total">
                        المجموع: <span class="total-amount">${formatCurrency(itemTotal)}</span>
                    </div>
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
                    // إذا حاول إدخال 0، نعيده إلى 1 أو نحذفه
                    e.target.value = 1;
                    updateCartItemQuantity(productId, 1);
                }
            });
        });
        
        document.querySelectorAll('.delete-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.closest('.delete-item-btn').dataset.productId;
                removeFromCart(productId);
            });
        });
    };
    
    /* =======================================
       وظائف صفحة إتمام الشراء (checkout.html)
       ======================================= */
       
    // 8. وظيفة تحديث ملخص الطلب في صفحة checkout.html
    const updateCheckoutSummary = () => {
        const summaryElement = document.getElementById('checkout-summary');
        const totalElement = document.getElementById('checkout-total');
        
        if (!summaryElement || !totalElement) return;
        
        if (cart.length === 0) {
            summaryElement.innerHTML = '<p style="color: red; font-weight: 700;">سلة المشتريات فارغة! يرجى العودة للصفحة الرئيسية.</p>';
            totalElement.textContent = formatCurrency(0);
            // قد ترغب هنا في إعادة توجيه المستخدم لصفحة السلة/الرئيسية
            return;
        }

        let summaryHTML = '<ul>';
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            summaryHTML += `
                <li style="margin-bottom: 5px; list-style: circle; margin-right: 20px;">
                    ${item.name} (${item.quantity} × ${formatCurrency(item.price)}) = <span style="font-weight: 700;">${formatCurrency(itemTotal)}</span>
                </li>
            `;
        });
        summaryHTML += '</ul>';

        summaryElement.innerHTML = summaryHTML;
        totalElement.textContent = formatCurrency(calculateCartTotal());
    };
    
    // 9. معالج إرسال نموذج إتمام الشراء
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault(); // منع الإرسال الافتراضي

            if (cart.length === 0) {
                alert('سلة المشتريات فارغة، لا يمكن إتمام الطلب.');
                return;
            }
            
            // 10. جمع بيانات العميل
            const customerData = {
                name: document.getElementById('full-name').value,
                phone: document.getElementById('phone-number').value,
                email: document.getElementById('email').value,
                city: document.getElementById('city').value,
                address: document.getElementById('address').value,
            };

            // 11. تجميع تفاصيل الطلب
            const orderDetails = cart.map(item => ({
                product: item.name,
                quantity: item.quantity,
                price: formatCurrency(item.price),
                total: formatCurrency(item.price * item.quantity)
            }));
            
            const finalTotal = formatCurrency(calculateCartTotal());

            // 12. بناء رسالة الطلب النهائية (يمكن إرسالها عبر WhatsApp أو Email)
            let message = `
========================================
    🎉 طلب جديد من متجر عالم الجوالات 🎉
========================================
✅ بيانات العميل:
الاسم: ${customerData.name}
الهاتف: ${customerData.phone}
البريد: ${customerData.email || 'لا يوجد'}
المدينة: ${customerData.city}
العنوان: ${customerData.address}

🛒 تفاصيل الطلبات:
${orderDetails.map(item => 
    ` - ${item.product} | الكمية: ${item.quantity} | الإجمالي: ${item.total}`
).join('\n')}

💰 المجموع الكلي للطلبية: ${finalTotal}
========================================
`;

            console.log(message); // لعرضها في Console
            
            // 13. وظيفة الإرسال الفعلي (مثال: إرسال عبر WhatsApp)
            // بما أننا لا نعمل على سيرفر حقيقي، سنستخدم هذه الطريقة للعرض.
            
            alert('تم تأكيد طلبك بنجاح! سيتم التواصل معك قريباً لتأكيد تفاصيل الشحن.\n\nيمكنك رؤية تفاصيل رسالة الطلب في Console (F12).');

            // 14. مسح السلة بعد إتمام الطلب
            cart = [];
            saveCart(); 
            
            // يمكنك إعادة توجيه المستخدم لصفحة شكر بعد الإرسال
            // setTimeout(() => window.location.href = 'thank-you.html', 1500); 
        });
        
        // تحديث الملخص عند تحميل الصفحة
        updateCheckoutSummary();
    }


    /* =======================================
       وظائف عامة (UI/UX)
       ======================================= */
       
    // 15. وظيفة زر العودة للأعلى
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
        scrollFunction(); // تأكد من الحالة عند التحميل

        window.topFunction = () => {
            document.body.scrollTop = 0; // Safari
            document.documentElement.scrollTop = 0; // Chrome, Firefox, IE and Opera
        };
    }

    // 16. وظيفة فتح/إغلاق القائمة في وضع الجوال
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            menuToggle.querySelector('i').classList.toggle('fa-bars');
            menuToggle.querySelector('i').classList.toggle('fa-times');
        });
    }

    // 17. تعيين السنة الحالية في الفوتر
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
    
    // 18. تحديث حالة السلة عند تحميل أي صفحة
    updateCartCount();
    
    // 19. تفعيل وظيفة عرض السلة إذا كنا في cart.html
    if (document.getElementById('cart-items')) {
        renderCartItems();
    }
});