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
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  },

  saveFavorites(favorites) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
  },

  isFavorite(ecoleId) {
    return this.getFavorites().includes(ecoleId);
  },

  addFavorite(ecoleId) {
    const favorites = this.getFavorites();
    if (!favorites.includes(ecoleId)) {
      favorites.push(ecoleId);
      this.saveFavorites(favorites);
    }
    this.updateBadge();
  },

  removeFavorite(ecoleId) {
    const favorites = this.getFavorites().filter(id => id !== ecoleId);
    this.saveFavorites(favorites);
    this.updateBadge();
  },

  toggleFavorite(ecoleId) {
    if (this.isFavorite(ecoleId)) {
      this.removeFavorite(ecoleId);
      return false;
    } else {
      this.addFavorite(ecoleId);
      return true;
    }
  },

  updateBadge() {
    const count = this.getFavorites().length;
    document.querySelectorAll('.fav-badge').forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  }
};
