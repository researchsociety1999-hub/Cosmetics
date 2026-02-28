/**
 * ABC Cosmetics - Premium Script
 * Handling: Product Rendering, Cart Logic, Animations
 */

// --- PRODUCT DATA ---
const productsData = [
    {
        id: 1,
        name: "8888 Brightening Lotion",
        category: "Skincare",
        price: 24.99,
        badge: "Bestseller",
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 2,
        name: "Herbal Hair Dye w/ Argan Oil",
        category: "Hair Care",
        price: 18.99,
        badge: "Natural",
        image: "https://images.unsplash.com/photo-1527799822340-304cf6670e4c?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 3,
        name: "Radiant Face Serum",
        category: "Skincare",
        price: 32.50,
        badge: "New",
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 4,
        name: "Velvet Matte Lipstick",
        category: "Makeup",
        price: 15.00,
        badge: "Trending",
        image: "https://images.unsplash.com/photo-1586776977607-310e9c725c37?auto=format&fit=crop&w=800&q=80"
    }
];

// --- STATE MANAGEMENT ---
let cart = JSON.parse(localStorage.getItem('abc_cart')) || [];

// --- DOM ELEMENTS ---
const productsGrid = document.getElementById('productsGrid');
const cartCount = document.getElementById('cartCount');
const cartModal = document.getElementById('cartModal');
const cartBtn = document.getElementById('cartBtn');
const modalClose = document.getElementById('modalClose');
const modalOverlay = document.getElementById('modalOverlay');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');
const navbar = document.getElementById('navbar');

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartUI();
    initScrollEffects();
});

// --- CORE FUNCTIONS ---

function renderProducts() {
    if (!productsGrid) return;
    
    productsGrid.innerHTML = productsData.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                ${product.badge ? `<span class="product-tag">${product.badge}</span>` : ''}
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-footer">
                    <span class="product-price">$${product.price.toFixed(2)}</span>
                    <button class="btn-primary add-to-cart-btn" onclick="addToCart(${product.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

window.addToCart = (productId) => {
    const product = productsData.find(p => p.id === productId);
    const existing = cart.find(item => item.id === productId);
    
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCart();
    updateCartUI();
    showCart();
};

function saveCart() {
    localStorage.setItem('abc_cart', JSON.stringify(cart));
}

function updateCartUI() {
    // Update counter
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalCount;
    
    // Update list
    if (cartItemsContainer) {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-msg">Your cart is empty</p>';
        } else {
            cartItemsContainer.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" width="60">
                    <div class="item-info">
                        <h4>${item.name}</h4>
                        <p>$${item.price.toFixed(2)} x ${item.quantity}</p>
                    </div>
                    <button onclick="removeFromCart(${item.id})" class="remove-btn">✕</button>
                </div>
            `).join('');
        }
    }
    
    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartTotalElement) cartTotalElement.textContent = `$${total.toFixed(2)}`;
}

window.removeFromCart = (id) => {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
};

// --- UI EFFECTS ---

function showCart() {
    cartModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function hideCart() {
    cartModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

cartBtn.addEventListener('click', showCart);
modalClose.addEventListener('click', hideCart);
modalOverlay.addEventListener('click', hideCart);

function initScrollEffects() {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Add CSS for Cart Modal dynamically if not in styles.css
const style = document.createElement('style');
style.textContent = \`
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2000;
        visibility: hidden;
        opacity: 0;
        transition: all 0.4s ease;
    }
    .modal.active {
        visibility: visible;
        opacity: 1;
    }
    .modal-overlay {
        position: absolute;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        backdrop-filter: blur(5px);
    }
    .modal-content {
        position: absolute;
        right: -400px;
        top: 0;
        width: 400px;
        height: 100%;
        background: white;
        padding: 2rem;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        flex-direction: column;
    }
    .modal.active .modal-content {
        right: 0;
    }
    .cart-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem 0;
        border-bottom: 1px solid #eee;
    }
    .cart-item img { border-radius: 4px; }
    .item-info h4 { font-size: 0.9rem; margin-bottom: 2px; }
    .item-info p { font-size: 0.8rem; color: #666; }
    .remove-btn { background: none; border: none; cursor: pointer; color: #999; }
    .cart-items { flex: 1; overflow-y: auto; margin: 1.5rem 0; }
    .cart-footer { padding-top: 1.5rem; border-top: 1px solid #eee; }
    .cart-total { display: flex; justify-content: space-between; font-weight: 700; font-size: 1.2rem; margin-bottom: 1.5rem; }
    .btn-block { width: 100%; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; }
    .modal-close { background: none; border: none; font-size: 2rem; cursor: pointer; }
    
    .navbar.scrolled {
        height: 70px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.05);
    }
\`;
document.head.appendChild(style);
