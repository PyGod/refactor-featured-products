class FeaturedProducts extends HTMLElement {
  constructor() {
    super();
    this.collectionHandle = this.dataset.collection;
    this.loaded = false;
    this.cartProductIds = [];
    this.isCartLoaded = false;
    this.isFirstRender = true;
  }

  async connectedCallback() {
    if (this.loaded) return;
    this.loaded = true;

    this.hideProducts();
    await this.loadCart(); // Загружаем корзину с сервера
    this.filterProducts();
    this.addToCartListeners();
  }

  hideProducts() {
    const productSection = document.querySelector('.featured-products__list');
    if (productSection)
      productSection.classList.add('featured-products__list_hide');
  }

  showProducts() {
    const productSection = document.querySelector('.featured-products__list');
    if (productSection)
      productSection.classList.add('featured-products__list_show');
  }

  async fetchCart() {
    const response = await fetch('/cart.js');
    return await response.json();
  }

  async loadCart() {
    try {
      const cart = await this.fetchCart();
      this.cartProductIds = cart.items.map((item) => item.variant_id);
      this.isCartLoaded = true;

      if (this.isFirstRender) {
        this.isFirstRender = false;
        this.filterProducts();
        this.showProducts();
      }

      this.updateCartIcon(cart);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  }

  filterProducts() {
    if (!this.isCartLoaded) return;

    const productElements = document.querySelectorAll(
      '.featured-products__item'
    );
    productElements.forEach((product) => {
      const variantId = product.dataset.variantId;
      if (this.cartProductIds.includes(parseInt(variantId))) {
        product.classList.add('featured-products__item_hide');
      }
    });
  }

  addToCartListeners() {
    const buttons = document.querySelectorAll(
      '.featured-products__add-to-cart'
    );
    buttons.forEach((button) => {
      button.addEventListener('click', (event) =>
        this.handleAddToCart(event, button)
      );
    });
  }

  async handleAddToCart(event, button) {
    event.preventDefault();
    const variantId = button.dataset.variantId;

    if (!variantId) {
      alert('No variant selected!');
      return;
    }

    if (this.cartProductIds.includes(parseInt(variantId))) {
      button.disabled = true;
      return;
    }

    button.disabled = true;
    button.classList.add('loading');

    try {
      const addedCartItem = await this.addToCart(variantId);
      alert(`${addedItem.title} was added to your cart`);

      this.cartProductIds.push(addedItem.id);
      await this.updateCart();
      await this.updateDrawer();
      this.updateCartIcon(cart);
      this.removeAddedProductFromSection(variantId);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('There was an issue adding the item to the cart');
    } finally {
      button.disabled = false;
      button.classList.remove('loading');
    }
  }

  async addToCart(variantId) {
    const response = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: variantId, quantity: 1 }),
    });
    return await response.json();
  }

  // Новый метод: обновляем корзину и перерисовываем Drawer через Section Rendering API
  async updateCart() {
    try {
      // 1. Получаем текущее состояние корзины
      const cart = await this.fetchCart();
      this.cartProductIds = cart.items.map((item) => item.variant_id);
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  }

  async updateDrawerContent() {
    try {
      const response = await fetch(`${routes.cart_url}?section_id=cart-drawer`);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const cartDrawer = document.querySelector('cart-drawer');
      if (cartDrawer) {
        const newDrawerContent = doc.querySelector('cart-drawer');
        if (newDrawerContent) {
          cartDrawer.replaceWith(newDrawerContent);
        }
      }
    } catch {
      console.error('Error updating drawer:', error);
    }
  }

  updateCartIcon(cart) {
    const cartIcon = document.querySelector('#cart-icon-bubble');
    if (!cartIcon) return;

    let cartCountBubble = cartIcon.querySelector('.cart-count-bubble');
    if (cart.item_count > 0) {
      if (!cartCountBubble) {
        cartCountBubble = this.createCartCountBubble(cart.item_count);
        cartIcon.appendChild(cartCountBubble);
      } else {
        this.updateCartCount(cartCountBubble, cart.item_count);
      }
    } else if (cartCountBubble) {
      cartCountBubble.remove();
    }
  }

  createCartCountBubble(itemCount) {
    const cartCountBubble = document.createElement('div');
    cartCountBubble.classList.add('cart-count-bubble');

    const countVisible = document.createElement('span');
    countVisible.setAttribute('aria-hidden', 'true');
    countVisible.textContent = itemCount;

    const countHidden = document.createElement('span');
    countHidden.classList.add('visually-hidden');
    countHidden.textContent = `${itemCount} items`;

    cartCountBubble.append(countVisible, countHidden);
    return cartCountBubble;
  }

  updateCartCount(cartCountBubble, itemCount) {
    const itemCountVisible = cartCountBubble.querySelector(
      'span[aria-hidden="true"]'
    );
    const itemCountHidden = cartCountBubble.querySelector('.visually-hidden');

    if (itemCountVisible) itemCountVisible.textContent = itemCount;
    if (itemCountHidden) itemCountHidden.textContent = `${itemCount} items`;
  }

  removeAddedProductFromSection(variantId) {
    const productElements = document.querySelectorAll(
      '.featured-products__item'
    );
    productElements.forEach((product) => {
      if (product.dataset.variantId === variantId.toString()) {
        product.classList.add('featured-products__item_hide');
      }
    });
  }
}

if (!customElements.get('featured-products')) {
  customElements.define('featured-products', FeaturedProducts);
}
