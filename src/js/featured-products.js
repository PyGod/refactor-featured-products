class FeaturedProducts extends HTMLElement {
  constructor() {
    super();
    this.collectionHandle = this.dataset.collection;
    this.container = null;
  }

  connectedCallback() {
    this.render();
    this.container = this.querySelector('.featured-products__list');
    this.addEventListener();
  }

  async render() {
    const response = await fetch(
      `/collections/${this.collectionHandle}?view=featured-products`
    );
    const html = await response.text();
    this.innerHTML = `
      <section class="featured-products">
        <h2 class="featured-products__title">Featured Products</h2>
        <div class="featured-products__list">${html}</div>
      </section>
    `;
  }

  addEventListener() {
    this.addEventListener('click', async (event) => {
      if (event.target.matches('.featured-products__add-to-cart')) {
        const form = event.target.closest('form');
        const formData = new FormData(form);
      }
    });
  }
}
