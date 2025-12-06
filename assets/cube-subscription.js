class CubeSubscription extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.initSubscriptionBlocks();
    this.initVariantSelection();
    this.productDataEl = this.querySelector('script[data-product-json]');
    this.productData = JSON.parse(this.productDataEl.textContent);
    const cubeMedia = document.querySelector('cube-product-info cube-media-gallery')

    this.addEventListener("variant-change", (e) => {
      this.updateVariantDetails(e.detail.variantId, e.detail.group);
      cubeMedia.listenForVariantChange();
    });
  }

  initSubscriptionBlocks() {
    const blocks = this.querySelectorAll('.subscription-option');

    blocks.forEach(block => {
      const radio = block.querySelector('.subscription-input');
      if (!radio) return;

      block.addEventListener('click', (e) => {
        if (e.target.tagName.toLowerCase() === 'input') return;
        radio.checked = true;
        this.updateActiveSubscription(radio);
      });

      radio.addEventListener('change', () => {
        this.updateActiveSubscription(radio);
      });
    });
  }

  updateActiveSubscription(selectedRadio) {
    const blocks = this.querySelectorAll('.subscription-block');
    blocks.forEach(block => block.classList.remove('active'));

    const parentBlock = selectedRadio.closest('.subscription-block');
    parentBlock.classList.add('active');
  }

  initVariantSelection() {
    const containers = this.querySelectorAll('.variant-container');

    containers.forEach(container => {
      const radio = container.querySelector('.variant-radio');
      if (!radio) return;

      const groupName = radio.getAttribute("name");

      container.addEventListener('click', (e) => {
        if (e.target.tagName.toLowerCase() === 'input') return;
        radio.checked = true;
        this.updateActiveVariant(radio, groupName);
      });

      radio.addEventListener('change', () => {
        this.updateActiveVariant(radio, groupName);
      });
    });
  }

  updateActiveVariant(selectedRadio, group) {
    this.querySelectorAll(`input[name="${group}"]`)
      .forEach(r => r.closest('.variant-container').classList.remove('active'));

    selectedRadio.closest('.variant-container').classList.add('active');

    this.dispatchEvent(new CustomEvent("variant-change", {
      detail: {
        variantId: selectedRadio.value,
        group: group
      }
    }));
  }

  updateVariantDetails(variantId, group) {
    const parentBlock = this.querySelector('.subscription-block.active');
    if (!parentBlock) return;

    const variantData = this.productData.variants.find(v => v.id == variantId);

    this.updateVariantImage(parentBlock, variantData, group);
    this.updateVariantPrice(parentBlock, variantData, group);

    document.dispatchEvent(
      new CustomEvent("pdp-variant-media-change", {
        detail: { variant: variantData }
      })
    );
  }

  updateVariantImage(parentBlock, variantData, group) {
    if (!variantData?.featured_image) return;

    if (group.includes("single")) {
      const wrapper = parentBlock.querySelector('.frequency-selected-variant img');
      if (wrapper) {
        wrapper.src = variantData.featured_image.src;
        wrapper.alt = variantData.featured_image.alt || variantData.title;
      }
    }

    if (group.includes("double_1")) {
      const wrapper = parentBlock.querySelector('.variant_1_wrapper img');
      if (wrapper) {
        wrapper.src = variantData.featured_image.src;
        wrapper.alt = variantData.featured_image.alt || variantData.title;
      }
    }

    if (group.includes("double_2")) {
      const wrapper = parentBlock.querySelector('.variant_2_wrapper img');
      if (wrapper) {
        wrapper.src = variantData.featured_image.src;
        wrapper.alt = variantData.featured_image.alt || variantData.title;
      }
    }
  }

  updateVariantPrice(parentBlock, variantData, group) {
    const salePriceEl = parentBlock.querySelector('.price-item--sale');
    const comparePriceEl = parentBlock.querySelector('.price-item--regular');
    const priceContainer = parentBlock.querySelector('.price__container');

    if (!salePriceEl || !priceContainer) return;

    const price = variantData.price;
    const compareAt = variantData.compare_at_price;

    const subDiscountRaw = parseFloat(priceContainer.dataset.subscriptionValue || 0);
    const subDiscount = subDiscountRaw / 100;

    if (!subDiscount || !compareAt) {
      salePriceEl.textContent = this.formatMoney(price, 2);
      if (comparePriceEl) {
        comparePriceEl.style.display = compareAt > price ? "inline" : "none";
        if (compareAt > price)
          comparePriceEl.textContent = this.formatMoney(compareAt, 0);
      }
      return;
    }

    const isDouble = priceContainer.dataset.double_variant === "true";

    if (!isDouble) {
      const finalPrice = this.calculateSubscriptionPrice(price, compareAt, subDiscount);
      salePriceEl.textContent = this.formatMoney(finalPrice, 2);

      if (comparePriceEl) {
        comparePriceEl.style.display = compareAt > price ? "inline" : "none";
        if (compareAt > price)
          comparePriceEl.textContent = this.formatMoney(compareAt, 0);
      }
      return;
    }

    const variant1Radio = parentBlock.querySelector('input[name^="subscription_variant_double_1_"]:checked');
    const variant2Radio = parentBlock.querySelector('input[name^="subscription_variant_double_2_"]:checked');

    const v1 = this.productData.variants.find(v => v.id == variant1Radio?.value);
    const v2 = this.productData.variants.find(v => v.id == variant2Radio?.value);
    if (!v1 || !v2) return;

    const finalPrice1 = this.calculateSubscriptionPrice(v1.price, v1.compare_at_price, subDiscount);
    const finalPrice2 = this.calculateSubscriptionPrice(v2.price, v2.compare_at_price, subDiscount);

    const totalFinal = finalPrice1 + finalPrice2;
    const totalCompare = (v1.compare_at_price || 0) + (v2.compare_at_price || 0);

    salePriceEl.textContent = this.formatMoney(totalFinal, 2);

    if (comparePriceEl) {
      comparePriceEl.style.display = totalCompare > totalFinal ? "inline" : "none";
      if (totalCompare > totalFinal)
        comparePriceEl.textContent = this.formatMoney(totalCompare, 0);
    }
  }

  calculateSubscriptionPrice(price, compareAt, subDiscount) {
    if (!compareAt) return price;

    const subscriptionBaseDiscount = compareAt * subDiscount;
    const subscriptionPrice = compareAt - subscriptionBaseDiscount;

    const saleDifference = compareAt - price;
    const salePercent = saleDifference > 0 ? saleDifference / compareAt : 0;

    return subscriptionPrice - (subscriptionPrice * salePercent);
  }

  formatMoney(amount, trailingZeroes) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: Shopify.currency.active || "USD",
      currencyDisplay: "symbol",
      minimumFractionDigits: trailingZeroes
    }).format(amount / 100);
  }
}

customElements.define('cube-subscription', CubeSubscription);
