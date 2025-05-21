const products = [
    {
        id: 1,
        name: "Classic White Sneakers",
        price: 79.99,
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=300",
        stock: 10
    },
    {
        id: 2,
        name: "Running Performance Shoes",
        price: 129.99,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300",
        stock: 8
    },
    {
        id: 3,
        name: "Casual Comfort Sneakers",
        price: 89.99,
        image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=300",
        stock: 12
    },
    {
        id: 4,
        name: "Sport Elite Trainers",
        price: 149.99,
        image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=300",
        stock: 5
    },
    {
        id: 5,
        name: "Urban Style Boots",
        price: 199.99,
        image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=300",
        stock: 7
    },
    {
        id: 6,
        name: "Hiking Adventure Boots",
        price: 169.99,
        image: "https://images.unsplash.com/photo-1606036525923-525fa3b35465?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        stock: 9
    }
];


let cart = [];
let darkMode = false;

// لتحديد العناصر الموجودة في الصفحة
const productsContainer = document.getElementById('products-container');
const cartSidebar = document.getElementById('cart-sidebar');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartHeaderCount = document.getElementById('cart-header-count');
const cartTotal = document.getElementById('cart-total-amount');
const searchInput = document.getElementById('search-input');
const themeToggle = document.getElementById('theme-toggle');
const cartToggle = document.getElementById('cart-toggle');
const closeCart = document.getElementById('close-cart');
const clearCart = document.getElementById('clear-cart');
const checkoutBtn = document.getElementById('checkout-btn');

// بحمع الفنكشن كلها في فنكنش واحد لبدأ الapp 
function init() {
    loadFromLocalStorage();
    renderProducts();
    updateCartUI();
    setupEventListeners();
}


function loadFromLocalStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }

    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
        darkMode = JSON.parse(savedTheme);
        updateTheme();
    }
}

// تخزين المعلومات
function saveToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
}


function renderProducts(filterText = '') {
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(filterText.toLowerCase())
    );

    productsContainer.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <p>In Stock: ${product.stock}</p>
                <button onclick="addToCart(${product.id})" 
                        ${product.stock === 0 ? 'disabled' : ''}>
                    ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </div>
    `).join('');
}


function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    cartTotal.textContent = `$${total.toFixed(2)}`;
    cartCount.textContent = totalItems;
    document.getElementById('nav-cart-count').textContent = totalItems;
    cartHeaderCount.textContent = `(${totalItems} ${totalItems === 1 ? 'item' : 'items'})`;

    cartItems.innerHTML = cart.map(item => {
        const product = products.find(p => p.id === item.id);
        const originalStock = product.stock + item.quantity;
        const isAtStockLimit = item.quantity >= originalStock || product.stock === 0;
        
        return `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)}</p>
                <div class="cart-item-quantity">
                    <button onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, 1)" ${isAtStockLimit ? 'disabled' : ''}>+</button>
                </div>
                ${isAtStockLimit ? '<small style="color: var(--secondary-color)">Max stock reached</small>' : ''}
            </div>
            <button onclick="removeFromCart(${item.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `}).join('');
}


function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const cartItem = cart.find(item => item.id === productId);
    const currentQuantity = cartItem ? cartItem.quantity : 0;
    const totalAvailableStock = product.stock + currentQuantity;

    if (product.stock > 0 && currentQuantity < totalAvailableStock) {
        if (cartItem) {
            cartItem.quantity++;
            product.stock--;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
            product.stock--;
        }

        updateCartUI();
        saveToLocalStorage();
        renderProducts(searchInput.value);
    }
}

function removeFromCart(productId) {
    const cartItemIndex = cart.findIndex(item => item.id === productId);
    const product = products.find(p => p.id === productId);

    if (cartItemIndex > -1) {
        product.stock += cart[cartItemIndex].quantity;
        cart.splice(cartItemIndex, 1);
        updateCartUI();
        saveToLocalStorage();
        renderProducts(searchInput.value);
    }
}

function updateQuantity(productId, delta) {
    const cartItem = cart.find(item => item.id === productId);
    const product = products.find(p => p.id === productId);

    if (cartItem) {
        const newQuantity = cartItem.quantity + delta;
        const originalStock = product.stock + cartItem.quantity; 

        if (delta > 0) {
            if (newQuantity <= originalStock && product.stock > 0) {
                cartItem.quantity = newQuantity;
                product.stock -= delta;
                updateCartUI();
                saveToLocalStorage();
                renderProducts(searchInput.value);
            }
        } 
    
        else if (delta < 0 && newQuantity > 0) {
            cartItem.quantity = newQuantity;
            product.stock -= delta; 
            updateCartUI();
            saveToLocalStorage();
            renderProducts(searchInput.value);
        }
    }
}

function clearAllItems() {
    // ترجيع الاغراض مت السلة
    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
            product.stock += item.quantity;
        }
    });
    
    
    cart = [];
    updateCartUI();
    saveToLocalStorage();
    renderProducts(searchInput.value);
}

// الوضع الليلي
function toggleTheme() {
    darkMode = !darkMode;
    updateTheme();
    saveToLocalStorage();
}

function updateTheme() {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    themeToggle.innerHTML = `<i class="fas fa-${darkMode ? 'sun' : 'moon'}"></i>`;
}


function setupEventListeners() {
    themeToggle.addEventListener('click', toggleTheme);
    
    cartToggle.addEventListener('click', () => {
        cartSidebar.classList.add('open');
    });

    closeCart.addEventListener('click', () => {
        cartSidebar.classList.remove('open');
    });

    clearCart.addEventListener('click', () => {
        if (cart.length > 0) {
            if (confirm('Are you sure you want to clear all items from your cart?')) {
                clearAllItems();
            }
        }
    });

    searchInput.addEventListener('input', (e) => {
        renderProducts(e.target.value);
    });
}


init();
