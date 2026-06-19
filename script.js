const WHATSAPP_NUMBER = "51999123456";

const cart = new Map();
const cartPanel = document.querySelector("#cart-panel");
const cartOverlay = document.querySelector("#cart-overlay");
const cartToggle = document.querySelector("#cart-toggle");
const cartClose = document.querySelector("#cart-close");
const cartItems = document.querySelector("#cart-items");
const cartCount = document.querySelector("#cart-count");
const cartTotal = document.querySelector("#cart-total");
const toast = document.querySelector("#toast");

const money = (value) => `S/ ${value.toFixed(2)}`;

function openCart() {
  cartPanel.classList.add("open");
  cartOverlay.classList.add("show");
  cartPanel.setAttribute("aria-hidden", "false");
  cartToggle.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  cartPanel.classList.remove("open");
  cartOverlay.classList.remove("show");
  cartPanel.setAttribute("aria-hidden", "true");
  cartToggle.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}

function showToast(productName) {
  toast.textContent = `${productName} agregado`;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 1800);
}

function addProduct(name, price) {
  const product = cart.get(name);
  cart.set(name, {
    name,
    price,
    quantity: product ? product.quantity + 1 : 1
  });
  renderCart();
  showToast(name);
}

function changeQuantity(name, amount) {
  const product = cart.get(name);
  if (!product) return;
  product.quantity += amount;
  if (product.quantity <= 0) cart.delete(name);
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

function renderCart() {
  const { products, count, total } = getSummary();
  cartCount.textContent = count;
  cartTotal.textContent = money(total);

  if (!products.length) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <span>🥬</span>
        <p>Tu pedido está vacío.<br>Agrega algo delicioso.</p>
      </div>`;
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
    return "¡Hola! Quisiera conocer más sobre su catálogo de comida saludable.";
  }

  const lines = products.map((item) =>
    `• ${item.quantity} x ${item.name} — ${money(item.quantity * item.price)}`
  );

  return [
    "¡Hola! 👋 Quiero realizar el siguiente pedido:",
    "",
    ...lines,
    "",
    `*Total: ${money(total)}*`,
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

cartToggle.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);
document.querySelector("#send-whatsapp").addEventListener("click", openWhatsApp);
document.querySelectorAll(".js-whatsapp-general").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    openWhatsApp();
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeCart();
});

const qrImage = document.querySelector("#catalog-qr");
const catalogUrl = window.location.protocol === "file:"
  ? "https://tu-catalogo.netlify.app"
  : window.location.href.split("#")[0];
qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=5&data=${encodeURIComponent(catalogUrl)}`;

renderCart();
