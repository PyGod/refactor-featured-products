class FeaturedProducts extends HTMLElement {
  constructor() {
    super();
    this.collectionHandle = this.loaded = false;
    this.products = [];
  }

  async connectedCallback() {
    if (this.loaded) return;
    this.loaded = true;
    await this.loadProducts();
    this.render();
    this.addAddToCartListeners();
  }

  async loadProducts() {
    if (!this.collectionHandle) {
      this.innerHTML = '<p>No collection selected.</p>';
      return;
    }

    try {
      const response = await fetch(
        `/collections/${this.collectionHandle}?view=featured-products`
      );
      const html = await response.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const products = doc.querySelectorAll('.featured-products__item');

      this.products = Array.from(products).map((item) => {
        return {
          title: item.querySelector('.featured-products__title').textContent,
          price: item.querySelector('.featured-products__price').textContent,
          url: item.querySelector('a').getAttribute('href'),
          imageUrl: item.querySelector('.featured-products__image img')
            ? item
                .querySelector('.featured-products__image img')
                .getAttribute('src')
            : '',
          variantId: item.querySelector('form')
            ? item.querySelector('form input[name="id"]').value
            : '',
        };
      });
    } catch (error) {
      console.error('Error fetching featured products:', error);
      this.innerHTML = '<p>Sorry, there was an error loading the products.</p>';
    }
  }

  render() {
    const container = document.getElementById(
      'featured-products-list-container'
    );
    if (container && this.products.length) {
      container.innerHTML = this.products
        .map((product) => {
          return `
          <article class="featured-products__item">
            ${
              product.imageUrl
                ? `<img src="${product.imageUrl}" class="featured-products__image" alt="${product.title}">`
                : ''
            }
            <h3 class="featured-products__title">
              <a href="${product.url}" class="featured-products__link">${
            product.title
          }</a>
            </h3>

            <!-- Цена товара внутри кнопки "Add to Cart" -->
            <form method="POST" action="/cart/add" class="featured-products__form">
              <input type="hidden" name="id" value="${product.variantId}">
              <button type="submit" class="featured-products__add-to-cart">
                Add to Cart - <span class="featured-products__price">${
                  product.price
                }</span>
              </button>
            </form>
          </article>
        `;
        })
        .join('');
    }
  }

  addAddToCartListeners() {
    const addToCartButtons = this.querySelectorAll(
      '.featured-products__add-to-cart'
    );
    addToCartButtons.forEach((button) => {
      button.addEventListener('click', this.handleAddToCart.bind(this)); // Убедитесь, что контекст правильный
    });
  }

  async handleAddToCart(event) {
    event.preventDefault();

    const form = event.target.closest('form');
    const formData = new FormData(form);

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      alert(`${data.title} was added to your cart`);

      this.updateCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('There was an error adding the item to the cart');
    }
  }

  async updateCart() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();

      console.log('Cart updated:', cart);

      const cartIcon = document.querySelector('.cart-icon__count');
      if (cartIcon) {
        cartIcon.textContent = cart.item_count;
      }

      const cartPopup = document.querySelector('.cart-popup');
      if (cartPopup) {
        cartPopup.style.display = 'flex';
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  }
}

if (!customElements.get('featured-products')) {
  customElements.define('featured-products', FeaturedProducts);
}
