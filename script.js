const SUPABASE_URL = "https://your-project-id.supabase.co";
const SUPABASE_KEY = "your-anon-public-key";

const supabase =
  window.supabase && SUPABASE_URL !== "https://your-project-id.supabase.co"
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

const fallbackProducts = [
  {
    id: 1,
    name: "Celestial Glow Serum",
    category: "Serum",
    price: 68,
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80",
    tag: "Best Seller",
    description: "A brightening serum for a luminous, soft-focus finish."
  },
  {
    id: 2,
    name: "Moon Veil Cleanser",
    category: "Cleanser",
    price: 42,
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80",
    tag: "Daily Ritual",
    description: "A silky cleanser that removes buildup without stripping the skin."
  },
  {
    id: 3,
    name: "Golden Eclipse Mask",
    category: "Mask",
    price: 54,
    image:
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80",
    tag: "New",
    description: "A glow-enhancing mask for weekly reset and visible radiance."
  },
  {
    id: 4,
    name: "Noir Velvet Body Elixir",
    category: "Body",
    price: 58,
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80",
    tag: "Luxury Body",
    description: "A rich body elixir with a satin finish and sensual fragrance."
  },
  {
    id: 5,
    name: "Mystic Night Cream",
    category: "Skincare",
    price: 72,
    image:
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=900&q=80",
    tag: "Overnight",
    description: "An evening cream formulated for soft, deeply nourished skin."
  },
  {
    id: 6,
    name: "Midnight Renewal Set",
    category: "Set",
    price: 120,
    image:
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80",
    tag: "Featured",
    description: "A three-step ritual set designed for cleansing, treating, and restoring."
  }
];

let products = [];
let filteredProducts = [];
let cart = JSON.parse(localStorage.getItem("mystic_cart")) || [];
let promoDiscount = 0;

const productsGrid = document.getElementById("productsGrid");
const cartDrawer = document.getElementById("cartDrawer");
const drawerOverlay = document.getElementById("drawerOverlay");
const cartToggle = document.getElementById("cartToggle");
const closeCart = document.getElementById("closeCart");
const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const cartSubtotal = document.getElementById("cartSubtotal");
const cartDiscount = document.getElementById("cartDiscount");
const cartTotal = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const promoCodeInput = document.getElementById("promoCode");
const applyPromoBtn = document.getElementById("applyPromo");
const searchToggle = document.getElementById("searchToggle");
const searchModal = document.getElementById("searchModal");
const closeSearch = document.getElementById("closeSearch");
const modalSearchInput = document.getElementById("modalSearchInput");
const mobileToggle = document.getElementById("mobileToggle");
const navMenu = document.getElementById("navMenu");
const newsletterForm = document.getElementById("newsletterForm");

document.addEventListener("DOMContentLoaded", async () => {
  bindEvents();
  await loadProducts();
  renderProducts(products);
  updateCartUI();
  setupScrollButtons();
});

function bindEvents() {
  if (cartToggle) cartToggle.addEventListener("click", openCart);
  if (closeCart) closeCart.addEventListener("click", closeCartDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener("click", closeCartDrawer);

  if (searchInput) searchInput.addEventListener("input", applyFilters);
  if (categoryFilter) categoryFilter.addEventListener("change", applyFilters);

  if (applyPromoBtn) {
    applyPromoBtn.addEventListener("click", applyPromoCode);
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", handleCheckout);
  }

  if (searchToggle) {
    searchToggle.addEventListener("click", () => {
      searchModal.classList.add("active");
      searchModal.setAttribute("aria-hidden", "false");
      setTimeout(() => modalSearchInput?.focus(), 100);
    });
  }

  if (closeSearch) {
    closeSearch.addEventListener("click", closeSearchModal);
  }

  if (searchModal) {
    searchModal.addEventListener("click", (e) => {
      if (e.target === searchModal) closeSearchModal();
    });
  }

  if (modalSearchInput) {
    modalSearchInput.addEventListener("input", (e) => {
      if (searchInput) searchInput.value = e.target.value;
      applyFilters();
    });
  }

  if (mobileToggle) {
    mobileToggle.addEventListener("click", () => {
      navMenu.classList.toggle("open");
    });
  }

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("newsletterEmail")?.value.trim();
      if (!email) return;
      alert("Thanks for subscribing to Mystic.");
      newsletterForm.reset();
    });
  }

  document.addEventListener("click", (e) => {
    const addToCartBtn = e.target.closest("[data-add-to-cart]");
    const increaseBtn = e.target.closest("[data-increase]");
    const decreaseBtn = e.target.closest("[data-decrease]");
    const removeBtn = e.target.closest("[data-remove]");
    const wishlistBtn = e.target.closest("[data-wishlist]");

    if (addToCartBtn) {
      const id = Number(addToCartBtn.dataset.addToCart);
      addToCart(id);
    }

    if (increaseBtn) {
      const id = Number(increaseBtn.dataset.increase);
      changeQuantity(id, 1);
    }

    if (decreaseBtn) {
      const id = Number(decreaseBtn.dataset.decrease);
      changeQuantity(id, -1);
    }

    if (removeBtn) {
      const id = Number(removeBtn.dataset.remove);
      removeFromCart(id);
    }

    if (wishlistBtn) {
      alert("Wishlist is coming soon — thanks for your interest.");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeCartDrawer();
      closeSearchModal();
    }
  });
}

async function loadProducts() {
  try {
    if (supabase) {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      products = data?.length ? data : fallbackProducts;
    } else {
      products = fallbackProducts;
    }
  } catch (error) {
    products = fallbackProducts;
  }

  filteredProducts = [...products];
}

function renderProducts(list) {
  if (!productsGrid) return;

  if (!list.length) {
    productsGrid.innerHTML = `
      <div class="empty-cart">
        <p>No products found. Try another search or category.</p>
      </div>
    `;
    return;
  }

  productsGrid.innerHTML = list
    .map(
      (product) => `
      <article class="product-card">
        <div class="product-media">
          <img src="${product.image}" alt="${product.name}" />
          <span class="product-tag">${product.tag || "Mystic"}</span>
          <button class="icon-button wishlist-btn" data-wishlist="${product.id}" aria-label="Add to wishlist">♡</button>
        </div>
        <div class="product-body">
          <p class="product-category">${product.category}</p>
          <h3 class="product-title">${product.name}</h3>
          <p class="product-desc">${product.description || "Luxury beauty essential."}</p>
          <div class="product-bottom">
            <span class="product-price">$${Number(product.price).toFixed(2)}</span>
            <button class="btn btn-primary small-btn" data-add-to-cart="${product.id}">
              Add to Cart
            </button>
          </div>
        </div>
      </article>
    `
    )
    .join("");
}

function applyFilters() {
  const searchValue = (searchInput?.value || "").toLowerCase().trim();
  const selectedCategory = categoryFilter?.value || "all";

  filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchValue) ||
      product.category.toLowerCase().includes(searchValue) ||
      (product.description || "").toLowerCase().includes(searchValue);

    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  renderProducts(filteredProducts);
}

function addToCart(productId) {
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    const product = products.find((item) => item.id === productId);
    if (!product) return;

    cart.push({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.image,
      category: product.category,
      quantity: 1
    });
  }

  saveCart();
  updateCartUI();
  openCart();
}

function changeQuantity(productId, delta) {
  const item = cart.find((entry) => entry.id === productId);
  if (!item) return;

  item.quantity += delta;

  if (item.quantity <= 0) {
    cart = cart.filter((entry) => entry.id !== productId);
  }

  saveCart();
  updateCartUI();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem("mystic_cart", JSON.stringify(cart));
}

function updateCartUI() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCount) cartCount.textContent = count;

  if (!cartItems) return;

  if (!cart.length) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <p>Your cart is empty.</p>
        <p>Add a few Mystic essentials to begin your ritual.</p>
      </div>
    `;
  } else {
    cartItems.innerHTML = cart
      .map(
        (item) => `
        <article class="cart-item">
          <img src="${item.image}" alt="${item.name}" />
          <div>
            <h4>${item.name}</h4>
            <p>${item.category}</p>
            <p>$${item.price.toFixed(2)}</p>
            <div class="cart-item-controls">
              <button class="qty-btn" data-decrease="${item.id}">−</button>
              <span>${item.quantity}</span>
              <button class="qty-btn" data-increase="${item.id}">+</button>
              <button class="remove-btn" data-remove="${item.id}">Remove</button>
            </div>
          </div>
          <strong>$${(item.price * item.quantity).toFixed(2)}</strong>
        </article>
      `
      )
      .join("");
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = subtotal * promoDiscount;
  const total = subtotal - discountAmount;

  if (cartSubtotal) cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
  if (cartDiscount) cartDiscount.textContent = `-$${discountAmount.toFixed(2)}`;
  if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
}

function applyPromoCode() {
  const code = promoCodeInput?.value.trim().toUpperCase();

  if (code === "MYSTIC10") {
    promoDiscount = 0.1;
    alert("Promo code applied: 10% off");
  } else if (code === "GLOW15") {
    promoDiscount = 0.15;
    alert("Promo code applied: 15% off");
  } else {
    promoDiscount = 0;
    alert("Invalid promo code");
  }

  updateCartUI();
}

function handleCheckout() {
  if (!cart.length) {
    alert("Your cart is empty.");
    return;
  }

  alert(
    "Deprecated demo checkout. The real payment flow now lives in next-app and should be used instead of this static site.",
  );
}

function openCart() {
  cartDrawer.classList.add("active");
  cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCartDrawer() {
  cartDrawer.classList.remove("active");
  cartDrawer.setAttribute("aria-hidden", "true");
}

function closeSearchModal() {
  if (!searchModal) return;
  searchModal.classList.remove("active");
  searchModal.setAttribute("aria-hidden", "true");
}

function setupScrollButtons() {
  document.querySelectorAll("[data-scroll]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.querySelector(button.dataset.scroll);
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });
}
