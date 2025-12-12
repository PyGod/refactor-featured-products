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
    this.addToCartListeners();

    subscribe(PUB_SUB_EVENTS.cartUpdate, async (event) => {
      if (event.source === 'cart-items') {
        const variantId = Number(event.variantId);
        this.cartProductIds = this.cartProductIds.filter(
          (id) => id !== variantId
        );
        this.filterProducts();
        await this.updateSection();
      }
    });
  }

  async loadCart() {
    try {
      const response = await fetch(window.Shopify.routes.root + 'cart.js');
      const cartData = await response.json();
      this.cartProductIds = cartData.items.map((item) => item.variant_id);
    } catch (error) {
      console.error('Error loading cart:', error);
      this.cartProductIds = [];
    }
  }

  async updateSection() {
    try {
      const response = await fetch(`?section_id=${this.sectionId}`);
      const sectionHtml = await response.text();
      const parser = new DOMParser();
      const dom = parser.parseFromString(sectionHtml, 'text/html');
      const newSection = dom.querySelector('featured-products');

      if (newSection) this.innerHTML = newSection.innerHTML;

      this.filterProducts();
      this.addToCartListeners();
    } catch (err) {
      console.error('Error updating section:', err);
    }
  }

  filterProducts() {
    const items = this.querySelectorAll('.featured-products__item');
    items.forEach((item) => {
      const variantId = Number(item.dataset.variantId);
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
      button._handler = (event) => this.addToCart(event, button);
      button.addEventListener('click', button._handler);
    });
  }

  async addToCart(event, button) {
    event.preventDefault();
    const variantId = Number(button.dataset.variantId);

    if (!variantId || isNaN(variantId)) {
      console.error('Invalid variantId:');
      return;
    }

    button.disabled = true;
    button.classList.add('featured-products__button_loading');

    try {
      const response = await fetch(window.Shopify.routes.root + 'cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: variantId, quantity: 1 }),
      });

      const addedItem = await response.json();

      if (addedItem.variant_id && !this.cartProductIds.includes(variantId)) {
        this.cartProductIds.push(addedItem.variant_id);
      }

      await Promise.all([
        this.updateSection(),
        this.updateCartNotification(addedItem.variant_id),
        this.updateDrawer(),
      ]);

      this.filterProducts();
      this.updateCartIcon();
      this.openPopup();
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      button.disabled = false;
      button.classList.remove('featured-products__button_loading');
    }
  }

  updateCartIcon() {
    const cartIcon = document.querySelector('#cart-icon-bubble');
    if (!cartIcon) return;

    let bubble = cartIcon.querySelector('.cart-count-bubble');
    const itemCount = this.cartProductIds.length;

    if (itemCount > 0) {
      if (!bubble) {
        bubble = document.createElement('div');
        bubble.className = 'cart-count-bubble';
        const span = document.createElement('span');
        span.setAttribute('aria-hidden', 'true');
        span.textContent = itemCount;
        bubble.appendChild(span);
        cartIcon.appendChild(bubble);
      } else {
        const span = bubble.querySelector('span');
        if (span) {
          span.textContent = itemCount;
        }
      }
    } else if (bubble && itemCount === 0) {
      bubble.remove();
    }
  }

  async updateDrawer() {
    const response = await fetch(`?section_id=cart-drawer`);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const newDrawer = doc.querySelector('cart-drawer');
    const drawer = document.querySelector('cart-drawer');
    if (drawer && newDrawer) drawer.replaceWith(newDrawer);
  }

  openPopup() {
    const cartNotification = document.querySelector('cart-notification');

    if (cartNotification && typeof cartNotification.open === 'function') {
      cartNotification.open();
    }
  }

  async updateCartNotification(variantId) {
    const currentProduct = document.querySelector('#cart-notification-product');
    if (!currentProduct) return;

    currentProduct.innerHTML = '';

    try {
      const response = await fetch(`?section_id=cart-notification-product`);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const newProduct = doc.querySelector(
        '#shopify-section-cart-notification-product'
      );
      const cartItems = newProduct.querySelectorAll('.cart-item');
      const addedItem = Array.from(cartItems).find((item) => {
        const idAttr = item.id;
        if (!idAttr) return false;

        const match = idAttr.match(/cart-notification-product-(\d+):/);
        if (!match) return false;

        const itemVariantId = Number(match[1]);
        return itemVariantId === variantId;
      });

      if (addedItem) {
        currentProduct.appendChild(addedItem.cloneNode(true));
      }
    } catch (err) {
      console.error('Error updating cart notification:', err);
    }
  }
}

if (!customElements.get('featured-products')) {
  customElements.define('featured-products', FeaturedProducts);
}
