/**
 * SearchFilters - Gestion robuste de la recherche et des filtres
 * Correction : initialisation après chargement des données
 */
const SearchFilters = {
  currentFilters: {
    search: '',
    type: '',
    ville: '',
    diplome: ''
  },

  async init() {
    // Attendre que les données soient chargées avant d'initialiser
    console.log('Initialisation des filtres...');
    await DataLoader.init();
    console.log('✅ Données prêtes, configuration des écouteurs');
    
    this.bindSearchEvents();
    this.bindFilterEvents();
    
    // Rendu initial
    this.applyAndRender();
  },

  bindSearchEvents() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.querySelector('.search-bar button');
    
    if (!searchInput) {
      console.warn('Champ de recherche non trouvé');
      return;
    }

    // Recherche en temps réel avec debounce
    const handleSearch = this.debounce(() => {
      this.currentFilters.search = searchInput.value.trim();
      console.log('Recherche déclenchée:', this.currentFilters.search);
      this.applyAndRender();
    }, 300);

    searchInput.addEventListener('input', handleSearch);
    
    // Recherche au clic sur le bouton
    if (searchBtn) {
      searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.currentFilters.search = searchInput.value.trim();
        this.applyAndRender();
      });
    }
    
    // Recherche avec la touche Entrée
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.currentFilters.search = searchInput.value.trim();
        this.applyAndRender();
      }
    });
  },

  bindFilterEvents() {
    const filterIds = ['filter-type', 'filter-ville', 'filter-diplome'];
    
    filterIds.forEach(id => {
      const select = document.getElementById(id);
      if (!select) {
        console.warn(`Filtre ${id} non trouvé`);
        return;
      }

      select.addEventListener('change', () => {
        const filterKey = id.replace('filter-', '');
        this.currentFilters[filterKey] = select.value;
        console.log(`Filtre ${filterKey} changé:`, select.value);
        this.applyAndRender();
      });
    });
  },

  // Dans la méthode applyAndRender, ajouter la gestion du bouton reset
applyAndRender() {
    const filtered = DataLoader.applyFilters(this.currentFilters);
    this.renderCards(filtered);
    this.renderResultCount(filtered.length);
    this.updateURL();
    this.toggleResetButton();
  },

  // Nouvelle méthode
  toggleResetButton() {
    const resetBtn = document.getElementById('reset-filters-btn');
    if (!resetBtn) return;
    
    const hasFilters = this.currentFilters.search || 
                       this.currentFilters.type || 
                       this.currentFilters.ville || 
                       this.currentFilters.diplome;
    
    resetBtn.style.display = hasFilters ? 'inline-flex' : 'none';
  },

  updateURL() {
    const params = new URLSearchParams();
    if (this.currentFilters.search) params.set('q', this.currentFilters.search);
    if (this.currentFilters.type) params.set('type', this.currentFilters.type);
    if (this.currentFilters.ville) params.set('ville', this.currentFilters.ville);
    if (this.currentFilters.diplome) params.set('diplome', this.currentFilters.diplome);
    
    const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newURL);
  },

  renderCards(ecoles) {
    const grid = document.getElementById('ecoles-grid');
    if (!grid) {
      console.warn('Grille des écoles non trouvée');
      return;
    }

    if (!ecoles || ecoles.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 48px 20px;">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5" style="margin-bottom: 16px;">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <p style="font-size: 1.1rem; color: var(--gray-600); margin-bottom: 8px;">
            Aucune école trouvée pour "<strong>${this.currentFilters.search}</strong>"
          </p>
          <p style="color: var(--gray-600);">
            Essayez de modifier vos termes de recherche ou vos filtres.
          </p>
        </div>
      `;
      return;
    }

    grid.innerHTML = ecoles.map(ecole => this.createCardHTML(ecole)).join('');
    this.attachCardEvents();
  },

  createCardHTML(ecole) {
    const isFav = FavoritesManager.isFavorite(ecole.id);
    const prochainConcours = ecole.concours?.date_prochain || 'Non communiqué';
    const tarifsMin = ecole.tarifs?.frais_scolarite || 'Voir détails';
    const nbFilieres = ecole.filières?.length || 0;
    
    // Générer un placeholder SVG si le logo n'est pas disponible
    const logoSrc = ecole.logo || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Crect width='56' height='56' rx='8' fill='%231a3c6e'/%3E%3Ctext x='28' y='36' text-anchor='middle' fill='white' font-family='sans-serif' font-size='20' font-weight='bold'%3E${ecole.acronyme || ecole.nom.substring(0,2)}%3C/text%3E%3C/svg%3E`;

    return `
      <article class="ecole-card" data-ecole-id="${ecole.id}">
        <div class="card-header">
          <img src="${logoSrc}" 
               alt="Logo ${ecole.nom}" 
               class="card-logo" 
               loading="lazy"
               onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2756%27 height=%2756%27%3E%3Crect width=%2756%27 height=%2756%27 rx=%278%27 fill=%27%23dee2e6%27/%3E%3Ctext x=%2728%27 y=%2736%27 text-anchor=%27middle%27 fill=%27%236c757d%27 font-family=%27sans-serif%27 font-size=%2716%27%3E🏫%3C/text%3E%3C/svg%3E'">
          <div class="card-identity">
            <h3>${ecole.nom}</h3>
            <span>${ecole.type} · ${ecole.ville}</span>
          </div>
        </div>
        <div class="card-body">
          <ul class="card-info">
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
              <span>${nbFilieres} filière${nbFilieres > 1 ? 's' : ''}</span>
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="6" y1="1" x2="6" y2="5"/><line x1="18" y1="1" x2="18" y2="5"/></svg>
              <span>Frais : ${tarifsMin}</span>
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>Concours : ${prochainConcours}</span>
            </li>
          </ul>
        </div>
        <div class="card-footer">
          <a href="ecoles/ecole.html?id=${ecole.id}" class="btn btn-primary">Voir les formations</a>
          <button class="btn btn-fav ${isFav ? 'active' : ''}" 
                  data-ecole-id="${ecole.id}" 
                  aria-label="${isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>
      </article>
    `;
  },

  renderResultCount(count) {
    const el = document.getElementById('result-count');
    if (el) {
      el.textContent = `${count} école${count !== 1 ? 's' : ''} trouvée${count !== 1 ? 's' : ''}`;
    }
  },

  attachCardEvents() {
    document.querySelectorAll('.btn-fav').forEach(btn => {
      // Éviter les doublons d'écouteurs
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      
      newBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const id = newBtn.dataset.ecoleId;
        if (!id) return;
        
        // Toggle favori
        const isNowFav = !FavoritesManager.isFavorite(id);
        if (isNowFav) {
          FavoritesManager.addFavorite(id);
        } else {
          FavoritesManager.removeFavorite(id);
        }
        
        newBtn.classList.toggle('active', isNowFav);
        const svg = newBtn.querySelector('svg');
        if (svg) {
          svg.setAttribute('fill', isNowFav ? 'currentColor' : 'none');
        }
        newBtn.setAttribute('aria-label', isNowFav ? 'Retiré des favoris' : 'Ajouter aux favoris');
      });
    });
  },

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};
