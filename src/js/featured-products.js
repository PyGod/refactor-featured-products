class FeaturedProducts extends HTMLElement {
  constructor() {
    super();
    this.collectionHandle = this.dataset.collection;
    this.sectionId = this.dataset.sectionId;
    this.cartProductIds = [];
    this.loaded = false;
  }

  async connectedCallback() {
    if (this.loaded) return;
    this.loaded = true;

    await this.loadCart();

    this.initObserver();

    this.addToCartListeners();
  }

  async fetchCart() {
    const resp = await fetch('/cart.js');
    return resp.json();
  }

  async loadCart() {
    try {
      const cart = await this.fetchCart();
      this.cartProductIds = cart.items.map((item) => item.variant_id);

      await this.updateSection();
    } catch (err) {
      console.error(err);
    }
  }

  async updateSection() {
    try {
      const response = await fetch(`/?section_id=${this.sectionId}`);
      const sectionHtml = await response.text();
      const parser = new DOMParser();
      const dom = parser.parseFromString(sectionHtml, 'text/html');
      const newSection = dom.querySelector('featured-products');
      if (newSection) this.innerHTML = newSection.innerHTML;

      this.filterProducts();
      this.addToCartListeners();
    } catch (err) {
      console.error(err);
    }
  }

  filterProducts() {
    const items = this.querySelectorAll('.featured-products__item');
    items.forEach((item) => {
      const variantId = parseInt(item.dataset.variantId, 10);
      if (this.cartProductIds.includes(variantId)) {
        item.classList.add('featured-products__item_hidden');
      } else {
        item.classList.remove('featured-products__item_hidden');
      }
    });
  }

  addToCartListeners() {
    const buttons = this.querySelectorAll('.featured-products__button');
    buttons.forEach((button) => {
      button.removeEventListener('click', button._handler);
      button._handler = (e) => this.handleAddToCart(e, button);
      button.addEventListener('click', button._handler);
    });
  }

  async handleAddToCart(event, button) {
    event.preventDefault();
    const variantId = parseInt(button.dataset.variantId, 10);
    if (!variantId) return;

    button.disabled = true;
    button.textContent = 'Adding...';

    try {
      await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: variantId, quantity: 1 }),
      });

      this.cartProductIds.push(variantId);

      this.filterProducts();
      await this.updateCartIcon();
      await this.updateDrawer();
    } catch (err) {
      console.error(err);
    } finally {
      button.disabled = false;
      button.textContent = 'Add to Cart';
    }
  }

  async updateCartIcon() {
    const cartIcon = document.querySelector('#cart-icon-bubble');
    if (!cartIcon) return;

    let bubble = cartIcon.querySelector('.cart-count-bubble');
    const itemCount = this.cartProductIds.length;

    if (itemCount > 0) {
      if (!bubble) {
        bubble = document.createElement('div');
        bubble.className = 'cart-count-bubble';
        cartIcon.appendChild(bubble);
      }
      bubble.textContent = itemCount;
    } else if (bubble) {
      bubble.remove();
    }

    try {
      const response = await fetch(
        `${routes.cart_url}?section_id=cart-icon-bubble`
      );
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const serverBubble = doc.querySelector('.cart-count-bubble');

      if (serverBubble) {
        const currentBubble = cartIcon.querySelector('.cart-count-bubble');
        if (currentBubble) {
          currentBubble.replaceWith(serverBubble);
        } else {
          cartIcon.appendChild(serverBubble);
        }
      } else {
        const currentBubble = cartIcon.querySelector('.cart-count-bubble');
        if (currentBubble) currentBubble.remove();
      }
    } catch (err) {
      console.error(`Erro can't update cart icon from server`, err);
    }
  }

  async updateDrawer() {
    const response = await fetch(`${routes.cart_url}?section_id=cart-drawer`);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const newDrawer = doc.querySelector('cart-drawer');
    const drawer = document.querySelector('cart-drawer');
    if (drawer && newDrawer) drawer.replaceWith(newDrawer);
  }

  initObserver() {
    const observer = new MutationObserver(() => {
      this.filterProducts();
      this.addToCartListeners();
    });
    const list = this.querySelector('.featured-products__list');
    if (list) observer.observe(list, { childList: true, subtree: true });
  }
}

if (!customElements.get('featured-products')) {
  customElements.define('featured-products', FeaturedProducts);
}
