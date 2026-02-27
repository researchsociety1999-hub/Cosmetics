// ============================================
// PRODUCT DATA
// ============================================

const productsData = [
    {
        id: 1,
        name: "8888 Brightening Lotion",
        type: "Moisturizer/Cosmetic",
        description: "Glow Like Never Before. Daily brightening moisturizer powered by Glutathione + Vitamin C to gently fade dark spots and reveal radiant, even-toned skin. 350ml.",
        price: 24.99,
        badge: "Bestseller"
    },
    {
        id: 2,
        name: "Herbal Hair Dye w/ Argan Oil",
        type: "Hair Colorant/Cosmetic",
        description: "Natural Dark Brown Coverage That Cares. 3-in-1 herbal hair colorant that covers grays with rich dark brown while nourishing scalp + conditioning hair. 500ml.",
        price: 18.99,
        badge: "Natural"
    },
    {
        id: 3,
        name: "Snail Gluta Cream Day/Night",
        type: "Moisturizer/Cosmetic",
        description: "Ultimate Skin Reset Duo. K-beauty powered repair system. Snail mucin + Glutathione heal, brighten, and strengthen skin barrier. Day 20g + Night 50g Set.",
        price: 34.99,
        badge: "Premium"
    }
];

// ============================================
// CART MANAGEMENT
// ============================================

let cart = [];

function addToCart(productId) {
    const product = productsData.find(p => p.id === productId);
    
    if (product) {
        // Check if product already in cart
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }
        
        updateCartCount();
        showCartNotification(product.name);
        
        // Save cart to localStorage for persistence
        localStorage.setItem('pacificRadianceCart', JSON.stringify(cart));
    }
}

function updateCartCount() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.querySelector('.cart-count');
    
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
        
        // Add animation
        cartCountElement.style.transform = 'scale(1.3)';
        setTimeout(() => {
            cartCountElement.style.transform = 'scale(1)';
        }, 300);
    }
}

function showCartNotification(productName) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <span><strong>${productName}</strong> added to cart!</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        border-left: 4px solid #d4a59a;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ============================================
// PRODUCT RENDERING
// ============================================

function renderProducts() {
    const productsGrid = document.getElementById('products-grid');
    
    if (!productsGrid) {
        console.error('Products grid element not found');
        return;
    }
    
    // Clear existing content
    productsGrid.innerHTML = '';
    
    // Render each product
    productsData.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card fade-in-up';
    
    card.innerHTML = `
        <div class="product-image">
            <div class="product-image-placeholder">
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                    <rect x="25" y="15" width="50" height="70" rx="8" stroke="currentColor" stroke-width="2"/>
                    <rect x="30" y="25" width="40" height="8" fill="currentColor" opacity="0.3"/>
                    <rect x="30" y="38" width="40" height="8" fill="currentColor" opacity="0.3"/>
                    <rect x="30" y="51" width="30" height="8" fill="currentColor" opacity="0.3"/>
                    <circle cx="50" cy="70" r="8" fill="currentColor" opacity="0.5"/>
                </svg>
            </div>
            <span class="product-badge">${product.badge}</span>
        </div>
        <div class="product-info">
            <p class="product-type">${product.type}</p>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-footer">
                <span class="product-price">$${product.price.toFixed(2)}</span>
                <button class="add-to-cart" data-product-id="${product.id}">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"/>
                        <circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    Add to Cart
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// ============================================
// NAVIGATION
// ============================================

function initializeNavigation() {
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
        
        // Close mobile menu when clicking a link
        const navLinkItems = navLinks.querySelectorAll('a');
        navLinkItems.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            });
        });
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
            }
        });
    }
}

// ============================================
// FORM HANDLING
// ============================================

function initializeForms() {
    // Contact form
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');
            
            // Simulate form submission
            console.log('Contact form submitted:', { name, email, message });
            
            // Show success message
            alert(`Thank you, ${name}! We've received your message and will get back to you at ${email} soon.`);
            
            // Reset form
            contactForm.reset();
        });
    }
    
    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const email = emailInput.value;
            
            // Simulate newsletter subscription
            console.log('Newsletter subscription:', email);
            
            // Show success message
            alert(`Thank you for subscribing! We'll send beauty tips and exclusive offers to ${email}.`);
            
            // Reset form
            newsletterForm.reset();
        });
    }
}

// ============================================
// CART EVENT LISTENERS
// ============================================

function initializeCartListeners() {
    // Event delegation for dynamically added "Add to Cart" buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.add-to-cart')) {
            const button = e.target.closest('.add-to-cart');
            const productId = parseInt(button.getAttribute('data-product-id'));
            
            if (productId) {
                addToCart(productId);
            }
        }
    });
    
    // Cart button click (you can expand this to show a cart modal)
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Your cart is empty. Add some products to get started!');
            } else {
                // Generate cart summary
                let cartSummary = 'Your Cart:\n\n';
                let total = 0;
                
                cart.forEach(item => {
                    const itemTotal = item.price * item.quantity;
                    total += itemTotal;
                    cartSummary += `${item.name}\nQuantity: ${item.quantity} × $${item.price.toFixed(2)} = $${itemTotal.toFixed(2)}\n\n`;
                });
                
                cartSummary += `Total: $${total.toFixed(2)}`;
                
                alert(cartSummary);
            }
        });
    }
}

// ============================================
// INTERSECTION OBSERVER (ANIMATION ON SCROLL)
// ============================================

function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe product cards and sections
    document.querySelectorAll('.product-card, .about-content, .contact-content').forEach(el => {
        observer.observe(el);
    });
}

// ============================================
// LOAD CART FROM LOCALSTORAGE
// ============================================

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('pacificRadianceCart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            updateCartCount();
        } catch (e) {
            console.error('Error loading cart from localStorage:', e);
            cart = [];
        }
    }
}

// ============================================
// ADD NOTIFICATION STYLES
// ============================================

function addNotificationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
        
        .cart-notification svg {
            color: #d4a59a;
            flex-shrink: 0;
        }
        
        @media (max-width: 768px) {
            .cart-notification {
                right: 10px !important;
                left: 10px !important;
                max-width: calc(100% - 20px);
            }
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Pacific Radiance - Initializing...');
    
    // Load cart from localStorage
    loadCartFromStorage();
    
    // Render products
    renderProducts();
    
    // Initialize navigation
    initializeNavigation();
    
    // Initialize forms
    initializeForms();
    
    // Initialize cart listeners
    initializeCartListeners();
    
    // Initialize scroll animations
    initializeScrollAnimations();
    
    // Add notification styles
    addNotificationStyles();
    
    console.log('Pacific Radiance - Initialization complete!');
    console.log(`Loaded ${productsData.length} products`);
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Format currency
function formatCurrency(amount) {
    return `$${amount.toFixed(2)}`;
}

// Get cart total
function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Get cart item count
function getCartItemCount() {
    return cart.reduce((total, item) => total + item.quantity, 0);
}

// Clear cart
function clearCart() {
    cart = [];
    updateCartCount();
    localStorage.removeItem('pacificRadianceCart');
}

// Export functions for potential use in other scripts
window.PacificRadiance = {
    addToCart,
    cart,
    getCartTotal,
    getCartItemCount,
    clearCart,
    productsData
};
