/**
 * PACIFIC RADIANCE - Official Boutique Script
 * Core: Supabase Integration, Cart Drawer Logic, & Luxury UI Interactions
 */

// --- 1. CONFIGURATION ---
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_KEY = 'your-anon-public-key';
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// --- 2. PRODUCT MASTER DATA (Mapped from your Pacific Radiance Sheets) ---
const fallbackProducts = [
    {
        id: 1,
        name: "8888 Brightening Lotion",
        category: "Moisturizer",
        price: 45.00,
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
        tag: "California Glow"
    },
    {
        id: 2,
        name: "Radiant Face Serum",
        category: "Treatment",
        price: 62.00,
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
        tag: "New Arrival"
    }
];

// --- 3. STATE ---
let cart = JSON.parse(localStorage.getItem('pacific_cart')) || [];
let liveProducts = [];

// --- 4. DOM ELEMENTS ---
const productsGrid = document.getElementById('productsGrid');
const cartCount = document.getElementById('cartCount');
const cartDrawer = document.getElementById('cartDrawer');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');

// --- 5. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    initLuxuryEffects();
    await fetchBoutiqueProducts();
    updateCartUI();
    bindEvents();
});

// --- 6. DATA FETCHING ---
async function fetchBoutiqueProducts() {
    if (!productsGrid) return;
    try {
        if (supabase) {
            const { data, error } = await supabase.from('products').select('*');
            if (error) throw error;
            liveProducts = data.length > 0 ? data : fallbackProducts;
        } else {
            liveProducts = fallbackProducts;
        }
    } catch (err) {
        liveProducts = fallbackProducts;
    }
    renderBoutique(liveProducts);
}

function renderBoutique(products) {
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <span class="product-tag">${product.tag || 'The Essentials'}</span>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">$${parseFloat(product.price).toFixed(2)}</p>
                <button class="btn-gold" style="width: 100%; margin-top: 2rem;" onclick="addToCart(${product.id})">
                    Add to Kit
                </button>
            </div>
        </div>
    `).join('');
}

// --- 7. CART LOGIC ---
window.addToCart = (productId) => {
    const product = liveProducts.find(p => p.id === productId);
    const existing = cart.find(item => item.id === productId);
    
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveAndUpdate();
    openCart();
};

window.removeFromCart = (id) => {
    cart = cart.filter(item => item.id !== id);
    saveAndUpdate();
};

function saveAndUpdate() {
    localStorage.setItem('pacific_cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) cartCount.textContent = totalQty;
    
    if (cartItemsContainer) {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `<div class="empty-state">Your kit is empty.</div>`;
        } else {
            cartItemsContainer.innerHTML = cart.map(item => `
                <div class="cart-item" style="display:flex; gap:1rem; margin-bottom:1.5rem; align-items:center;">
                    <img src="${item.image}" width="60" style="background:#f9f9f9;">
                    <div style="flex:1">
                        <h4 style="font-family:var(--font-heading); font-size:0.9rem;">${item.name}</h4>
                        <p style="font-size:0.8rem; color:var(--gold)">$${item.price} x ${item.quantity}</p>
                    </div>
                    <button onclick="removeFromCart(${item.id})" style="background:none; border:none; cursor:pointer;">&times;</button>
                </div>
            `).join('');
        }
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartTotalElement) cartTotalElement.textContent = `$${total.toFixed(2)}`;
}

// --- 8. UI INTERACTIONS ---
function openCart() {
    cartDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    cartDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

function bindEvents() {
    document.getElementById('cartBtn')?.addEventListener('click', openCart);
    document.getElementById('closeDrawer')?.addEventListener('click', closeCart);
    document.getElementById('drawerOverlay')?.addEventListener('click', closeCart);
}

function initLuxuryEffects() {
    // Smooth Navbar reveal on scroll
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('navbar');
        if (window.scrollY > 100) {
            nav.style.padding = "0.5rem 0";
            nav.style.boxShadow = "0 10px 30px rgba(0,0,0,0.02)";
        } else {
            nav.style.padding = "1rem 0";
            nav.style.boxShadow = "none";
        }
    });
}
