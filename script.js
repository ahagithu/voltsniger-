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
var allProducts = [];
var cart = JSON.parse(localStorage.getItem('cart')) || [];

// ===== FONCTIONS DE BASE =====

// ===== MENU MOBILE =====
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('.site-nav');
  const body = document.body;
  
  if (menuToggle && siteNav) {
    // Toggle menu
    menuToggle.addEventListener('click', function(e) {
      e.stopPropagation(); // Empêche la propagation
      siteNav.classList.toggle('active');
      body.classList.toggle('menu-open');
      menuToggle.innerHTML = siteNav.classList.contains('active') 
        ? '<i class="fas fa-times"></i>' 
        : '<i class="fas fa-bars"></i>';
    });
    
    // Fermer le menu en cliquant sur un lien
    siteNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        siteNav.classList.remove('active');
        body.classList.remove('menu-open');
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
      });
    });
    
    // Fermer le menu en cliquant à l'extérieur
    document.addEventListener('click', function(e) {
      if (siteNav.classList.contains('active') && 
          !siteNav.contains(e.target) && 
          !menuToggle.contains(e.target)) {
        siteNav.classList.remove('active');
        body.classList.remove('menu-open');
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
      }
    });
    
    // Fermer avec la touche ESC
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && siteNav.classList.contains('active')) {
        siteNav.classList.remove('active');
        body.classList.remove('menu-open');
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
      }
    });
  }
}

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', function() {
  initMobileMenu();
  // ... autres initialisations
});

// Mettre à jour le compteur panier
function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = totalItems;
    el.style.display = totalItems > 0 ? 'inline' : 'none';
  });
}

// Afficher une notification
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i>
    <span>${message}</span>
  `;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 10px;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Charger tous les produits
async function loadProducts(containerId = null, limit = null) {
  try {
    console.log('Chargement des produits depuis produits.json...');
    const response = await fetch('produits.json');
    const data = await response.json();
    allProducts = data.produits;
    console.log(`${allProducts.length} produits chargés`);
    
    if (containerId) {
      displayProducts(containerId, allProducts, limit);
    }
    
    return allProducts;
    
  } catch (error) {
    console.error('Erreur de chargement des produits:', error);
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #dc2626;">
          <i class="fas fa-exclamation-triangle fa-2x"></i>
          <h3>Erreur de chargement des produits</h3>
          <p>Veuillez réessayer plus tard</p>
        </div>
      `;
    }
    return [];
  }
}

// Afficher les produits
function displayProducts(containerId, products, limit = null) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Conteneur ${containerId} non trouvé`);
    return;
  }
  
  let productsToShow = limit ? products.slice(0, limit) : products;
  
  if (productsToShow.length === 0) {
    container.innerHTML = '<p class="text-center">Aucun produit trouvé.</p>';
    return;
  }
  
  container.innerHTML = productsToShow.map(product => createProductCard(product)).join('');
  console.log(`${productsToShow.length} produits affichés dans ${containerId}`);
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
  
  // Nom catégorie
  const categoryNames = {
    'microcontroleurs': 'Microcontrôleurs',
    'communication': 'Communication',
    'capteurs': 'Capteurs',
    'moteurs': 'Moteurs',
    'alimentation': 'Alimentation',
    'accessoires': 'Accessoires'
  };
  const categoryName = categoryNames[product.categorie] || product.categorie;
  
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
        <span class="product-category">${categoryName}</span>
        <h3 class="product-title">${product.nom}</h3>
        <p class="product-description">${product.description.substring(0, 100)}...</p>
        
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

// Ajouter au panier
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
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  showNotification(`${product.nom} ajouté au panier`);
}

// Commander via WhatsApp
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

// Initialiser les filtres (page produits)
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

// Filtrer les produits
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
  
  displayProducts('products-container', filteredProducts);
}

// ===== INITIALISATION GLOBALE =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM chargé - initialisation');
  
  // Mettre à jour le compteur panier
  updateCartCount();
  
  // Initialiser le menu mobile
  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('.site-nav');
  
  if (menuToggle && siteNav) {
    menuToggle.addEventListener('click', () => {
      siteNav.classList.toggle('active');
    });
  }
});

// ===== EXPOSER LES FONCTIONS GLOBALEMENT =====
window.addToCart = addToCart;
window.orderWhatsAppProduct = orderWhatsAppProduct;
window.loadProducts = loadProducts;
window.initFilters = initFilters;
window.updateCartCount = updateCartCount;
