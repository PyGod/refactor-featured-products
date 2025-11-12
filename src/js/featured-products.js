class FeaturedProducts extends HTMLElement {
  constructor() {
    super();
    console.log('Constructor called');
  }

  connectedCallback() {
    console.log('Web Component connected');

    // Логируем весь объект dataset
    console.log('dataset:', this.dataset);

    // Пытаемся извлечь значение из data-collection
    this.collectionHandle = this.dataset.collection;
    console.log('Collection handle from dataset:', this.collectionHandle);

    if (this.collectionHandle) {
      this.render();
    } else {
      console.log('No collection handle provided!');
      this.innerHTML = '<p>No collection selected.</p>';
    }

    this.addEventListeners();
  }

  async render() {
    console.log('Fetching collection:', this.collectionHandle);

    const response = await fetch(
      `/collections/${this.collectionHandle}?view=featured-products`
    );
    const html = await response.text();
    console.log('Fetched HTML:', html);

    this.innerHTML = `
      <section class="featured-products">
        <h2 class="featured-products__title">Featured Products</h2>
        <div class="featured-products__list">${html}</div>
      </section>
    `;
  }

  addEventListeners() {
    // Предотвращаем повторную подписку на события
    if (this.eventListenerAdded) return;
    this.eventListenerAdded = true;

    this.addEventListener('click', async (event) => {
      if (event.target.matches('.featured-products__add-to-cart')) {
        const form = event.target.closest('form');
        const formData = new FormData(form);

        const res = await fetch('/cart/add.js', {
          method: 'POST',
          body: formData,
        });
        await res.json();

        if (window.Shopify && Shopify.theme && Shopify.theme.cart) {
          Shopify.theme.cart.open();
        }

        this.updateSection();
      }
    });
  }

  async updateSection() {
    const sectionId = this.dataset.sectionId;
    const res = await fetch(`/?sections=${sectionId}`);
    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const newSection = doc.querySelector(`[data-section-id="${sectionId}"]`);
    if (newSection && this.container) {
      this.container.innerHTML = newSection.querySelector(
        '.featured-products__list'
      ).innerHTML;
    }
  }
}

customElements.define('featured-products', FeaturedProducts);
