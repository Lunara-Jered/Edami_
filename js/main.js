/**
 * Main - Script principal de l'application Edami
 * Point d'entrée pour toutes les pages
 */
const Edami = {
  async init() {
    // Initialiser le gestionnaire de favoris
    FavoritesManager.init();
    FavoritesManager.updateBadge();
    
    // Charger les données
    const ecoles = await DataLoader.init();
    
    // Détecter la page courante
    const path = window.location.pathname;
    
    if (path.includes('ecoles/ecole.html')) {
      this.initEcolePage();
    } else if (path.includes('sauvegarde.html')) {
      this.initFavoritesPage();
    } else if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
      this.initHomePage();
    }
    
    this.initMobileMenu();
    this.setActiveNav();
  },
  
  initHomePage() {
    SearchFilters.init();
    
    // Rendu initial
    const ecoles = DataLoader.getEcoles();
    SearchFilters.renderCards(ecoles);
    SearchFilters.renderResultCount(ecoles.length);
  },
  
  initEcolePage() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    
    const ecole = DataLoader.getEcoleById(id);
    
    if (!ecole) {
      document.querySelector('.container').innerHTML = `
        <div class="ecole-not-found" style="text-align: center; padding: 80px 20px;">
          <h1 style="color: var(--primary); margin-bottom: 16px;">École non trouvée</h1>
          <p style="color: var(--gray-600); margin-bottom: 24px;">L'établissement que vous recherchez n'existe pas ou a été déplacé.</p>
          <a href="../index.html" class="btn btn-primary">Retour à l'accueil</a>
        </div>
      `;
      return;
    }
    
    this.renderEcolePage(ecole);
  },
  
  renderEcolePage(ecole) {
    // Mettre à jour le titre et la description
    document.title = `${ecole.nom} - Edami`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', ecole.description_courte || `Découvrez ${ecole.nom} : formations, conditions d'admission, tarifs et actualités.`);
    
    // Remplir les sections
    document.getElementById('ecole-nom').textContent = ecole.nom;
    document.getElementById('ecole-logo').src = ecole.logo;
    document.getElementById('ecole-logo').alt = `Logo ${ecole.nom}`;
    document.getElementById('ecole-type').textContent = ecole.type;
    document.getElementById('ecole-statut').textContent = ecole.statut;
    document.getElementById('ecole-ville').textContent = ecole.ville;
    document.getElementById('ecole-description').textContent = ecole.description;
    
    // Filieres
    const filieresGrid = document.getElementById('filieres-grid');
    if (ecole.filières && ecole.filières.length > 0) {
      filieresGrid.innerHTML = ecole.filières.map(f => `
        <div class="filiere-card">
          <h3>${f.nom}</h3>
          <div class="filiere-details">
            <span class="filiere-tag">📜 ${f.diplome}</span>
            <span class="filiere-tag">⏱ ${f.duree}</span>
            <span class="filiere-tag">📍 ${f.mode}</span>
          </div>
          <p>${f.description}</p>
          <span class="filiere-tag" style="margin-top: 8px;">🏷 ${f.domaine}</span>
        </div>
      `).join('');
    } else {
      filieresGrid.innerHTML = '<p>Information sur les filières à venir.</p>';
    }
    
    // Concours
    document.getElementById('concours-date').textContent = ecole.concours?.date_prochain || 'Non communiqué';
    document.getElementById('concours-inscription').textContent = ecole.concours?.periode_inscription || 'Non communiqué';
    document.getElementById('concours-voie').textContent = ecole.concours?.voie || 'Non précisé';
    
    const conditionsList = document.getElementById('concours-conditions');
    if (ecole.concours?.conditions) {
      conditionsList.innerHTML = ecole.concours.conditions.map(c => `<li>${c}</li>`).join('');
    }
    
    // Tarifs
    document.getElementById('tarifs-inscription').textContent = ecole.tarifs?.frais_inscription || 'Non communiqué';
    document.getElementById('tarifs-scolarite').textContent = ecole.tarifs?.frais_scolarite || 'Non communiqué';
    document.getElementById('tarifs-bourses').textContent = ecole.tarifs?.details || '';
    
    // Actualités
    const actusDiv = document.getElementById('actualites-list');
    if (ecole.actualites && ecole.actualites.length > 0) {
      actusDiv.innerHTML = ecole.actualites.map(a => `
        <article class="actualite-item">
          <div class="actualite-date">${new Date(a.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          <h3>${a.titre}</h3>
          <p>${a.contenu}</p>
        </article>
      `).join('');
    } else {
      actusDiv.innerHTML = '<p>Aucune actualité disponible pour le moment.</p>';
    }
    
    // Contact
    document.getElementById('contact-tel').textContent = ecole.contact?.telephone || 'Non communiqué';
    document.getElementById('contact-email').textContent = ecole.contact?.email || 'Non communiqué';
    document.getElementById('contact-adresse').textContent = ecole.contact?.adresse || 'Non communiqué';
    
    // Bouton favoris
    const btnFav = document.getElementById('btn-fav-ecole');
    const isFav = FavoritesManager.isFavorite(ecole.id);
    btnFav.classList.toggle('active', isFav);
    btnFav.innerHTML = isFav ? '❤️ Retiré des favoris' : '🤍 Sauvegarder cette école';
    
    btnFav.addEventListener('click', () => {
      const nowFav = FavoritesManager.toggleFavorite(ecole.id);
      btnFav.classList.toggle('active', nowFav);
      btnFav.innerHTML = nowFav ? '❤️ Retiré des favoris' : '🤍 Sauvegarder cette école';
    });
  },
  
  initFavoritesPage() {
    const favoritesIds = FavoritesManager.getFavorites();
    const ecoles = DataLoader.getEcoles().filter(e => favoritesIds.includes(e.id));
    
    const container = document.getElementById('favorites-list');
    
    if (ecoles.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <p style="font-size: 1.1rem; color: var(--gray-600);">Aucun favori sauvegardé.</p>
          <a href="index.html" class="btn btn-primary" style="margin-top: 16px;">Explorer les écoles</a>
        </div>
      `;
      return;
    }
    
    container.innerHTML = ecoles.map(ecole => SearchFilters.createCardHTML(ecole)).join('');
    SearchFilters.attachCardEvents();
  },
  
  initMobileMenu() {
    const hamburger = document.getElementById('hamburger-btn');
    const navLinks = document.getElementById('nav-links');
    
    if (hamburger && navLinks) {
      hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('open');
      });
    }
  },
  
  setActiveNav() {
    const path = window.location.pathname;
    const links = document.querySelectorAll('.nav-links a');
    
    links.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') && path.includes(link.getAttribute('href').replace('./', ''))) {
        link.classList.add('active');
      }
    });
  }
};

// Démarrer quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => Edami.init());
