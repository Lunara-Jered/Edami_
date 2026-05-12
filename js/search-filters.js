/**
 * SearchFilters - Gestion de la recherche et des filtres
 */
const SearchFilters = {
  currentFilters: {
    search: '',
    type: '',
    ville: '',
    diplome: ''
  },
  
  init() {
    this.bindSearchEvents();
    this.bindFilterEvents();
  },
  
  bindSearchEvents() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    const debounce = this.debounce(() => {
      this.currentFilters.search = searchInput.value;
      this.applyAndRender();
    }, 300);
    
    searchInput.addEventListener('input', debounce);
  },
  
  bindFilterEvents() {
    ['filter-type', 'filter-ville', 'filter-diplome'].forEach(id => {
      const select = document.getElementById(id);
      if (!select) return;
      
      select.addEventListener('change', () => {
        this.currentFilters[id.replace('filter-', '')] = select.value;
        this.applyAndRender();
      });
    });
  },
  
  applyAndRender() {
    const filtered = DataLoader.applyFilters(this.currentFilters);
    this.renderCards(filtered);
    this.renderResultCount(filtered.length);
  },
  
  renderCards(ecoles) {
    const grid = document.getElementById('ecoles-grid');
    if (!grid) return;
    
    if (ecoles.length === 0) {
      grid.innerHTML = `
        <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 40px;">
          <p style="font-size: 1.1rem; color: var(--gray-600);">Aucune école trouvée pour ces critères.</p>
          <p style="color: var(--gray-600);">Essayez de modifier vos filtres ou votre recherche.</p>
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
    
    return `
      <article class="ecole-card" data-ecole-id="${ecole.id}">
        <div class="card-header">
          <img src="${ecole.logo}" alt="Logo ${ecole.nom}" class="card-logo" loading="lazy">
          <div class="card-identity">
            <h3>${ecole.nom}</h3>
            <span>${ecole.type} · ${ecole.ville}</span>
          </div>
        </div>
        <div class="card-body">
          <ul class="card-info">
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
              <span>${ecole.filières?.length || 0} filière(s)</span>
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="6" y1="1" x2="6" y2="5"/><line x1="18" y1="1" x2="18" y2="5"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/></svg>
              <span>Frais : ${tarifsMin}</span>
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>Concours : ${prochainConcours}</span>
            </li>
          </ul>
        </div>
        <div class="card-footer">
          <a href="ecoles/ecole.html?id=${ecole.id}" class="btn btn-primary">Voir les formations</a>
          <button class="btn btn-fav ${isFav ? 'active' : ''}" 
                  data-ecole-id="${ecole.id}" 
                  aria-label="${isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
        </div>
      </article>
    `;
  },
  
  renderResultCount(count) {
    const el = document.getElementById('result-count');
    if (el) el.textContent = `${count} école(s) trouvée(s)`;
  },
  
  attachCardEvents() {
    document.querySelectorAll('.btn-fav').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = btn.dataset.ecoleId;
        const isNowFav = FavoritesManager.toggleFavorite(id);
        btn.classList.toggle('active', isNowFav);
        
        const svg = btn.querySelector('svg');
        if (svg) svg.setAttribute('fill', isNowFav ? 'currentColor' : 'none');
        
        btn.setAttribute('aria-label', isNowFav ? 'Retirer des favoris' : 'Ajouter aux favoris');
      });
    });
  },
  
  debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
};
