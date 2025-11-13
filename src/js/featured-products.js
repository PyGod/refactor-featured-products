class FeaturedProducts extends HTMLElement {
  constructor() {
    super();
    this.collectionHandle = this.dataset.collection; // Хендл коллекции
    this.loaded = false; // Флаг для отслеживания состояния загрузки
    this.products = []; // Массив для хранения товаров
  }

  // Когда компонент добавлен в DOM
  async connectedCallback() {
    if (this.loaded) return; // Если уже загружено, не делаем запрос повторно
    this.loaded = true; // Устанавливаем флаг, что компонент загружен
    await this.loadProducts(); // Загружаем данные один раз
    this.render(); // Рендерим коллекцию
    this.addAddToCartListeners(); // Добавляем обработчик для кнопок "Add to Cart"
  }

  // Загружаем продукты только один раз
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

      // Разбираем HTML в список товаров
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const products = doc.querySelectorAll('.featured-products__item');

      // Сохраняем данные о товарах
      this.products = Array.from(products).map((item) => {
        return {
          title: item.querySelector('.featured-products__title').textContent,
          price: item.querySelector('.featured-products__price').textContent,
          url: item.querySelector('a').getAttribute('href'),
          imageUrl: item.querySelector('.featured-products__image img')
            ? item
                .querySelector('.featured-products__image img')
                .getAttribute('src')
            : '', // Извлекаем ссылку на изображение
          variantId: item.querySelector('form')
            ? item.querySelector('form input[name="id"]').value
            : '', // Получаем ID товара для кнопки
        };
      });
    } catch (error) {
      console.error('Error fetching featured products:', error);
      this.innerHTML = '<p>Sorry, there was an error loading the products.</p>';
    }
  }

  // Рендеринг коллекции продуктов
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

  // Добавляем обработчики для кнопок "Add to Cart"
  addAddToCartListeners() {
    const addToCartButtons = this.querySelectorAll(
      '.featured-products__add-to-cart'
    );
    addToCartButtons.forEach((button) => {
      button.addEventListener('click', this.handleAddToCart.bind(this)); // Убедитесь, что контекст правильный
    });
  }

  // Обработчик добавления товара в корзину через AJAX
  async handleAddToCart(event) {
    event.preventDefault(); // Предотвращаем стандартное поведение

    const form = event.target.closest('form');
    const formData = new FormData(form);

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      // Уведомляем пользователя о том, что товар добавлен в корзину
      alert(`${data.title} was added to your cart`);

      // Обновляем корзину (если нужно)
      this.updateCart(); // В следующем шаге добавим логику для обновления корзины
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('There was an error adding the item to the cart');
    }
  }

  // Обновление поп-ап корзины (по необходимости)
  async updateCart() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();

      // Логика обновления pop-up корзины, например, обновление количества товаров в корзине
      console.log('Cart updated:', cart);

      // Обновляем отображение количества товаров в корзине
      const cartIcon = document.querySelector('.cart-icon__count');
      if (cartIcon) {
        cartIcon.textContent = cart.item_count; // Обновляем количество товаров в корзине
      }

      // Показываем поп-ап корзины (если он скрыт)
      const cartPopup = document.querySelector('.cart-popup');
      if (cartPopup) {
        cartPopup.style.display = 'flex';
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  }
}

// Проверка, зарегистрирован ли компонент уже
if (!customElements.get('featured-products')) {
  customElements.define('featured-products', FeaturedProducts);
}
