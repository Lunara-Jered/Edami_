/**
 * DataLoader - Charge et gère les données des écoles
 */
const DataLoader = {
  data: null,
  
  async init() {
    try {
      const response = await fetch('../data/ecoles.json');
      if (!response.ok) throw new Error('Erreur de chargement des données');
      this.data = await response.json();
      return this.data.ecoles;
    } catch (error) {
      console.error('DataLoader error:', error);
      return [];
    }
  },
  
  getEcoles() {
    return this.data?.ecoles || [];
  },
  
  getEcoleById(id) {
    return this.getEcoles().find(e => e.id === id) || null;
  },
  
  getEcolesByType(type) {
    if (!type) return this.getEcoles();
    return this.getEcoles().filter(e => e.type === type);
  },
  
  getEcolesByVille(ville) {
    if (!ville) return this.getEcoles();
    return this.getEcoles().filter(e => e.ville === ville);
  },
  
  searchEcoles(query) {
    if (!query) return this.getEcoles();
    const q = query.toLowerCase();
    return this.getEcoles().filter(e => 
      e.nom.toLowerCase().includes(q) ||
      e.ville.toLowerCase().includes(q) ||
      e.type.toLowerCase().includes(q) ||
      e.filières?.some(f => f.nom.toLowerCase().includes(q))
    );
  },
  
  applyFilters({ search = '', type = '', ville = '', diplome = '' } = {}) {
    let result = this.getEcoles();
    
    if (search) result = this.searchEcoles(search);
    if (type) result = result.filter(e => e.type === type);
    if (ville) result = result.filter(e => e.ville === ville);
    if (diplome) {
      result = result.filter(e => 
        e.filières?.some(f => f.diplome === diplome)
      );
    }
    
    return result;
  }
};
