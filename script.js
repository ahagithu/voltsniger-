// ===== CONFIGURATION =====
const CONFIG = {
  whatsappNumbers: {
    primary: '22793033158',
    secondary: '22789631595'
  },
  currency: 'FCFA',
  freeShippingThreshold: 10000,
  shippingCost: 2000
};

// ===== ÉTAT GLOBAL =====
let allProducts = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentPage = '';

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', function() {
  // Détecter la page actuelle
  currentPage = document.documentElement.dataset.page || '';
  
  // Charger les composants partagés
  loadSharedComponents();
  
  // Initialiser le menu mobile
  initMobileMenu();
  
  // Mettre à jour le compteur panier
  updateCartCount();
  
  // Exécuter les fonctions spécifiques à la page
  switch(currentPage) {
    case 'index':
      loadProducts('featured-products', 6);
      break;
    case 'produits':
      loadProducts('products-container');
      initFilters();
      break;
    case 'contact':
      initContactForm();
      break;
    case 'panier':
      loadCart();
      break;
    case 'produit':
      loadProductDetail();
      break;
  }
});

// ===== FONCTIONS PARTAGÉES =====

// Charger les composants partagés
// ===== CHARGEMENT DES COMPOSANTS PARTAGÉS =====
async function loadSharedComponents() {
  try {
    // Charger le fichier shared.html
    const response = await fetch('shared.html');
    const html = await response.text();
    
    // Créer un élément temporaire pour parser le HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Extraire et insérer le header
    const headerTemplate = tempDiv.querySelector('#site-header');
    if (headerTemplate) {
      const header = headerTemplate.content.cloneNode(true);
      document.body.insertBefore(header, document.body.firstChild);
    }
    
    // Extraire et insérer le footer
    const footerTemplate = tempDiv.querySelector('#site-footer');
    if (footerTemplate) {
      const footer = footerTemplate.content.cloneNode(true);
      document.body.appendChild(footer);
    }
    
    // Mettre en surbrillance le lien actif dans le menu
    const activeNav = document.querySelector(`.nav-${currentPage}`);
    if (activeNav) {
      activeNav.classList.add('active');
    }
    
  } catch (error) {
    console.error('Erreur de chargement des composants partagés:', error);
    // Fallback: créer un header/footer basique
    createFallbackComponents();
  }
}

// Fallback si le fichier shared.html n'est pas trouvé
function createFallbackComponents() {
  // Header fallback
  const header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML = `
    <div class="container header-inner">
      <a href="index.html" class="logo">
        <i class="fas fa-bolt"></i>
        <span>Volts<span style="color: #f59e0b;">Niger</span></span>
      </a>
      
      <button class="menu-toggle">
        <i class="fas fa-bars"></i>
      </button>
      
      <nav class="site-nav">
        <a href="index.html" class="nav-home"><i class="fas fa-home"></i> Accueil</a>
        <a href="produits.html" class="nav-produits"><i class="fas fa-shopping-bag"></i> Produits</a>
        <a href="contact.html" class="nav-contact"><i class="fas fa-envelope"></i> Contact</a>
        <a href="panier.html" class="cart-link nav-panier">
          <i class="fas fa-shopping-cart"></i> Panier
          <span class="cart-count">0</span>
        </a>
      </nav>
    </div>
  `;
  document.body.insertBefore(header, document.body.firstChild);
  
  // Footer fallback
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <h4>VoltsNiger</h4>
          <p>Votre boutique électronique à Niamey depuis 2023.</p>
          <div class="social">
            <a href="https://wa.me/22793033158" target="_blank"><i class="fab fa-whatsapp"></i></a>
            <a href="#"><i class="fab fa-facebook"></i></a>
            <a href="#"><i class="fab fa-instagram"></i></a>
          </div>
        </div>
        <div class="footer-col">
          <h4>Liens</h4>
          <a href="index.html">Accueil</a>
          <a href="produits.html">Produits</a>
          <a href="panier.html">Panier</a>
          <a href="contact.html">Contact</a>
        </div>
        <div class="footer-col">
          <h4>Contact</h4>
          <p><i class="fas fa-map-marker"></i> Niamey, Niger</p>
          <p><i class="fas fa-phone"></i> +227 93 03 31 58</p>
          <p><i class="fas fa-phone"></i> +227 89 63 15 95</p>
          <p><i class="fas fa-envelope"></i> voltsniger@gmail.com</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2024 VoltsNiger. Tous droits réservés.</p>
      </div>
    </div>
  `;
  document.body.appendChild(footer);
}
// ===== GESTION DES PRODUITS =====

// Charger tous les produits
async function loadProducts(containerId = null, limit = null) {
  try {
    const response = await fetch('produits.json');
    const data = await response.json();
    allProducts = data.produits;
    
    // Ajuster les stocks si nécessaire
    await adjustStockIfNeeded();
    
    if (containerId) {
      if (currentPage === 'produits') {
        displayProductsWithFilters(containerId, allProducts);
      } else {
        displayProducts(containerId, allProducts, limit);
      }
    }
    
  } catch (error) {
    console.error('Erreur de chargement des produits:', error);
    showError('Impossible de charger les produits');
  }
}

// Afficher les produits (version simple)
function displayProducts(containerId, products, limit = null) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  let productsToShow = limit ? products.slice(0, limit) : products;
  
  if (productsToShow.length === 0) {
    container.innerHTML = '<p class="text-center">Aucun produit trouvé.</p>';
    return;
  }
  
  container.innerHTML = productsToShow.map(product => createProductCard(product)).join('');
}

// Afficher les produits avec filtres (page produits)
function displayProductsWithFilters(containerId, products) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = products.map(product => createProductCard(product)).join('');
}

// Créer une carte produit
function createProductCard(product) {
  // Badges
  const badges = [];
  if (product.nouveau) badges.push('<span class="badge badge-new">Nouveau</span>');
  if (product.enPromotion) badges.push('<span class="badge badge-sale">Promo</span>');
  if (product.stock < 5 && product.stock > 0) badges.push('<span class="badge badge-stock">Stock limité</span>');
  
  // État du stock
  let stockText, stockClass, stockIcon, disabled = '';
  if (product.stock > 10) {
    stockText = 'En stock';
    stockClass = '';
    stockIcon = 'check';
  } else if (product.stock > 0) {
    stockText = `${product.stock} restant(s)`;
    stockClass = 'stock-low';
    stockIcon = 'check';
  } else {
    stockText = 'Rupture de stock';
    stockClass = 'stock-out';
    stockIcon = 'times';
    disabled = 'disabled';
  }
  
  return `
    <div class="product-card" data-category="${product.categorie}">
      ${badges.length > 0 ? `<div class="product-badges">${badges.join('')}</div>` : ''}
      
      ${product.stock > 0 ? `
        <div class="whatsapp-badge">
          <i class="fab fa-whatsapp"></i> Commande rapide
        </div>
      ` : ''}
      
      <img src="${product.images[0]}" alt="${product.nom}" class="product-image" loading="lazy">
      
      <div class="product-info">
        <span class="product-category">${getCategoryName(product.categorie)}</span>
        <h3 class="product-title">${product.nom}</h3>
        <p class="product-description">${product.description}</p>
        
        <div class="product-price">${product.prix.toLocaleString()} ${product.devise}</div>
        
        <div class="product-stock ${stockClass}">
          <i class="fas fa-${stockIcon}"></i> ${stockText}
        </div>
        
        <div class="product-actions">
          <button class="btn btn-whatsapp-product" onclick="orderWhatsAppProduct('${product.id}')" ${disabled}>
            <i class="fab fa-whatsapp"></i> COMMANDER WHATSAPP
          </button>
          
          <button class="btn btn-primary" onclick="addToCart('${product.id}')" ${disabled}>
            <i class="fas fa-cart-plus"></i> Panier
          </button>
          
          <a href="produit.html?id=${product.id}" class="btn btn-details">
            <i class="fas fa-eye"></i> Détails
          </a>
        </div>
        
        ${product.stock > 0 ? `
          <div class="quick-order-notice">
            <i class="fas fa-bolt"></i> Livraison rapide sous 24h
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// Obtenir le nom de la catégorie
function getCategoryName(categoryId) {
  const categories = {
    'microcontroleurs': 'Microcontrôleurs',
    'communication': 'Communication',
    'capteurs': 'Capteurs',
    'moteurs': 'Moteurs',
    'alimentation': 'Alimentation',
    'accessoires': 'Accessoires'
  };
  return categories[categoryId] || categoryId;
}

// ===== FILTRES (page produits) =====
function initFilters() {
  // Recherche
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      const searchTerm = e.target.value.toLowerCase();
      filterProducts(searchTerm);
    });
  }
  
  // Filtres par catégorie
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      const category = this.dataset.category;
      filterProducts('', category);
    });
  });
}

function filterProducts(searchTerm = '', category = 'all') {
  let filteredProducts = allProducts;
  
  if (category !== 'all') {
    filteredProducts = filteredProducts.filter(product => product.categorie === category);
  }
  
  if (searchTerm) {
    filteredProducts = filteredProducts.filter(product => 
      product.nom.toLowerCase().includes(searchTerm) || 
      product.description.toLowerCase().includes(searchTerm)
    );
  }
  
  displayProductsWithFilters('products-container', filteredProducts);
}

// ===== GESTION DU PANIER =====
function addToCart(productId, quantity = 1) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) {
    showNotification('Produit non trouvé', 'error');
    return;
  }
  
  if (product.stock === 0) {
    showNotification('Produit en rupture de stock', 'error');
    return;
  }
  
  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    existingItem.quantity = (existingItem.quantity || 1) + quantity;
  } else {
    cart.push({
      id: productId,
      nom: product.nom,
      prix: product.prix,
      image: product.images[0],
      quantity: quantity
    });
  }
  
  saveCart();
  showNotification(`${product.nom} ajouté au panier`);
}

function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = totalItems;
    el.style.display = totalItems > 0 ? 'inline' : 'none';
  });
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

// ===== COMMANDE WHATSAPP =====
function orderWhatsAppProduct(productId) {
  const product = allProducts.find(p => p.id === productId);
  
  if (!product) {
    showNotification('Produit non trouvé', 'error');
    return;
  }
  
  if (product.stock === 0) {
    showNotification('Produit en rupture de stock', 'error');
    return;
  }
  
  const phoneNumber = CONFIG.whatsappNumbers.primary;
  const message = encodeURIComponent(
    `🚀 **NOUVELLE COMMANDE VOLTSNIGER**\n\n` +
    `👤 Client: [VOTRE NOM]\n` +
    `📱 Téléphone: [VOTRE TÉLÉPHONE]\n` +
    `📍 Adresse: [VOTRE ADRESSE]\n\n` +
    `📦 **PRODUIT COMMANDÉ:**\n` +
    `➤ ${product.nom}\n` +
    `💰 Prix: ${product.prix.toLocaleString()} ${product.devise}\n` +
    `🔢 Quantité: 1\n` +
    `📝 Référence: ${product.id}\n\n` +
    `💳 **MODE DE PAIEMENT PRÉFÉRÉ:**\n` +
    `[ ] Orange Money\n` +
    `[ ] Moov Money\n` +
    `[ ] Espèces à la livraison\n\n` +
    `✅ Merci de confirmer la disponibilité et le délai de livraison.`
  );
  
  window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  
  showNotification(`Commande WhatsApp envoyée pour ${product.nom}`);
}

// ===== NOTIFICATIONS =====
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ===== GESTION DU STOCK =====
async function adjustStockIfNeeded() {
  try {
    const stockResponse = await fetch('stock-manager.json');
    const stockData = await stockResponse.json();
    
    // Mettre à jour les stocks si le fichier existe
    if (stockData.override) {
      allProducts.forEach(product => {
        const stockItem = stockData.stocks.find(s => s.id === product.id);
        if (stockItem) {
          product.stock = stockItem.quantity;
        }
      });
    }
  } catch (error) {
    // Fichier stock-manager.json n'existe pas ou erreur de lecture
    console.log('Gestionnaire de stock non configuré');
  }
}

// ===== FONCTIONS POUR PAGE PANIER =====
function loadCart() {
  if (!document.getElementById('cart-items')) return;
  
  displayCart();
}

function displayCart() {
  const container = document.getElementById('cart-items');
  const summary = document.getElementById('cart-summary');
  
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart"></i>
        <h3>Votre panier est vide</h3>
        <a href="produits.html" class="btn btn-primary">
          <i class="fas fa-shopping-bag"></i> Découvrir nos produits
        </a>
      </div>
    `;
    if (summary) summary.innerHTML = '';
    return;
  }
  
  let subtotal = 0;
  container.innerHTML = cart.map((item, index) => {
    const product = allProducts.find(p => p.id === item.id) || item;
    const itemTotal = (product.prix || item.prix) * (item.quantity || 1);
    subtotal += itemTotal;
    
    return `
      <div class="cart-item">
        <img src="${product.images?.[0] || item.image}" alt="${product.nom}" class="cart-item-image">
        <div class="cart-item-info">
          <h4>${product.nom || item.nom}</h4>
          <div class="cart-item-price">${(product.prix || item.prix).toLocaleString()} FCFA</div>
        </div>
        <div class="quantity-control">
          <button class="quantity-btn" onclick="updateCartItem(${index}, ${(item.quantity || 1) - 1})">-</button>
          <input type="number" value="${item.quantity || 1}" min="1" 
                 onchange="updateCartItem(${index}, parseInt(this.value))">
          <button class="quantity-btn" onclick="updateCartItem(${index}, ${(item.quantity || 1) + 1})">+</button>
        </div>
        <div class="cart-item-total">${itemTotal.toLocaleString()} FCFA</div>
        <button class="remove-btn" onclick="removeFromCart(${index})">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
  }).join('');
  
  if (summary) {
    const shipping = subtotal > CONFIG.freeShippingThreshold ? 0 : CONFIG.shippingCost;
    const total = subtotal + shipping;
    
    summary.innerHTML = `
      <div class="summary-row">
        <span>Sous-total</span>
        <span>${subtotal.toLocaleString()} FCFA</span>
      </div>
      <div class="summary-row">
        <span>Livraison</span>
        <span>${shipping === 0 ? 'Gratuite' : shipping.toLocaleString() + ' FCFA'}</span>
      </div>
      <div class="summary-row total">
        <span>Total</span>
        <span>${total.toLocaleString()} FCFA</span>
      </div>
      <button onclick="checkoutWhatsApp()" class="btn btn-primary btn-full">
        <i class="fab fa-whatsapp"></i> Commander sur WhatsApp
      </button>
    `;
  }
}

function updateCartItem(index, newQuantity) {
  if (newQuantity < 1) {
    removeFromCart(index);
    return;
  }
  
  const item = cart[index];
  const product = allProducts.find(p => p.id === item.id);
  
  if (product && product.stock && newQuantity > product.stock) {
    showNotification(`Stock insuffisant. Maximum: ${product.stock}`, 'error');
    return;
  }
  
  cart[index].quantity = newQuantity;
  saveCart();
  displayCart();
  showNotification('Quantité mise à jour');
}

function removeFromCart(index) {
  const itemName = cart[index].nom;
  cart.splice(index, 1);
  saveCart();
  displayCart();
  showNotification(`${itemName} retiré du panier`);
}

function checkoutWhatsApp() {
  if (cart.length === 0) {
    showNotification('Votre panier est vide', 'error');
    return;
  }
  
  const phoneNumber = CONFIG.whatsappNumbers.primary;
  let message = `Bonjour VoltsNiger,\n\nJe souhaite commander les produits suivants :\n\n`;
  
  cart.forEach((item, index) => {
    const product = allProducts.find(p => p.id === item.id) || item;
    const price = product.prix || item.prix;
    const total = price * (item.quantity || 1);
    
    message += `${index + 1}. ${product.nom || item.nom}\n`;
    message += `   Quantité: ${item.quantity || 1}\n`;
    message += `   Prix unitaire: ${price.toLocaleString()} FCFA\n`;
    message += `   Total: ${total.toLocaleString()} FCFA\n\n`;
  });
  
  const subtotal = cart.reduce((total, item) => {
    const product = allProducts.find(p => p.id === item.id) || item;
    return total + ((product.prix || item.prix) * (item.quantity || 1));
  }, 0);
  
  const shipping = subtotal > CONFIG.freeShippingThreshold ? 0 : CONFIG.shippingCost;
  const total = subtotal + shipping;
  
  message += `Sous-total: ${subtotal.toLocaleString()} FCFA\n`;
  message += `Livraison: ${shipping === 0 ? 'Gratuite' : shipping.toLocaleString() + ' FCFA'}\n`;
  message += `TOTAL: ${total.toLocaleString()} FCFA\n\n`;
  message += `Merci de me contacter pour finaliser la commande.`;
  
  window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
}

// ===== FONCTIONS POUR PAGE PRODUIT =====
async function loadProductDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  if (!productId) {
    window.location.href = 'produits.html';
    return;
  }
  
  if (allProducts.length === 0) {
    await loadProducts();
  }
  
  const product = allProducts.find(p => p.id === productId);
  if (!product) {
    document.getElementById('product-content').innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <h2>Produit non trouvé</h2>
        <a href="produits.html" class="btn btn-primary">Retour aux produits</a>
      </div>
    `;
    return;
  }
  
  displayProductDetail(product);
}

function displayProductDetail(product) {
  const container = document.getElementById('product-content');
  const stockText = product.stock > 0 ? 
    `<div class="product-stock in-stock"><i class="fas fa-check"></i> ${product.stock} en stock</div>` :
    `<div class="product-stock out-of-stock"><i class="fas fa-times"></i> Rupture de stock</div>`;
  
  const disabled = product.stock === 0 ? 'disabled' : '';
  
  container.innerHTML = `
    <div class="product-main">
      <div class="product-images">
        <img src="${product.images[0]}" alt="${product.nom}" class="main-image" id="main-image">
        ${product.images.length > 1 ? `
          <div class="thumbnail-grid">
            ${product.images.map((img, index) => `
              <img src="${img}" class="thumbnail ${index === 0 ? 'active' : ''}" 
                   onclick="changeMainImage('${img}', this)">
            `).join('')}
          </div>
        ` : ''}
      </div>
      
      <div class="product-info">
        <span class="product-category">${getCategoryName(product.categorie)}</span>
        <h1 class="product-title">${product.nomComplet || product.nom}</h1>
        <div class="product-price">${product.prix.toLocaleString()} ${product.devise}</div>
        ${stockText}
        
        <div class="product-actions">
          <button class="btn btn-primary btn-lg" onclick="addToCart('${product.id}')" ${disabled}>
            <i class="fas fa-cart-plus"></i> Ajouter au panier
          </button>
          <button class="btn btn-lg" style="background:#25D366;color:white;" 
                  onclick="orderWhatsAppProduct('${product.id}')" ${disabled}>
            <i class="fab fa-whatsapp"></i> Commander maintenant
          </button>
        </div>
      </div>
    </div>
  `;
}

function changeMainImage(imgSrc, thumbnail) {
  const mainImage = document.getElementById('main-image');
  if (mainImage) mainImage.src = imgSrc;
  
  document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
  thumbnail.classList.add('active');
}

// ===== FONCTIONS POUR PAGE CONTACT =====
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  
  form.addEventListener('submit', function(e) {
    const phone = document.getElementById('telephone');
    if (phone && !/^[0-9\s\+\(\)\.\-]{8,}$/.test(phone.value)) {
      e.preventDefault();
      alert('Veuillez entrer un numéro de téléphone valide.');
      return false;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }, 5000);
  });
}

// ===== EXPOSER LES FONCTIONS GLOBALEMENT =====
window.addToCart = addToCart;
window.orderWhatsAppProduct = orderWhatsAppProduct;
window.updateCartItem = updateCartItem;
window.removeFromCart = removeFromCart;
window.checkoutWhatsApp = checkoutWhatsApp;
window.changeMainImage = changeMainImage;
