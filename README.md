# 🛒 Cube — Custom Shopify PDP (Subscription + Variant System)

This repository contains the completed machine-test assignment for **Cube**, implementing a fully custom **Shopify Product Detail Page (PDP)** with subscription logic, variant sync, dynamic media gallery, and metafield-driven configuration.

Everything is built using **Liquid, JavaScript, CSS, metafields, and Shopify AJAX APIs**—no external apps used.

---


## 🚀 Features Implemented

### ✅ 1. Subscription Module (Single & Double Drink)

A fully custom subscription selector:
- Single drink purchase  
- Double drink purchase (choose two flavours)  
- Active state UI  
- Frequency text from metafield  
- Subscription product flag from metafield

Dynamic updates on selection:
- Variant image  
- Price  
- Selected flavour thumbnails  

---

### ✅ 2. Custom Subscription Pricing Engine

Pricing logic implemented in **Liquid + JavaScript**.

1. Take subscription discount from metafield:  
   `product.metafields.custom.subscription_discount_value`

2. Apply on **compare-at price** (NOT selling price)

3. Then apply **sale discount**:  
   `(compare_at - price)`

4. For double drinks (two variants):
`Final Price = FinalPrice(variant1) + FinalPrice(variant2)`

PDP price and Cart price both match the exact logic.

---

### ✅ 3. Dynamic Variant Selection System

Works for:

- Single drink variant  
- Double drink flavour 1  
- Double drink flavour 2  

On selection:

- Price updates  
- Image updates  
- Media gallery highlights correct image  

Custom event triggered:

```js
document.dispatchEvent(new CustomEvent("pdp-variant-media-change", {
  detail: { variant: variantData }
}));
```

---

### ✅ 4. Dynamic Variant Selection System

A fully custom slider (NO plugins):
- Image slides
- Thumbnails
- Pagination dots
- Left/right arrows
- Highlight sync with variant image
- Smooth fade transitions
- Mobile responsive

---

### ✅ 5. Add to Cart (Single + Double)

Using Shopify’s AJAX API (/cart/add.js):

Single:
Adds 1 line item.

Double:
Adds 2 separate line items with properties:

```js
{
  "is_subscription": "true",
  "subscription_type": "double",
  "subscription_discount": "25"
}
```

#### Cart Drawer
- Opens automatically
- Updates cart count
- Rerenders sections
- Renders line item pricing correctly

---

### ✅ 6. Cart Page Custom Pricing

Cart page updated with:
- Subscription pricing
- Sale pricing
- Compare-at pricing
- Line price × quantity
A custom snippet is included inside each cart item for price recalculation.

---

### ✅ 7. Full Metafield Architecture

All dynamic values come from metafields:

| Feature                 | Metafield                            |
| ----------------------- | ------------------------------------ |
| Subscription enabled    | `custom.subscription_product`        |
| Subscription discount % | `custom.subscription_discount_value` |
| Frequency text          | `custom.subscription_frequency_text` |
| Ratings (stars)         | `custom.review_value`                |
| Total reviews           | `custom.total_reviews`               |
| What's Included list    | `custom.whats_included_list`         |


No hard-coded settings in the theme.

---

### ✅ 8. Mobile Responsive

Media gallery

Subscription blocks
- Variant selection
- Add to cart
- Pricing layout
All layouts tested and working.


## 🧠 Technical Architecture

File Structure 

```js
theme/
├─ assets/
│  ├─ cube-media-gallery.js
│  ├─ cube-subscription.js
│  └─ cube-product-form.js
│  ├─ cube-media-gallery.css
│  └─ cube-subscription.css
├─ snippets/
│  ├─ cube-price.liquid
│  ├─ cube-rating.liquid
│  ├─ cube-buy-buttons.liquid
│  ├─ cube-subscription.liquid
│  ├─ cube-cart-subscription-per-price.liquid
│  ├─ cube-cart-subscription-total-price.liquid
│  ├─ cube-cart-subscription-order-total-price.liquid
│  ├─ cube-media-gallery.liquid
│  ├─ cube-product-details.liquid
│  └─ cube-variant-media.liquid
├─ sections/
│  ├─ cube-product.liquid
└─ templates/
   └─ cube-product.json
```

Custom Elements Used

| Component              | Purpose                    |
| ---------------------- | -------------------------- |
| `<cube-subscription>`  | Handles subscription logic |
| `<cube-media-gallery>` | Handles the image slider   |
| `<cube-product-info>`  | Wraps PDP sections         |
| `<product-form>`       | Shopify's AJAX add-to-cart |


## 🧪 Testing Steps

- Open the product page
- Select Single/Double subscription
- Choose flavours
- Verify image + price update
- Add to cart
- Cart drawer should open
- Cart should show correct subscription pricing
- Go to cart page   `js base_url + /cart`
- Verify order total


## 📧 Contact

Developer: Darshan

Email: darshansrinivasa034@gmail.com







