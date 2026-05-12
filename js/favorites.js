/**
 * FavoritesManager - Gestion des favoris via localStorage
 */
const FavoritesManager = {
  STORAGE_KEY: 'edami_favorites',
  
  init() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
    }
  },
  
  getFavorites() {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
  },
  
  saveFavorites(favorites) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
  },
  
  isFavorite(ecoleId) {
    return this.getFavorites().includes(ecoleId);
  },
  
  toggleFavorite(ecoleId) {
    const favorites = this.getFavorites();
    const index = favorites.indexOf(ecoleId);
    
    if (index > -1) {
      favorites.splice(index, 1);
    } else {
      favorites.push(ecoleId);
    }
    
    this.saveFavorites(favorites);
    this.updateBadge();
    return !this.isFavorite(ecoleId);
  },
  
  updateBadge() {
    const badges = document.querySelectorAll('.fav-badge');
    const count = this.getFavorites().length;
    badges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  }
};
