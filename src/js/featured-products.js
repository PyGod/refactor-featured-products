class FeaturedProducts extends HTMLElement {
  constructor() {
    super();
    this.collectionHandle = this.dataset.collection;
    this.loaded = false;
    this.cartProductIds =
      JSON.parse(localStorage.getItem('cartProductIds')) || [];
    this.isCartLoaded = false;
    this.isFirstRender = true;
  }

  async connectedCallback() {
    if (this.loaded) return;
    this.loaded = true;

    this.hideProducts();

    await this.loadCart();

    this.filterProducts();

    this.addAddToCartListeners();

    this.addCartPageListener();
  }

  async loadCart() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      this.cartProductIds = cart.items.map((item) => item.variant_id);
      localStorage.setItem(
        'cartProductIds',
        JSON.stringify(this.cartProductIds)
      );

      this.isCartLoaded = true;

      if (this.isFirstRender) {
        this.isFirstRender = false;
        this.showProducts();
      }

      this.updateCartIcon(cart);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  }

  hideProducts() {
    const productSection = document.querySelector('.featured-products__list');
    if (productSection) {
      productSection.style.display = 'none';
    }
  }

  showProducts() {
    const productSection = document.querySelector('.featured-products__list');
    if (productSection) {
      productSection.style.display = 'block';
    }
  }

  addAddToCartListeners() {
    debugger;

    document
      .querySelectorAll('.featured-products__add-to-cart')
      .forEach((button) => {
        button.addEventListener('click', (event) => {
          const variantId = button.getAttribute('data-variant-id');
          this.handleAddToCart(event, variantId);
        });
      });
  }

  async handleAddToCart(event, variantId) {
    event.preventDefault();

    if (!variantId) {
      alert('No variant selected!');
      return;
    }

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        body: JSON.stringify({ id: variantId, quantity: 1 }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      alert(`${data.title} was added to your cart`);

      this.cartProductIds.push(variantId);
      localStorage.setItem(
        'cartProductIds',
        JSON.stringify(this.cartProductIds)
      );

      await this.updateCart();

      this.removeAddedProductFromSection(variantId);

      // this.updateCartIconImmediately();
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('There was an issue adding the item to the cart');
    }
  }

  async updateCart() {
    debugger;
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      this.cartProductIds = cart.items.map((item) => item.variant_id);
      localStorage.setItem(
        'cartProductIds',
        JSON.stringify(this.cartProductIds)
      );

      this.updateCartIcon(cart);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  }

  // async updateCartIconImmediately() {
  //   try {
  //     const response = await fetch('/cart.js');
  //     const cart = await response.json();
  //     const cartIcon = document.querySelector('.cart-icon');
  //     if (cartIcon) {
  //       const cartItemCount = cartIcon.querySelector('sup');
  //       if (cartItemCount) {
  //         cartItemCount.textContent = cart.item_count;
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error fetching cart:', error);
  //   }
  // }

  updateCartIcon(cart) {
    const cartIcon = document.querySelector('#cart-icon-bubble');
    if (cartIcon) {
      let cartCountBubble = cartIcon.querySelector('.cart-count-bubble');
      if (cartCountBubble) {
        const itemCount = cartCountBubble.querySelector(
          'span[aria-hidden="true"]'
        );
        if (itemCount) {
          itemCount.textContent = cart.item_count;
        }
      } else if (cart.item_count > 0) {
        cartCountBubble = document.createElement('div');
        cartCountBubble.classList.add('cart-count-bubble');

        const countVisible = document.createElement('span');
        countVisible.setAttribute('aria-hidden', 'true');
        countVisible.textContent = cart.item_count;

        const countHidden = document.createElement('span');
        countHidden.classList.add('visually-hidden');
        countHidden.textContent = `${cart.item_count} items`;

        cartCountBubble.appendChild(countVisible);
        cartCountBubble.appendChild(countHidden);

        cartIcon.appendChild(cartCountBubble);
      }
    }
  }

  removeAddedProductFromSection(variantId) {
    const productElements = document.querySelectorAll(
      '.featured-products__item'
    );
    productElements.forEach((product) => {
      if (product.getAttribute('data-variant-id') === variantId.toString()) {
        product.style.display = 'none';
      }
    });
  }

  filterProducts() {
    if (!this.isCartLoaded) return;

    const productElements = document.querySelectorAll(
      '.featured-products__item'
    );
    productElements.forEach((product) => {
      const variantId = product.getAttribute('data-variant-id');
      if (this.cartProductIds.includes(parseInt(variantId))) {
        product.style.display = 'none';
      }
    });
  }

  addCartPageListener() {
    document
      .getElementById('cart-icon-bubble')
      .addEventListener('click', (event) => {
        event.preventDefault();
        this.showCartPage();
      });
  }

  async showCartPage() {
    try {
      const cartContent = document.querySelector('#content');
      if (cartContent) {
        const response = await fetch('/cart');
        const cartData = await response.text();
        cartContent.innerHTML = cartData;
      } else {
        window.location.href = '/cart';
      }
    } catch (error) {
      console.error('Error fetching cart page:', error);
    }
  }
}

if (!customElements.get('featured-products')) {
  customElements.define('featured-products', FeaturedProducts);
}
