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
}
