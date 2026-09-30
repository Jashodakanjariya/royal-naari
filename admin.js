let catalogSearchQuery = "";

function getFullCatalog() {
    return JSON.parse(localStorage.getItem('rn_products')) || [];
}

function getOrders() {
    return JSON.parse(localStorage.getItem('rn_orders')) || [];
}

function getCustomers() {
    let customers = JSON.parse(localStorage.getItem('rn_customers')) || [];
    if (customers.length === 0) {
        customers = [{ name: "Priya Sharma", email: "priya.sharma@example.com", date: "Today" }];
        localStorage.setItem('rn_customers', JSON.stringify(customers));
    }
    return customers;
}

function getCategoriesList() {
    let cats = JSON.parse(localStorage.getItem('rn_categories')) || [
        { code: "CAT-RIN-101", name: "Rings" },
        { code: "CAT-EAR-102", name: "Earrings" },
        { code: "CAT-BRA-103", name: "Bracelets" },
        { code: "CAT-WAT-104", name: "Watches" },
        { code: "CAT-CLU-105", name: "Clutches" },
        { code: "CAT-NEC-106", name: "Necklace" }
    ];
    return cats;
}

function renderDashboard() {
    const fullCatalog = getFullCatalog();
    const adminOrders = getOrders();
    const customers = getCustomers();
    const categories = getCategoriesList();

    const statOrd = document.getElementById('statOrders');
    const statRev = document.getElementById('statRevenue');
    const statCust = document.getElementById('statCustomers');
    const orderBadge = document.getElementById('orderBadge');
    const customerBadge = document.getElementById('customerBadge');
    const headerCount = document.getElementById('catalogCountHeader');
    const customerCountHeader = document.getElementById('customerCountHeader');

    if (statOrd) statOrd.textContent = adminOrders.length;
    if (statCust) statCust.textContent = customers.length;
    if (headerCount) headerCount.textContent = fullCatalog.length;
    if (customerCountHeader) customerCountHeader.textContent = customers.length;

    if (orderBadge) {
        orderBadge.textContent = adminOrders.length;
        orderBadge.style.display = adminOrders.length > 0 ? 'inline-block' : 'none';
    }
    if (customerBadge) {
        customerBadge.textContent = customers.length;
    }

    const revSum = adminOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    if (statRev) statRev.textContent = `₹${revSum}`;

    // Render Orders Table
    const ordersBody = document.getElementById('ordersTableBody');
    if (ordersBody) {
        if (adminOrders.length === 0) {
            ordersBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-dark); opacity:0.7; padding: 25px;">No customer orders received yet.</td></tr>`;
        } else {
            ordersBody.innerHTML = adminOrders.map(ord => {
                let itemsList = ord.items ? ord.items.map(i => `${i.title} (₹${i.price})`).join(', ') : 'Jewelry Item';
                let currentStatus = ord.status || 'Confirmed';

                return `
                    <tr>
                        <td>
                            <strong>${ord.id}</strong><br>
                            <small style="opacity:0.7;">${ord.date || 'Today'}</small>
                        </td>
                        <td>
                            <strong>${ord.customerName || 'Valued Customer'}</strong><br>
                            <small style="color:var(--primary);">📞 ${ord.customerPhone || 'N/A'}</small><br>
                            <small style="opacity:0.8; display:block; max-width:200px; word-break:break-word;">📍 ${ord.customerAddress || 'N/A'}</small>
                        </td>
                        <td style="max-width:220px;">${itemsList}</td>
                        <td>
                            <strong style="color:var(--primary);">₹${ord.total}</strong><br>
                            <small style="opacity:0.7;">${ord.paymentType || 'Prepaid'}</small>
                        </td>
                        <td>
                            <select onchange="updateOrderStatus('${ord.id}', this.value)" style="padding: 6px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-dark); cursor: pointer;">
                                <option value="Confirmed" ${currentStatus === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                                <option value="Packed" ${currentStatus === 'Packed' ? 'selected' : ''}>Packed</option>
                                <option value="In Transit" ${currentStatus === 'In Transit' ? 'selected' : ''}>In Transit</option>
                                <option value="Out for Delivery" ${currentStatus === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
                                <option value="Delivered" ${currentStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
                            </select>
                        </td>
                        <td>
                            <button onclick="removeOrder('${ord.id}')" style="background:rgba(200, 154, 61, 0.15); color:var(--primary); border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:600;">Clear</button>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    }

    // Render Registered Customers
    const custBody = document.getElementById('adminCustomersTableBody');
    if (custBody) {
        if (customers.length === 0) {
            custBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-dark); opacity:0.7; padding: 25px;">No registered customers found.</td></tr>`;
        } else {
            custBody.innerHTML = customers.map(cust => `
                <tr>
                    <td><strong>${cust.name || 'Customer'}</strong></td>
                    <td>${cust.email || 'N/A'}</td>
                    <td>${cust.date || 'Recent'}</td>
                    <td><span class="status-pill">Active</span></td>
                </tr>
            `).join('');
        }
    }

    // Render Categories
    const catBody = document.getElementById('categoriesTableBody');
    if (catBody) {
        catBody.innerHTML = categories.map(cat => `
            <tr>
                <td><code style="background:rgba(200, 154, 61, 0.1); color:var(--primary); padding:4px 8px; border-radius:4px; font-weight:bold;">${cat.code}</code></td>
                <td><strong>${cat.name}</strong></td>
            </tr>
        `).join('');
    }

    const pCategorySelect = document.getElementById('pCategory');
    if (pCategorySelect) {
        pCategorySelect.innerHTML = categories.map(cat => `
            <option value="${cat.name}">${cat.name}</option>
        `).join('');
    }

    // Render Catalog Table with Editable Prices & Stock Quantity
    let filteredProducts = fullCatalog;
    if (catalogSearchQuery.trim() !== '') {
        const query = catalogSearchQuery.toLowerCase();
        filteredProducts = fullCatalog.filter(p => p.title.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));
    }

   const prodBody = document.getElementById('productsTableBody');
    if (prodBody) {
        if (filteredProducts.length === 0) {
            prodBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-dark); opacity:0.7; padding: 25px;">No products found.</td></tr>`;
        } else {
            prodBody.innerHTML = filteredProducts.map((p, index) => {
                let stockQty = p.stock !== undefined ? p.stock : 10; 
                return `
                    <tr>
                        <td style="display:flex; align-items:center; gap:12px;">
                            <span style="opacity:0.7; font-size:0.75rem;">#${index + 1}</span>
                            <img src="${p.image}" onerror="this.style.display='none'" style="width:36px; height:36px; border-radius:6px; object-fit:cover;">
                            <div><strong>${p.title}</strong><small style="display:block; opacity:0.7;">ID: ${p.id}</small></div>
                        </td>
                        <td><span style="background:rgba(200, 154, 61, 0.1); color:var(--primary); padding:4px 10px; border-radius:6px; font-size:0.75rem;">${p.category}</span></td>
                        <td>
                            <input type="number" value="${p.price}" onchange="updateProductPrice(${p.id}, this.value)" style="width: 80px; padding: 6px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--card-bg); font-weight: bold; color: var(--primary);">
                        </td>
                        <td>
                            <input type="number" value="${p.originalPrice || p.price * 2}" onchange="updateProductOriginalPrice(${p.id}, this.value)" style="width: 80px; padding: 6px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--card-bg); opacity: 0.8;">
                        </td>
                        <td>
                            <input type="number" value="${stockQty}" onchange="updateProductStock(${p.id}, this.value)" style="width: 70px; padding: 6px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--card-bg); font-weight: bold; ${stockQty <= 0 ? 'color: #d9534f;' : 'color: #4B5E26;'}">
                        </td>
                        <td><button onclick="removeProduct(${p.id})" style="background:rgba(168, 123, 46, 0.15); color:var(--hover); border:none; padding:6px 12px; border-radius:6px; cursor:pointer;">Delete</button></td>
                    </tr>
                `;
            }).join('');
        }
    }
}

// Live stock update function
window.updateProductStock = function(id, newStock) {
    let products = getFullCatalog();
    let product = products.find(p => p.id === id);
    if (product) {
        product.stock = Number(newStock);
        localStorage.setItem('rn_products', JSON.stringify(products));
        renderDashboard();
    }
};

window.addNewCategory = function() {
    const input = document.getElementById('newCategoryNameInput');
    const msgDiv = document.getElementById('categoryResultMsg');
    if (!input || !input.value.trim()) {
        if(msgDiv) msgDiv.innerText = "⚠️ Please enter a category name.";
        return;
    }
    const catName = input.value.trim();
    let categories = getCategoriesList();

    if (categories.some(c => c.name.toLowerCase() === catName.toLowerCase())) {
        if(msgDiv) {
            msgDiv.style.color = "#d9534f";
            msgDiv.innerText = "❌ Category already exists!";
        }
        return;
    }

    const catCode = "CAT-" + catName.substring(0, 3).toUpperCase() + "-" + Math.floor(100 + Math.random() * 900);
    categories.push({ code: catCode, name: catName });
    localStorage.setItem('rn_categories', JSON.stringify(categories));

    if(msgDiv) {
        msgDiv.style.color = "var(--primary)";
        msgDiv.innerText = `✅ Category created successfully! Assigned Code: ${catCode}`;
    }
    input.value = '';
    renderDashboard();
};

window.updateProductPrice = function(id, newPrice) {
    let products = getFullCatalog();
    let product = products.find(p => p.id === id);
    if (product) {
        product.price = Number(newPrice);
        localStorage.setItem('rn_products', JSON.stringify(products));
        renderDashboard();
    }
};

window.updateProductOriginalPrice = function(id, newOrigPrice) {
    let products = getFullCatalog();
    let product = products.find(p => p.id === id);
    if (product) {
        product.originalPrice = Number(newOrigPrice);
        localStorage.setItem('rn_products', JSON.stringify(products));
        renderDashboard();
    }
};

window.updateOrderStatus = function(orderId, newStatus) {
    let orders = getOrders();
    let order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        localStorage.setItem('rn_orders', JSON.stringify(orders));
        renderDashboard();
    }
};

function switchAdminView(targetView) {
    renderDashboard();
    document.querySelectorAll('.sidebar-nav .nav-item:not(.store-link)').forEach(item => {
        if (item.getAttribute('data-view') === targetView) item.classList.add('active');
        else item.classList.remove('active');
    });
    document.querySelectorAll('.admin-view-panel').forEach(panel => {
        if (panel.id === `view${targetView.charAt(0).toUpperCase() + targetView.slice(1)}`) panel.classList.add('active');
        else panel.classList.remove('active');
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.toggleAddProductModal = function() {
    const modal = document.getElementById('addProductModal');
    if (!modal) return;
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
};

window.closeModalOutside = function(e) {
    if (e.target.id === 'addProductModal') toggleAddProductModal();
};

window.handleNewProductSubmit = function(e) {
    e.preventDefault();
    let products = getFullCatalog();
    const newProd = {
        id: Date.now(),
        title: document.getElementById('pTitle').value.trim(),
        category: document.getElementById('pCategory').value,
        image: document.getElementById('pImg').value.trim(),
        originalPrice: Number(document.getElementById('pOrigPrice').value),
        price: Number(document.getElementById('pSalePrice').value),
        stock: 10, // Default stock on creation
        discount: "-50%"
    };
    products.unshift(newProd);
    localStorage.setItem('rn_products', JSON.stringify(products));
    toggleAddProductModal();
    const form = document.getElementById('newProductForm');
    if (form) form.reset();
    renderDashboard();
    switchAdminView('catalog');
    alert("✨ New jewellery piece published successfully!");
};

window.removeProduct = function(id) {
    if (confirm("Delete this item from store?")) {
        let products = getFullCatalog().filter(p => p.id !== id);
        localStorage.setItem('rn_products', JSON.stringify(products));
        renderDashboard();
    }
};

window.removeOrder = function(orderId) {
    if (confirm("Clear this order record?")) {
        let orders = getOrders().filter(o => o.id !== orderId);
        localStorage.setItem('rn_orders', JSON.stringify(orders));
        renderDashboard();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    renderDashboard();
    document.querySelectorAll('.sidebar-nav .nav-item:not(.store-link)').forEach(item => {
        item.addEventListener('click', () => {
            const view = item.getAttribute('data-view');
            if (view) switchAdminView(view);
        });
    });
    const searchInput = document.getElementById('adminSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            catalogSearchQuery = e.target.value;
            renderDashboard();
            switchAdminView('catalog');
        });
    }
});

window.addEventListener('storage', () => { renderDashboard(); });
//setInterval(() => { renderDashboard(); }, 1500);