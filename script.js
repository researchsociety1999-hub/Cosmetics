/**
 * ABC Cosmetics - Premium Script
 * Handling: Supabase Integration, Product Rendering, Cart Logic
 */

// --- CONFIGURATION ---
// Replace these with your actual Supabase project details from the dashboard
const SUPABASE_URL = 'https://your-project-url.supabase.co';
const SUPABASE_KEY = 'your-anon-public-key';
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// --- FALLBACK DATA (Used if Supabase is empty or connecting) ---
const fallbackProducts = [
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
    }
];

// --- STATE MANAGEMENT ---
let cart = JSON.parse(localStorage.getItem('abc_cart')) || [];
let productsData = [];

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
document.addEventListener('DOMContentLoaded', async () => {
    await fetchProducts();
    updateCartUI();
    initScrollEffects();
});

// --- CORE FUNCTIONS ---

async function fetchProducts() {
    if (!productsGrid) return;
    
    try {
        // Try to fetch from Supabase
        if (supabase) {
            const { data, error } = await supabase
                .from('products')
                .select('*');
            
            if (error) throw error;
            productsData = data.length > 0 ? data : fallbackProducts;
        } else {
            productsData = fallbackProducts;
        }
    } catch (err) {
        console.warn("Supabase not connected, using fallback data.", err);
        productsData = fallbackProducts;
    }

    renderProducts(productsData);
}

function renderProducts(data) {
    productsGrid.innerHTML = data.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image_url || product.image}" alt="${product.name}" loading="lazy">
                ${product.badge ? `<span class="product-tag">${product.badge}</span>` : ''}
            </div>
            <div class="product-info">
                <span class="product-category">${product.category || 'Cosmetics'}</span>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-footer">
                    <span class="product-price">$${parseFloat(product.price).toFixed(2)}</span>
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
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) cartCount.textContent = totalCount;
    
    if (cartItemsContainer) {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart-state"><p>Your glow kit is empty.</p></div>';
        } else {
            cartItemsContainer.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image_url || item.image}" alt="${item.name}">
                    <div class="item-info">
                        <h4>${item.name}</h4>
                        <p>$${parseFloat(item.price).toFixed(2)} x ${item.quantity}</p>
                    </div>
                    <button onclick="removeFromCart(${item.id})" class="remove-btn" aria-label="Remove item">✕</button>
                </div>
            `).join('');
        }
    }
    
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
    document.body.style.overflow = 'hidden'; // Prevent scroll
}

function hideCart() {
    cartModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

if (cartBtn) cartBtn.addEventListener('click', showCart);
if (modalClose) modalClose.addEventListener('click', hideCart);
if (modalOverlay) modalOverlay.addEventListener('click', hideCart);

function initScrollEffects() {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}
