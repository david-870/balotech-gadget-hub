# BaloTech Gadget Hub
A real-world e-commerce storefront for a physical gadget store in Nigeria. Customers can browse products across multiple categories, add items to their cart, and place orders directly via WhatsApp.

---

## Live Site
> Coming soon — will be updated once deployed.

---

## About
BaloTech Gadget Hub is a single-owner gadget retail store offering a wide range of devices including iPhones, Samsung phones, laptops, smartwatches, audio devices, accessories, and gaming equipment. This website serves as the online face of the physical store, allowing customers to browse available stock and reach out instantly to place orders.

---

## Features
- Browse products across 8 categories — iPhones, Samsung, Other Phones, Laptops, Watches, Audio, Accessories, and Gaming
- Live stock status on every product (In Stock / Out of Stock)
- Add to cart with quantity tracking
- Cart persists across pages using localStorage
- WhatsApp checkout — order summary is sent directly to the store's WhatsApp
- Admin mode — toggle stock availability without touching the code
- Toast notifications for cart actions
- Fully responsive design for mobile and desktop

---

## Tech Stack
- HTML5
- CSS3
- Vanilla JavaScript
- No frameworks or libraries — built from scratch

## Project Structure
```
balotech-gadget-hub/
├── index.html              # Homepage with hot deals
├── style.css               # Global styles
├── script.js               # Cart logic, admin mode, WhatsApp checkout
├── assets/
│   └── images/             # Product images (to be added)
└── pages/
    ├── iphones.html
    ├── samsung.html
    ├── other-phones.html
    ├── laptops.html
    ├── watches.html
    ├── audio.html
    ├── accessories.html
    └── gaming.html
```

## How to Run Locally
1. Clone the repository:

   ```bash
   git clone https://github.com/david-870/balotech-gadget-hub.git
   ```

2. Open the project folder in VS Code

3. Install the **Live Server** extension if you don't have it

4. Right-click `index.html` and select **Open with Live Server**

No installs, no dependencies — it runs straight in the browser.

## Admin Mode
The site includes a built-in admin toggle in the navigation bar. When enabled, a **Toggle Stock** button appears on every product card, allowing the store owner to mark items as in stock or out of stock. Changes are saved automatically and persist across page refreshes.

## Deployment
The site is deployed as a static site. Hosting is handled via **Netlify** with a custom domain purchased through a Nigerian domain registrar

## What I Learned
- Structuring a multi-page HTML/CSS/JS project from scratch
- Managing state across pages using localStorage
- Dynamic DOM manipulation with vanilla JavaScript
- Responsive design with CSS Grid and media queries
- Git version control and deploying a live site

---

## Author
Built by **David** for **BaloTech Gadget Hub**  
A real business project and a personal learning milestone.
