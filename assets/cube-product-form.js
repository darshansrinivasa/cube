if (!customElements.get('cube-product-info')) {
    customElements.define(
      'cube-product-info',
      class CubeProductInfo extends HTMLElement {
        constructor() {
          super();
        }
  
        connectedCallback() {
          this.subscriptionEnabled = this.dataset?.subscriptionProduct === 'true';
          this.subscriptionDiscount = parseFloat(this.querySelector(".price__container")?.dataset.subscriptionValue || 0);
          this.subscriptionEl = this.querySelector('cube-subscription');
          this.addToCartBtn = this.querySelector('[data-add-to-cart]');
          
          this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
          this.errorMsgWrapper = this.querySelector('.product-form__error-message-wrapper');
          this.spinner = this.querySelector('.loading__spinner');
  
          if (this.addToCartBtn) {
            this.addToCartBtn.addEventListener('click', (e) => {
              e.preventDefault();
              this.handleAddToCart();
            });
          }
        }

        handleAddToCart() {
          const activeBlock = this.subscriptionEl?.querySelector('.subscription-block.active');
          if (!activeBlock) return;
  
          const priceContainer = activeBlock.querySelector('.price__container');
          const isDouble = priceContainer?.dataset.double_variant === "true";
  
          if (isDouble) {
            this.handleDouble(activeBlock);
          } else {
            this.handleSingle(activeBlock);
          }
        }
  
        handleSingle(activeBlock) {
          const variant = activeBlock.querySelector('.variant_wrapper input[type="radio"]:checked');
          if (!variant) {
            this.showError("Please select a flavour.");
            return;
          }
  
          const id = variant.value;
          this.addToCart([{ id }]);
        }
  
        handleDouble(activeBlock) {
          const variant1 = activeBlock.querySelector('input[name^="subscription_variant_double_1"]:checked');
          const variant2 = activeBlock.querySelector('input[name^="subscription_variant_double_2"]:checked');
  
          if (!variant1 || !variant2) {
            this.showError("Please select both flavours.");
            return;
          }
  
          const items = [
            { id: variant1.value },
            { id: variant2.value }
          ];
  
          this.addToCart(items, 'double');
        }

        addToCart(items, subscriptionType = 'single') {
          this.toggleLoading(true);
          this.hideError();
        
          const formData = new FormData();

          items.forEach((item, index) => {
            formData.append(`items[${index}][id]`, item.id);
            formData.append(`items[${index}][quantity]`, item.quantity || 1);

            if (this.subscriptionEnabled) {
              formData.append(`items[${index}][properties][is_subscription]`, 'true');
              formData.append(`items[${index}][properties][subscription_type]`, subscriptionType);
              formData.append(`items[${index}][properties][subscription_discount]`, this.subscriptionDiscount);
            } else {
              formData.append(`items[${index}][properties][is_subscription]`, 'false');
            }
            
          });
        
          if (this.cart) {
            const sections = this.cart.getSectionsToRender().map(s => s.id);
            formData.append('sections', sections);
            formData.append('sections_url', window.location.pathname);
          }
        
          fetch(`${window.Shopify.routes.root}cart/add.js`, {
            method: 'POST',
            headers: {
              'X-Requested-With': 'XMLHttpRequest'
            },
            body: formData
          })
            .then(r => r.json())
            .then(response => {
              if (response.status) {
                this.showError(response.description || "Unable to add to cart.");
                return;
              }
        
              // Update drawer + bubble using Dawn’s built-in system
              publish(PUB_SUB_EVENTS.cartUpdate, {
                source: 'cube-subscription',
                productVariantId: items[0].id,
                cartData: response
              });
        
              this.cart.renderContents(response);
            })
            .catch(err => {
              console.error(err);
              this.showError("Something went wrong.");
            })
            .finally(() => {
              if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
              this.toggleLoading(false);
            });
        }
  
        toggleLoading(isLoading) {
          if (!this.addToCartBtn) return;
  
          if (isLoading) {
            this.addToCartBtn.setAttribute("aria-disabled", true);
            this.addToCartBtn.classList.add("loading");
            this.spinner?.classList.remove('hidden');
          } else {
            this.addToCartBtn.removeAttribute("aria-disabled");
            this.addToCartBtn.classList.remove("loading");
            this.spinner?.classList.add('hidden');
          }
        }
  
        showError(msg) {
          if (!this.errorMsgWrapper) return;
          this.errorMsgWrapper.removeAttribute("hidden");
          this.errorMsgWrapper.querySelector(".product-form__error-message").textContent = msg;
        }
  
        hideError() {
          this.errorMsgWrapper?.setAttribute("hidden", true);
        }
      }
    );
  }
  