let products = [];

let cart = [];
let isLoggedIn = localStorage.getItem('rn_isLoggedIn') === 'true';
async function loadProducts() {
    try {
        const response = await fetch('/api/products');

        if (!response.ok) {
            throw new Error('Failed to load products');
        }

        products = await response.json();

        renderProducts(products);

    } catch (error) {
        console.error('Product loading error:', error);

        const grid = document.getElementById('productGrid');

        if (grid) {
            grid.innerHTML = `
                <p style="grid-column:1/-1; text-align:center; padding:40px;">
                    Unable to load products. Please try again.
                </p>
            `;
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    updateCartUI();
    updateAuthUI();
   loadProducts();

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            executeSearch();
        });
        
        searchInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                executeSearch();
            }
        });
    }
});

function showToast(message) {
    let toast = document.getElementById('royalToastNotification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'royalToastNotification';
        toast.className = 'royal-toast';
        document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function showCustomMessageModal(titleText, descText) {
    const modal = document.getElementById('orderSuccessModal');
    const titleEl = document.getElementById('modalSuccessTitle');
    const descEl = document.getElementById('modalSuccessDesc');
    const idBox = document.getElementById('modalIdBoxContainer');
    const actionContainer = document.getElementById('modalActionButtonsContainer');
    
    if (titleEl) titleEl.innerText = titleText;
    if (descEl) descEl.innerHTML = descText;
    if (idBox) idBox.style.display = 'none';

    if (actionContainer) {
        actionContainer.innerHTML = `
            <button class="btn-primary" style="width: 100%;" onclick="document.getElementById('orderSuccessModal').classList.remove('active')">Close ✕</button>
        `;
    }

    if (modal) modal.classList.add('active');
}

function executeSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const query = searchInput.value.toLowerCase().trim();
    switchView('home');
    
    const catalogTitle = document.getElementById('catalogTitle');
    if (catalogTitle) {
        catalogTitle.innerText = query ? `Search Results for "${searchInput.value}"`:'Trending Masterpieces';
    }

    let currentCatalog = products;

    if (!query) {
        renderProducts(currentCatalog);
        return;
    }

    const filtered = currentCatalog.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(query))
    );

    renderProducts(filtered);

    const catalogSection = document.getElementById('catalog');
    if (catalogSection) {
        catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function renderProducts(itemsToDisplay) {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    grid.innerHTML = '';
    
    if (itemsToDisplay.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-dark); padding: 40px; font-weight: 600;">No items found matching your search.</p>`;
        return;
    }

    itemsToDisplay.forEach((product, index) => {
        let stockCount = product.stockQuantity ?? 0;
        let isOutOStock = stockCount <= 0;

        let discountText = "";
        if (product.originalPrice && product.originalPrice > product.price) {
            let percentage = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
            discountText = `-${percentage}%`;
        } else {
            discountText = product.discount || "";
        }

        grid.innerHTML += `
            <div class="product-card" style="animation: fadeInUp 0.6s ease ${index * 0.05}s both; opacity: ${isOutOStock ? '0.65' : '1'};">
                <span class="discount-badge" style="${isOutOStock ? 'background:#d9534f;' : ''}">${isOutOStock ? 'Out of Stock' : discountText}</span>
                <div class="product-img-wrap" style="background-image: url('${product.image}');">
                    <div class="product-actions">
                        <button class="action-btn" onclick="openQuickView(${product.id})">Quick View</button>
                        ${isOutOStock ? '' : `<button class="action-btn add-to-cart-btn" onclick="addToCart(${product.id})">Add</button>`}
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <div class="price-box">
                        <span class="current-price">₹${product.price}</span>
                        <span class="original-price">₹${product.originalPrice}</span>
                    </div>
                </div>
            </div>
        `;
    });
}

function filterCategory(categoryName) {
    switchView('home');
let currentCatalog = products;    
    const catalogTitle = document.getElementById('catalogTitle');
    if (catalogTitle) {
        catalogTitle.innerText = categoryName === 'All' ? 'Trending Masterpieces' : categoryName;
    }

    if (categoryName === 'All') {
        renderProducts(currentCatalog);
    } else {
        const filtered = currentCatalog.filter(p => p.category === categoryName);
        renderProducts(filtered);
    }
    document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
}

function filterSubCategory(subCategoryName) {
    switchView('home');
let currentCatalog = products;    
    const catalogTitle = document.getElementById('catalogTitle');
    if (catalogTitle) {
        catalogTitle.innerText = subCategoryName;
    }

    const filtered = currentCatalog.filter(p => 
        (p.subcategory && p.subcategory.toLowerCase() === subCategoryName.toLowerCase()) || 
        p.title.toLowerCase().includes(subCategoryName.toLowerCase())
    );
    renderProducts(filtered);
    document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
}

function switchView(viewName) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    
    if (viewName === 'home') {
        document.getElementById('homeView').classList.add('active');
    } else if (viewName === 'checkout') {
        document.getElementById('checkoutView').classList.add('active');
    } else if (viewName === 'account') {
        document.getElementById('accountView').classList.add('active');
    } else if (viewName === 'track') {
        document.getElementById('trackView').classList.add('active');
    } else if (viewName === 'orders') {
        if (!isLoggedIn) {
            switchView('account');
            return;
        }
        document.getElementById('ordersView').classList.add('active');
        renderOrdersUI();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleCart() {
    document.getElementById('cartDrawer').classList.toggle('active');
    document.getElementById('cartOverlay').classList.toggle('active');
}

async function addToCart(productId) {
    if (!isLoggedIn) {
        showToast("✨ Please Sign In to add items to your bag.");
        switchView('account');
        return;
    }

    const product = products.find(p => p.id === productId);

    if (!product) {
        showToast("Product not found.");
        return;
    }

    try {
        // Check real stock from Flask/MySQL
        const response = await fetch(`/api/products/${productId}/stock`);

        if (!response.ok) {
            throw new Error("Unable to check stock");
        }

        const stockData = await response.json();

        // Check how many are already in the cart
        const existingItem = cart.find(item => item.id === productId);
        const currentCartQuantity = existingItem ? existingItem.quantity : 0;

        // Don't allow cart quantity to exceed database stock
        if (currentCartQuantity + 1 > stockData.stockQuantity) {
            showToast("❌ Not enough stock available.");
            return;
        }

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        updateCartUI();
        toggleCart();
        showToast("🛍️ Added to your shopping bag!");

    } catch (error) {
        console.error("Stock check error:", error);
        showToast("❌ Unable to check product availability.");
    }
}

async function changeQuantity(productId, delta) {
    const item = cart.find(item => item.id === productId);

    if (!item) return;

    // Decreasing quantity doesn't need a stock check
    if (delta < 0) {
        item.quantity += delta;

        if (item.quantity <= 0) {
            cart = cart.filter(cartItem => cartItem.id !== productId);
        }

        updateCartUI();
        return;
    }

    try {
        const response = await fetch(`/api/products/${productId}/stock`);

        if (!response.ok) {
            throw new Error("Unable to check stock");
        }

        const stockData = await response.json();

        if (item.quantity + delta > stockData.stockQuantity) {
            showToast("❌ Maximum available stock reached.");
            return;
        }

        item.quantity += delta;
        updateCartUI();

    } catch (error) {
        console.error("Stock check error:", error);
        showToast("❌ Unable to check product availability.");
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
}

function updateCartUI() {
    const badge = document.getElementById('cartCount');
    if (badge) {
        const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.innerText = totalCount;
    }
    
    const cartBody = document.getElementById('cartBody');
    const subtotalEl = document.getElementById('cartSubtotalDrawer');
    
    if (!cartBody) return;

    if (cart.length === 0) {
        cartBody.innerHTML = `<p style="color: #777; text-align: center; margin-top: 40px;">Your bag is currently empty.</p>`;
        if (subtotalEl) subtotalEl.innerText = `₹0`;
        return;
    }

    let total = 0;
    cartBody.innerHTML = cart.map(item => {
        let itemTotal = item.price * item.quantity;
        total += itemTotal;
        return `
            <div class="cart-item">
                <div class="cart-item-img" style="background-image: url('${item.image}')"></div>
                <div class="cart-item-details">
                    <span class="cart-item-title">${item.title}</span>
                    <span class="cart-item-price">₹${item.price}</span>
                    <div class="cart-item-controls">
                        <button type="button" onclick="changeQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button type="button" onclick="changeQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button type="button" onclick="removeFromCart(${item.id})" style="background:none; border:none; color:#d9534f; cursor:pointer; font-size:1rem;">🗑️</button>
            </div>
        `;
    }).join('');
    
    if (subtotalEl) subtotalEl.innerText = `₹${total}`;
}

function proceedToCheckout() {
    if (!isLoggedIn) {
        switchView('account');
        toggleCart();
        return;
    }

    if (cart.length === 0) {
        showToast('🛒 Your bag is currently empty.');
        return;
    }
    
    toggleCart();
    switchView('checkout');
    
    const listEl = document.getElementById('checkoutItemsList');
    if (!listEl) return;
    
    listEl.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
        let itemTotal = item.price * item.quantity;
        total += itemTotal;
        listEl.innerHTML += `<div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 5px;"><span>${item.title} (x${item.quantity})</span> <b>₹${itemTotal}</b></div>`;
    });
    document.getElementById('chkSubtotal').innerText = `₹${total}`;
    document.getElementById('chkTotal').innerText = `₹${total}`;
}

function completeOrder() {
    if (cart.length === 0) {
        showToast('🛒 Your bag is empty!');
        return;
    }

    const nameInput = document.getElementById('chkName');
    const phoneInput = document.getElementById('chkPhone');
    const addressInput = document.getElementById('chkAddress');

    const errorName = document.getElementById('errorName');
    const errorPhone = document.getElementById('errorPhone');
    const errorAddress = document.getElementById('errorAddress');

    let isValid = true;

    if (!nameInput.value.trim()) {
        if (errorName) errorName.style.display = 'block';
        nameInput.style.borderColor = '#d9534f';
        isValid = false;
    } else {
        if (errorName) errorName.style.display = 'none';
        nameInput.style.borderColor = '';
    }

    if (!phoneInput.value.trim()) {
        if (errorPhone) errorPhone.style.display = 'block';
        phoneInput.style.borderColor = '#d9534f';
        isValid = false;
    } else {
        if (errorPhone) errorPhone.style.display = 'none';
        phoneInput.style.borderColor = '';
    }

    if (!addressInput.value.trim()) {
        if (errorAddress) errorAddress.style.display = 'block';
        addressInput.style.borderColor = '#d9534f';
        isValid = false;
    } else {
        if (errorAddress) errorAddress.style.display = 'none';
        addressInput.style.borderColor = '';
    }

    if (!isValid) {
        showToast('⚠️ Please complete all required shipping fields.');
        return;
    }

    let totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const selectedPayment = document.querySelector('input[name="payment"]:checked');
    const paymentMethodName = selectedPayment ? selectedPayment.value : 'Prepaid UPI Payment';

    saveAndFinalizeOrder(totalAmount, 'Prepaid: ' + paymentMethodName);
}

async function saveAndFinalizeOrder(totalAmount, paymentMethod) {
    const customerName = document.getElementById('chkName').value.trim();
    const customerPhone = document.getElementById('chkPhone').value.trim();
    const customerAddress = document.getElementById('chkAddress').value.trim();

    const orderData = {
        customerName: customerName,
        customerPhone: customerPhone,
        customerAddress: customerAddress,
        paymentType: paymentMethod,
        items: [...cart]
    };

    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        console.log("Order created:", result);

        if (!response.ok || !result.success) {
            showToast("❌ " + (result.error || "Unable to place order."));
            return;
        }

        // Save the server-created order ID locally for the UI
        const newOrder = {
            id: result.orderId,
            date: new Date().toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            }),
            customerName: customerName,
            customerPhone: customerPhone,
            customerAddress: customerAddress,
            items: [...cart],
            total: result.total,
            paymentType: paymentMethod,
            status: 'Confirmed'
        };

        let existingOrders =
            JSON.parse(localStorage.getItem('rn_orders')) || [];

        existingOrders.unshift(newOrder);

        localStorage.setItem(
            'rn_orders',
            JSON.stringify(existingOrders)
        );

        // Clear cart
        cart = [];
        updateCartUI();

        // Show success modal
        const modal = document.getElementById('orderSuccessModal');
        const titleEl = document.getElementById('modalSuccessTitle');
        const descEl = document.getElementById('modalSuccessDesc');
        const idBox = document.getElementById('modalIdBoxContainer');
        const orderIdEl = document.getElementById('modalGeneratedOrderId');
        const actionContainer =
            document.getElementById('modalActionButtonsContainer');

        if (titleEl) {
            titleEl.innerText = "Order Placed Successfully!";
        }

        if (descEl) {
            descEl.innerHTML =
                `Thank you for shopping with <strong style="color: var(--primary);">Royal Naari</strong>. Your order has been confirmed.`;
        }

        if (idBox) {
            idBox.style.display = 'flex';
        }

        if (orderIdEl) {
            orderIdEl.innerText = result.orderId;
        }

        if (actionContainer) {
            actionContainer.innerHTML = `
                <button class="btn-primary"
                    onclick="closeSuccessModalAndTrack()">
                    Track Order 🚚
                </button>

                <button class="btn-outline-modal"
                    onclick="closeSuccessModalAndHome()">
                    Back To Homepage 🏠
                </button>
            `;
        }

        if (modal) {
            modal.classList.add('active');
        }

    } catch (error) {
        console.error("Order error:", error);
        showToast("❌ Unable to connect to the server.");
    }
}

function closeSuccessModalAndTrack() {
    const successModal = document.getElementById('orderSuccessModal');
    if (successModal) successModal.classList.remove('active');
    switchView('track');
}

function closeSuccessModalAndHome() {
    const successModal = document.getElementById('orderSuccessModal');
    if (successModal) successModal.classList.remove('active');
    switchView('home');
}

function renderOrdersUI() {
    let currentOrders = JSON.parse(localStorage.getItem('rn_orders')) || [];
    const container = document.getElementById('ordersContainer');
    if (!container) return;

    if (currentOrders.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; background: var(--white); border-radius: 14px; border: 1px solid #E5DCD6;">
                <p style="color: #666; font-size: 1.1rem; margin-bottom: 15px;">You haven't placed any orders yet.</p>
                <button class="btn-primary" onclick="switchView('home')">Start Shopping 👑</button>
            </div>`;
        return;
    }

    container.innerHTML = '';
    currentOrders.forEach(order => {
        let itemsHTML = '';
        order.items.forEach(item => {
            itemsHTML += `
                <div class="order-item-row">
                    <span>${item.title} (x${item.quantity})</span> 
                    <b>₹${item.price * item.quantity}</b>
                </div>`;
        });

        container.innerHTML += `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <span style="display: block; font-weight: 700; color: var(--text-dark); font-size: 1rem;">Order ID: ${order.id}</span>
                        <span style="font-size: 0.8rem; color: #777;">Placed on ${order.date}</span>
                    </div>
                    <span class="order-status-badge">${order.status || 'Confirmed'} ✓</span>
                </div>
                <div style="margin-bottom: 10px;">${itemsHTML}</div>
                <div class="order-footer-row">
                    <span class="order-payment-meta">Paid via: ${order.paymentType}</span>
                    <span style="color: var(--primary);">Total: ₹${order.total}</span>
                </div>
            </div>
        `;
    });
}

function switchAuthTab(tab) {
    const loginBtn = document.getElementById('loginTabBtn');
    const regBtn = document.getElementById('registerTabBtn');
    const loginContent = document.getElementById('loginFormContent');
    const regContent = document.getElementById('registerFormContent');

    if (tab === 'login') {
        loginBtn.classList.add('active'); regBtn.classList.remove('active');
        loginContent.style.display = 'block'; regContent.style.display = 'none';
    } else {
        regBtn.classList.add('active'); loginBtn.classList.remove('active');
        regContent.style.display = 'block'; loginContent.style.display = 'none';
    }
}

function handleLogin() {
    isLoggedIn = true;
    localStorage.setItem('rn_isLoggedIn', 'true');
    showToast("👑 Welcome back to Royal Naari!");
    updateAuthUI();
    switchView('home');
}

function handleRegister() {
    isLoggedIn = true;
    localStorage.setItem('rn_isLoggedIn', 'true');
    showToast("✨ Royal account created successfully!");
    updateAuthUI();
    switchView('home');
}

function handleLogout() {
    isLoggedIn = false;
    localStorage.setItem('rn_isLoggedIn', 'false');
    showToast("👋 You have been logged out.");
    updateAuthUI();
    switchView('home');
}

function handleOrderTracking() {
    const queryInput = document.getElementById('trackQueryInput');
    const resultContainer = document.getElementById('trackResultContainer');

    if (!queryInput || !resultContainer) return;

    const query = queryInput.value.trim().toLowerCase();

    if (!query) {
        showToast("⚠️ Please enter a valid Order ID or Phone Number.");
        return;
    }

    const orders = JSON.parse(localStorage.getItem('rn_orders')) || [];
    const matchedOrders = orders.filter(o => 
        (o.id && o.id.toLowerCase().includes(query)) || 
        (o.customerPhone && o.customerPhone.includes(query))
    );

    if (matchedOrders.length === 0) {
        resultContainer.innerHTML = `
            <div class="order-card" style="text-align: center; padding: 30px;">
                <p style="color: var(--text-dark); font-weight: 600;">No order found matching "${query}". Please check your details.</p>
            </div>
        `;
        return;
    }

    resultContainer.innerHTML = matchedOrders.map(ord => {
        let itemsList = ord.items ? ord.items.map(i => `${i.title} (x${i.quantity}) - ₹${i.price * i.quantity}`).join(', ') : 'Jewelry Item';
        let currentStatus = ord.status || 'Confirmed';
        
        let isConfirmed = true;
        let isPacked = ['Packed', 'In Transit', 'Out for Delivery', 'Delivered', 'Confirmed'].includes(currentStatus);
        let isInTransit = ['In Transit', 'Out for Delivery', 'Delivered'].includes(currentStatus);
        let isOutForDelivery = ['Out for Delivery', 'Delivered'].includes(currentStatus);
        let isDelivered = currentStatus === 'Delivered';

        return `
            <div class="order-card" style="border-left-color: var(--primary);">
                <div class="order-header">
                    <div>
                        <strong>Order ID: ${ord.id}</strong><br>
                        <small class="order-payment-meta">Placed on: ${ord.date || 'Recent'}</small>
                    </div>
                    <span class="order-status-badge">🚚 ${currentStatus}</span>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <p style="font-size: 0.9rem; margin-bottom: 4px;"><strong>Customer:</strong> ${ord.customerName || 'Valued Customer'} (${ord.customerPhone || 'N/A'})</p>
                    <p style="font-size: 0.9rem; margin-bottom: 4px;"><strong>Delivery Address:</strong> ${ord.customerAddress || 'N/A'}</p>
                    <p style="font-size: 0.9rem;"><strong>Items:</strong> ${itemsList}</p>
                </div>

                <div class="tracking-timeline">
                    <div class="timeline-step ${isConfirmed ? 'completed' : ''}">
                        <div class="step-dot">✓</div>
                        <span>Confirmed</span>
                    </div>
                    <div class="timeline-step ${isPacked ? 'completed' : ''}">
                        <div class="step-dot">${isPacked ? '✓' : '2'}</div>
                        <span>Packed</span>
                    </div>
                    <div class="timeline-step ${isInTransit ? 'completed' : ''}">
                        <div class="step-dot">${isInTransit ? '✓' : '3'}</div>
                        <span>In Transit</span>
                    </div>
                    <div class="timeline-step ${isOutForDelivery ? 'active' : ''}">
                        <div class="step-dot">${isDelivered ? '✓' : '🚚'}</div>
                        <span>Out for Delivery</span>
                    </div>
                    <div class="timeline-step ${isDelivered ? 'completed active' : ''}">
                        <div class="step-dot">🏠</div>
                        <span>Delivered</span>
                    </div>
                </div>

                <div class="order-footer-row">
                    <span class="order-payment-meta">Payment: ${ord.paymentType || 'Prepaid'}</span>
                    <span style="color: var(--primary);">Total: ₹${ord.total}</span>
                </div>
            </div>
        `;
    }).join('');
}

function updateAuthUI() {
    const authBtn = document.getElementById('authIconBtn');
    if (authBtn) {
        if (isLoggedIn) {
            authBtn.innerText = '✅';
            authBtn.title = "Logged In (Click to Logout)";
        } else {
            authBtn.innerText = '👤';
            authBtn.title = "Account / Login";
        }
    }
}

function openQuickView(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    document.getElementById('modalImg').style.backgroundImage = `url('${product.image}')`;
    document.getElementById('modalTitle').innerText = product.title;
    document.getElementById('modalPrice').innerText = `₹${product.price}`;
    document.getElementById('modalOriginal').innerText = `₹${product.originalPrice}`;
    document.getElementById('modalAddToCart').onclick = function() {
        addToCart(product.id);
        closeModalForce();
    };
    document.getElementById('quickViewModal').classList.add('active');
}

function closeModal(e) {
    if (e.target.id === 'quickViewModal') {
        document.getElementById('quickViewModal').classList.remove('active');
    }
}

function closeModalForce() {
    document.getElementById('quickViewModal').classList.remove('active');
}

function scrollToCatalog() {
    document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
}