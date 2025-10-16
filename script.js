document.addEventListener('DOMContentLoaded', () => {
    
    // ----------------------------------------------------
    // 1. الوظائف الرئيسية والتهيئة
    // ----------------------------------------------------

    function initializeCart() {
        let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        updateCartCount(cart);

        setupAddToCartListeners();

        if (document.title.includes('سلة المشتريات')) {
            renderCartItems();
        }

        setupBackToTopButton();
    }

    function updateCartCount(cart) {
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.textContent = totalItems;
        }
    }

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
    // 2. وظائف صفحة Index.html (إضافة المنتجات)
    // ----------------------------------------------------
    
    function setupAddToCartListeners() {
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const productCard = event.target.closest('.product-card');
                if (!productCard) return; 

                const productId = productCard.getAttribute('data-product-id');
                const price = parseFloat(productCard.getAttribute('data-price'));
                const quantityInput = productCard.querySelector(`input[id="qty-${productId}"]`);
                const quantity = parseInt(quantityInput.value) || 1; 
                const name = productCard.querySelector('h3').textContent.trim();
                const imageSrc = productCard.querySelector('img').getAttribute('src');

                addItemToCart({
                    id: productId,
                    name: name,
                    price: price,
                    quantity: quantity,
                    image: imageSrc
                });
                
                alert(`تم إضافة ${quantity} من ${name} إلى السلة!`);
            });
        });
    }

    function addItemToCart(product) {
        let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        let itemExists = false;

        cart = cart.map(item => {
            if (item.id === product.id) {
                item.quantity += product.quantity;
                itemExists = true;
            }
            return item;
        });

        if (!itemExists) {
            cart.push(product);
        }

        localStorage.setItem('shoppingCart', JSON.stringify(cart));
        updateCartCount(cart);
    }

    // ----------------------------------------------------
    // 3. وظائف صفحة Cart.html (عرض وتعديل السلة)
    // ----------------------------------------------------

    function renderCartItems() {
        const cartContainer = document.getElementById('cart-items-container');
        const summaryTotal = document.getElementById('cart-total-amount');
        const emptyMessage = document.getElementById('empty-cart-message');
        const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        let total = 0;
        
        cartContainer.innerHTML = '';

        if (cart.length === 0) {
            if (emptyMessage) emptyMessage.style.display = 'block';
            if (summaryTotal) summaryTotal.textContent = '0.00$';
            return;
        } else {
            if (emptyMessage) emptyMessage.style.display = 'none';
        }

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart-item');
            
            cartItemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div style="flex-grow: 1;">
                    <h4 style="margin: 0; font-size: 16px;">${item.name}</h4>
                    <p style="margin: 5px 0 0; color: #888;">السعر: ${item.price.toFixed(2)}$</p>
                </div>
                
                <div class="item-qty-control">
                    <label>الكمية:</label>
                    <input type="number" 
                           value="${item.quantity}" 
                           min="1" 
                           data-item-id="${item.id}"
                           class="cart-qty-input">
                </div>
                
                <div style="font-weight: bold; width: 100px; text-align: left;">
                    ${itemTotal.toFixed(2)}$
                </div>
                
                <button class="remove-item-btn" data-item-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            cartContainer.appendChild(cartItemDiv);
        });

        if (summaryTotal) {
            summaryTotal.textContent = `${total.toFixed(2)}$`;
        }

        setupCartControls();
    }

    function updateItemQuantity(itemId, newQuantity) {
        if (newQuantity < 1) return;

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

    function removeItemFromCart(itemId) {
        let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        cart = cart.filter(item => item.id !== itemId);
        
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
        updateCartCount(cart);
        renderCartItems();
    }

    function setupCartControls() {
        const removeButtons = document.querySelectorAll('.remove-item-btn');
        removeButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const itemId = event.currentTarget.getAttribute('data-item-id');
                removeItemFromCart(itemId);
            });
        });
        
        const qtyInputs = document.querySelectorAll('.cart-qty-input');
        qtyInputs.forEach(input => {
            input.addEventListener('change', (event) => {
                const itemId = event.target.getAttribute('data-item-id');
                const newQuantity = parseInt(event.target.value);
                updateItemQuantity(itemId, newQuantity);
            });
        });
    }

    initializeCart();
});