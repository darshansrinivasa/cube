class CubeMediaGallery extends HTMLElement {
    constructor() {
      super();
    }
  
    connectedCallback() {
      this.gallery = this;
  
      this.mainSlides = this.querySelectorAll(".media-slide");
      this.thumbs = this.querySelectorAll(".media-thumb");
      this.dots = this.querySelectorAll(".media-dot");
      this.arrowLeft = this.querySelector(".media-arrow--left");
      this.arrowRight = this.querySelector(".media-arrow--right");
  
      if (!this.mainSlides.length) return;
  
      this.bindThumbClicks();
      this.bindArrowClicks();
      this.listenForVariantChange();
      this.setInitialIndex();
    }

    setInitialIndex() {
      const activeSlide = this.querySelector(".media-slide.active");
      if (activeSlide) {
        this.currentIndex = Array.from(this.mainSlides).indexOf(activeSlide);
      }
    }
  
    bindThumbClicks() {
      this.thumbs.forEach((thumb, index) => {
        thumb.addEventListener("click", () => {
          this.updateSlideByIndex(index);
        });
      });
    }

    bindArrowClicks() {
      if (this.arrowLeft) {
        this.arrowLeft.addEventListener("click", () => {
          this.goToPrevious();
        });
      }
  
      if (this.arrowRight) {
        this.arrowRight.addEventListener("click", () => {
          this.goToNext();
        });
      }
    }

    listenForVariantChange() {
      document.addEventListener("pdp-variant-media-change", (e) => {
        const variant = e.detail.variant;
        if (!variant?.featured_media?.id) return;
  
        const targetId = String(variant.featured_media.id);
  
        const index = Array.from(this.mainSlides).findIndex(
          slide => slide.dataset.mediaId === targetId
        );
  
        if (index !== -1) {
          this.updateSlideByIndex(index);
        }
      });
    }

    goToPrevious() {
      let newIndex = this.currentIndex - 1;
      if (newIndex < 0) newIndex = this.mainSlides.length - 1;
      this.updateSlideByIndex(newIndex);
    }
  
    goToNext() {
      let newIndex = this.currentIndex + 1;
      if (newIndex >= this.mainSlides.length) newIndex = 0;
      this.updateSlideByIndex(newIndex);
    }
  
    updateSlideByIndex(newIndex) {
      this.currentIndex = newIndex;
      const mediaId = this.mainSlides[newIndex].dataset.mediaId;
      this.updateActiveMedia(mediaId);
    }
    
    updateActiveMedia(mediaId) {
      if (!mediaId) return;
  
      this.mainSlides.forEach(slide => {
        slide.classList.toggle(
          "active",
          slide.dataset.mediaId === String(mediaId)
        );
      });
  
      this.thumbs.forEach(thumb => {
        thumb.classList.toggle(
          "active",
          thumb.dataset.mediaId === String(mediaId)
        );
      });
  
      this.dots?.forEach(dot => {
        dot.classList.toggle(
          "active",
          dot.dataset.mediaId === String(mediaId)
        );
      });
  
      this.currentIndex = Array.from(this.mainSlides).findIndex(
        slide => slide.dataset.mediaId === String(mediaId)
      );
    }
  }
  
  customElements.define("cube-media-gallery", CubeMediaGallery);
  