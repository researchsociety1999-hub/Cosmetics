/**
 * PACIFIC RADIANCE - Official Boutique Script
 * Core: Supabase Integration, Cart Drawer Logic, & Luxury UI Interactions
 */

// --- 1. CONFIGURATION ---
// Replace with your actual Supabase Project details
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_KEY = 'your-anon-public-key';
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// --- 2. BRAND DATA (Fallback from your Product Master Database) ---
const productsData = [
    {
        id: 1,
        name: "8888 Brightening Lotion",
        category: "Moisturizer",
        price: 45.00,
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
        tag: "Best Seller"
    },
    {
        id: 2,
        name: "Radiant Face Serum",
        category: "Treatment",
        price: 62.00,
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
        tag: "New Arrival"
    },
    {
        id: 3,
        name: "Herbal Argan Dye",
        category: "Hair Care",
        price: 28.00,
        image: "https://images.unsplash.com/photo-1527799822340-304cf6670e4c?auto=format&fit=crop&w=800&q=80",
        tag: "Natural"
    }
];

// --- 3. STATE MANAGEMENT ---
let cart = JSON.parse(localStorage.getItem('pacific_cart')) || [];
let liveProducts = [];

// --- 4. DOM ELEMENTS ---
const productsGrid = document.getElementById('productsGrid');
const cartCount = document.getElementById('cartCount');
const cartDrawer = document.getElementById('cartDrawer');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');
const navbar = document.getElementById('navbar');

// --- 5. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    initNavbarScroll();
    await loadStoreProducts();
    updateCartUI();
    setupEventListeners();
});

// --- 6. STORE LOGIC ---

async function loadStoreProducts() {
    if (!productsGrid) return;

    try {
        if (supabase) {
            const { data, error } = await supabase.from('products').select('*');
            if (error) throw error;
            liveProducts = data.length > 0 ? data : productsData;
        } else {
            liveProducts = productsData;
        }
    } catch (err) {
        console.warn("Supabase connection skipped. Loading local boutique data.");
        liveProducts = productsData;
    }

    renderProducts(liveProducts);
}

function renderProducts(products) {
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <span class="product-tag">${product.tag || 'Luxury'}</span>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">$${parseFloat(product.price).toFixed(2)}</p>
                <button class="btn-gold" style="width: 100%; margin-top: 1.5rem;" onclick="addToCart(${product.id})">
                    Add to Kit
                </button>
            </div>
        </div>
    `).join('');
}

// --- 7. CART SYSTEM ---

window.addToCart = (productId) => {
    const product = liveProducts.find(p => p.id === productId);
    const existing = cart.find(item => item.id === productId);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartUI();
    openCart();
};

window.removeFromCart = (productId) => {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
};

function updateCartUI() {
    // Update Badge
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) cartCount.textContent = totalQty;

    // Render Items
    if (cartItemsContainer) {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div style="text-align:center; padding: 4rem 0; opacity: 0.5;">
                    <p>Your glow kit is empty.</p>
                </div>`;
        } else {
            cartItemsContainer.innerHTML = cart.map(item => `
                <div class="cart-item" style="display:flex; gap:1.5rem; margin-bottom:2rem; align-items:center;">
                    <img src="${item.image}" width="70" height="90" style="object-fit:cover;">
                    <div style="flex:1">
                        <h4 style="font-family:var(--font-heading); font-size:1rem;">${item.name}</h4>
                        <p style="font-size:0.8rem; color:var(--gold)">$${item.price} x ${item.quantity}</p>
                    </div>
                    <button onclick="removeFromCart(${item.id})" style="background:none; border:none; cursor:pointer; font-size:1.2rem;">&times;</button>
                </div>
            `).join('');
        }
    }

    // Update Total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartTotalElement) cartTotalElement.textContent = `$${total.toFixed(2)}`;
}

function saveCart() {
    localStorage.setItem('pacific_cart', JSON.stringify(cart));
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

function setupEventListeners() {
    document.getElementById('cartBtn')?.addEventListener('click', openCart);
    document.getElementById('closeDrawer')?.addEventListener('click', closeCart);
    document.getElementById('drawerOverlay')?.addEventListener('click', closeCart);
}

function initNavbarScroll() {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}
