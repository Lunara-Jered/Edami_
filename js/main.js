/**
 * Main - Point d'entrée de l'application Edami
 */
const Edami = {
  async init() {
    console.log('🚀 Edami initialisation...');
    
    // Initialiser les favoris
    FavoritesManager.init();
    FavoritesManager.updateBadge();
    
    // Charger les données
    const ecoles = await DataLoader.init();
    console.log(`${ecoles.length} écoles disponibles`);
    
    // Détecter la page
    const path = window.location.pathname;
    console.log('Page détectée:', path);
    
    if (path.includes('ecoles/ecole.html')) {
      await this.initEcolePage();
    } else if (path.includes('sauvegarde.html')) {
      await this.initFavoritesPage();
    } else if (path.includes('index.html') || path === '/' || path.endsWith('/edami/')) {
      await this.initHomePage();
    }
    
    this.initMobileMenu();
    this.setActiveNav();
  },

  async initHomePage() {
    console.log('Initialisation page accueil');
    // Initialiser les filtres APRÈS le chargement des données
    await SearchFilters.init();
    
    // Restaurer les filtres depuis l'URL si présents
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.value = q;
        SearchFilters.currentFilters.search = q;
        SearchFilters.applyAndRender();
      }
    }
  },

  async initEcolePage() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    console.log('Chargement école:', id);
    
    const ecole = DataLoader.getEcoleById(id);
    
    if (!ecole) {
      document.querySelector('.container').innerHTML = `
        <div style="text-align: center; padding: 80px 20px;">
          <h1 style="color: var(--primary); margin-bottom: 16px;">École non trouvée</h1>
          <p style="color: var(--gray-600); margin-bottom: 24px;">
            L'établissement "${id}" n'existe pas dans notre base.
          </p>
          <a href="../index.html" class="btn btn-primary">Retour à l'accueil</a>
        </div>
      `;
      return;
    }
    
    this.renderEcolePage(ecole);
  },

  renderEcolePage(ecole) {
    document.title = `${ecole.nom} - Edami`;
    
    // Méthode sécurisée pour définir le contenu
    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text || 'Non communiqué';
    };
    
    const setHTML = (id, html) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html || '';
    };
    
    const setSrc = (id, src) => {
      const el = document.getElementById(id);
      if (el) el.src = src || '';
    };
    
    setText('ecole-nom', ecole.nom);
    setSrc('ecole-logo', ecole.logo);
    setText('ecole-type', ecole.type);
    setText('ecole-statut', ecole.statut);
    setText('ecole-ville', ecole.ville);
    setText('ecole-description', ecole.description || ecole.description_courte);
    
    // Filières
    if (ecole.filières?.length) {
      setHTML('filieres-grid', ecole.filières.map(f => `
        <div class="filiere-card">
          <h3>${f.nom}</h3>
          <div class="filiere-details">
            <span class="filiere-tag">📜 ${f.diplome}</span>
            <span class="filiere-tag">⏱ ${f.duree}</span>
            <span class="filiere-tag">📍 ${f.mode}</span>
          </div>
          <p>${f.description || ''}</p>
          <span class="filiere-tag" style="margin-top: 8px;">🏷 ${f.domaine}</span>
        </div>
      `).join(''));
    }
    
    // Concours
    setText('concours-date', ecole.concours?.date_prochain);
    setText('concours-inscription', ecole.concours?.periode_inscription);
    setText('concours-voie', ecole.concours?.voie);
    if (ecole.concours?.conditions) {
      setHTML('concours-conditions', ecole.concours.conditions.map(c => `<li>${c}</li>`).join(''));
    }
    
    // Tarifs
    setText('tarifs-inscription', ecole.tarifs?.frais_inscription);
    setText('tarifs-scolarite', ecole.tarifs?.frais_scolarite);
    setText('tarifs-bourses', ecole.tarifs?.details || '');
    
    // Actualités
    if (ecole.actualites?.length) {
      setHTML('actualites-list', ecole.actualites.map(a => `
        <article class="actualite-item">
          <div class="actualite-date">${new Date(a.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          <h3>${a.titre}</h3>
          <p>${a.contenu}</p>
        </article>
      `).join(''));
    }
    
    // Contact
    setText('contact-tel', ecole.contact?.telephone);
    setText('contact-email', ecole.contact?.email);
    setText('contact-adresse', ecole.contact?.adresse);
    
    // Bouton favori
    const btnFav = document.getElementById('btn-fav-ecole');
    if (btnFav) {
      const isFav = FavoritesManager.isFavorite(ecole.id);
      btnFav.classList.toggle('active', isFav);
      btnFav.innerHTML = isFav ? '❤️ Retiré des favoris' : '🤍 Sauvegarder cette école';
      
      btnFav.addEventListener('click', () => {
        const nowFav = FavoritesManager.toggleFavorite(ecole.id);
        btnFav.classList.toggle('active', nowFav);
        btnFav.innerHTML = nowFav ? '❤️ Retiré des favoris' : '🤍 Sauvegarder cette école';
      });
    }
  },

  async initFavoritesPage() {
    await DataLoader.init();
    const favIds = FavoritesManager.getFavorites();
    const ecoles = DataLoader.getEcoles().filter(e => favIds.includes(e.id));
    
    const container = document.getElementById('favorites-list');
    if (!container) return;
    
    if (ecoles.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 48px 20px;">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5" style="margin-bottom: 16px;">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <p style="font-size: 1.1rem; color: var(--gray-600); margin-bottom: 16px;">Aucun favori sauvegardé.</p>
          <a href="index.html" class="btn btn-primary">Explorer les écoles</a>
        </div>
      `;
      return;
    }
    
    container.innerHTML = ecoles.map(e => SearchFilters.createCardHTML(e)).join('');
    SearchFilters.attachCardEvents();
  },

  initMobileMenu() {
    const hamburger = document.getElementById('hamburger-btn');
    const navLinks = document.getElementById('nav-links');
    
    if (hamburger && navLinks) {
      hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        const isOpen = navLinks.classList.contains('open');
        hamburger.setAttribute('aria-expanded', isOpen);
      });
      
      // Fermer le menu au clic sur un lien
      navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navLinks.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
        });
      });
    }
  },

  setActiveNav() {
    const path = window.location.pathname;
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href && path.includes(href.replace(/\.\.\//g, '').replace('./', ''))) {
        link.classList.add('active');
      }
    });
  }
};

// Démarrer l'application
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM prêt, démarrage Edami...');
  Edami.init().catch(err => console.error('Erreur Edami:', err));
});
