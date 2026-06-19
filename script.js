const WHATSAPP_NUMBER = "51934025057";

const cart = new Map();
const body = document.body;
const mobileNav = document.querySelector("#mobile-nav");
const menuToggle = document.querySelector("#menu-toggle");
const cartPanel = document.querySelector("#cart-panel");
const cartOverlay = document.querySelector("#cart-overlay");
const cartToggle = document.querySelector("#cart-toggle");
const cartClose = document.querySelector("#cart-close");
const cartItems = document.querySelector("#cart-items");
const cartCount = document.querySelector("#cart-count");
const cartTotal = document.querySelector("#cart-total");
const toast = document.querySelector("#toast");
const sendWhatsAppButton = document.querySelector("#send-whatsapp");
const generalWhatsAppLinks = document.querySelectorAll(".js-whatsapp-general");

const money = (value) => `S/ ${value.toFixed(2)}`;

function toggleMenu(forceOpen) {
  const nextState = typeof forceOpen === "boolean" ? forceOpen : !mobileNav.classList.contains("is-open");
  mobileNav.classList.toggle("is-open", nextState);
  menuToggle.setAttribute("aria-expanded", String(nextState));
}

function openCart() {
  cartPanel.classList.add("open");
  cartOverlay.classList.add("show");
  cartPanel.setAttribute("aria-hidden", "false");
  cartToggle.setAttribute("aria-expanded", "true");
  body.style.overflow = "hidden";
}

function closeCart() {
  cartPanel.classList.remove("open");
  cartOverlay.classList.remove("show");
  cartPanel.setAttribute("aria-hidden", "true");
  cartToggle.setAttribute("aria-expanded", "false");
  body.style.overflow = "";
}

function showToast(productName) {
  toast.textContent = `${productName} agregado`;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 1800);
}

function addProduct(name, price) {
  const currentProduct = cart.get(name);
  cart.set(name, {
    name,
    price,
    quantity: currentProduct ? currentProduct.quantity + 1 : 1
  });
  renderCart();
  showToast(name);
}

function changeQuantity(name, amount) {
  const product = cart.get(name);
  if (!product) return;

  product.quantity += amount;

  if (product.quantity <= 0) {
    cart.delete(name);
  }

  renderCart();
}

function removeProduct(name) {
  cart.delete(name);
  renderCart();
}

function getSummary() {
  const products = [...cart.values()];
  return {
    products,
    count: products.reduce((sum, item) => sum + item.quantity, 0),
    total: products.reduce((sum, item) => sum + item.price * item.quantity, 0)
  };
}

function renderEmptyCart() {
  cartItems.innerHTML = `
    <div class="empty-cart">
      <span>🥬</span>
      <p>Tu pedido está vacío.<br>Agrega algo delicioso.</p>
    </div>
  `;
}

function renderCart() {
  const { products, count, total } = getSummary();
  cartCount.textContent = String(count);
  cartTotal.textContent = money(total);

  if (!products.length) {
    renderEmptyCart();
    return;
  }

  cartItems.innerHTML = products.map((item) => `
    <article class="cart-item">
      <div>
        <h3>${item.name}</h3>
        <span class="cart-item-price">${money(item.price * item.quantity)}</span>
        <div class="qty-control">
          <button type="button" data-action="decrease" data-product="${item.name}" aria-label="Disminuir ${item.name}">−</button>
          <b>${item.quantity}</b>
          <button type="button" data-action="increase" data-product="${item.name}" aria-label="Aumentar ${item.name}">+</button>
          <small>${money(item.price)} c/u</small>
        </div>
      </div>
      <button class="remove-item" type="button" data-action="remove" data-product="${item.name}" aria-label="Eliminar ${item.name}">×</button>
    </article>
  `).join("");
}

function buildWhatsAppMessage() {
  const { products, total } = getSummary();

  if (!products.length) {
    return "Hola, quiero hacer un pedido en HEALTHY BURGERS.";
  }

  const lines = products.map((item) => {
    const subtotal = item.price * item.quantity;
    return `- ${item.name} | Cantidad: ${item.quantity} | Subtotal: ${money(subtotal)}`;
  });

  return [
    "Hola, quiero hacer un pedido en HEALTHY BURGERS:",
    "",
    ...lines,
    "",
    `Total: ${money(total)}`,
    "",
    "Quiero confirmar mi pedido."
  ].join("\n");
}

function openWhatsApp() {
  const message = encodeURIComponent(buildWhatsAppMessage());
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank", "noopener");
}

document.querySelectorAll(".add-btn").forEach((button) => {
  button.addEventListener("click", () => {
    addProduct(button.dataset.name, Number(button.dataset.price));
  });
});

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const { action, product } = button.dataset;

  if (action === "increase") changeQuantity(product, 1);
  if (action === "decrease") changeQuantity(product, -1);
  if (action === "remove") removeProduct(product);
});

menuToggle.addEventListener("click", () => toggleMenu());

mobileNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => toggleMenu(false));
});

cartToggle.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);
sendWhatsAppButton.addEventListener("click", openWhatsApp);

generalWhatsAppLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    openWhatsApp();
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    toggleMenu(false);
    closeCart();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth >= 1100) {
    toggleMenu(false);
  }
});

renderCart();
