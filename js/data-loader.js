/**
 * DataLoader - Charge et gère les données des écoles
 * Version robuste avec cache et gestion d'erreurs améliorée
 */
const DataLoader = {
  data: null,
  isLoading: false,
  isLoaded: false,
  initPromise: null,

  async init() {
    // Éviter les appels multiples
    if (this.isLoaded) return this.data?.ecoles || [];
    if (this.isLoading) return this.initPromise;
    
    this.isLoading = true;
    
    this.initPromise = (async () => {
      try {
        // Déterminer le bon chemin selon la page
        const path = window.location.pathname;
        const dataPath = path.includes('ecoles/') ? '../data/ecoles.json' : 'data/ecoles.json';
        
        console.log('Chargement des données depuis:', dataPath);
        const response = await fetch(dataPath);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        
        const json = await response.json();
        this.data = json;
        this.isLoaded = true;
        console.log('✅ Données chargées:', this.data.ecoles.length, 'écoles');
        return this.data.ecoles;
      } catch (error) {
        console.error('❌ DataLoader error:', error);
        // Fallback : données en dur pour le dépannage
        this.data = this.getFallbackData();
        this.isLoaded = true;
        return this.data.ecoles;
      } finally {
        this.isLoading = false;
      }
    })();
    
    return this.initPromise;
  },

  getFallbackData() {
    // Données minimales de secours si le JSON ne charge pas
    return {
      ecoles: [
        {
          id: "uob",
          nom: "Université Omar Bongo",
          acronyme: "UOB",
          type: "Université publique",
          statut: "Public",
          ville: "Libreville",
          logo: "assets/logos/uob-logo.svg",
          description_courte: "Plus grande université du Gabon.",
          filières: [{ nom: "Droit", diplome: "Licence", domaine: "Droit", duree: "3 ans", mode: "Présentiel", description: "..." }],
          concours: { date_prochain: "15 septembre 2026", periode_inscription: "Juillet-Août", conditions: ["Bac"], voie: "Dossier" },
          tarifs: { frais_inscription: "50 000 FCFA", frais_scolarite: "200 000 FCFA/an", bourses: true, details: "" },
          actualites: [{ titre: "Rentrée 2026", date: "2026-09-01", contenu: "..." }],
          contact: { telephone: "+241 01 44 14 64", email: "rectorat@uob.ga", adresse: "Libreville" }
        },
        {
          id: "ens",
          nom: "École Normale Supérieure",
          acronyme: "ENS",
          type: "Grande école publique",
          statut: "Public",
          ville: "Libreville",
          logo: "assets/logos/ens-logo.svg",
          description_courte: "Formation des enseignants.",
          filières: [{ nom: "CAPES Math", diplome: "CAPES", domaine: "Sciences", duree: "2 ans", mode: "Présentiel", description: "..." }],
          concours: { date_prochain: "28 juin 2026", periode_inscription: "Mars-Avril", conditions: ["Bac", "Concours"], voie: "Concours" },
          tarifs: { frais_inscription: "Gratuit", frais_scolarite: "Gratuit", bourses: true, details: "" },
          actualites: [{ titre: "Résultats concours", date: "2025-08-20", contenu: "..." }],
          contact: { telephone: "+241 01 77 12 34", email: "direction@ens.ga", adresse: "Libreville" }
        },
        {
          id: "ist",
          nom: "Institut Supérieur de Technologie",
          acronyme: "IST",
          type: "École spécialisée publique",
          statut: "Public",
          ville: "Franceville",
          logo: "assets/logos/ist-logo.svg",
          description_courte: "Formations technologiques.",
          filières: [{ nom: "BTS Génie Civil", diplome: "BTS", domaine: "BTP", duree: "2 ans", mode: "Présentiel", description: "..." }],
          concours: { date_prochain: "5 septembre 2026", periode_inscription: "Juin-Août", conditions: ["Bac technique"], voie: "Test" },
          tarifs: { frais_inscription: "30 000 FCFA", frais_scolarite: "150 000 FCFA/an", bourses: true, details: "" },
          actualites: [{ titre: "Partenariat Eramet", date: "2025-07-10", contenu: "..." }],
          contact: { telephone: "+241 06 55 88 00", email: "contact@ist.ga", adresse: "Franceville" }
        }
      ]
    };
  },

  getEcoles() {
    if (!this.data || !this.data.ecoles) {
      console.warn('Données non chargées, retour tableau vide');
      return [];
    }
    return this.data.ecoles;
  },

  getEcoleById(id) {
    return this.getEcoles().find(e => e.id === id) || null;
  },

  searchEcoles(query) {
    if (!query || query.trim() === '') return this.getEcoles();
    
    const q = query.toLowerCase().trim();
    console.log('Recherche pour:', q);
    
    return this.getEcoles().filter(e => {
      // Chercher dans plusieurs champs
      const matchNom = e.nom?.toLowerCase().includes(q);
      const matchVille = e.ville?.toLowerCase().includes(q);
      const matchType = e.type?.toLowerCase().includes(q);
      const matchFiliere = e.filières?.some(f => 
        f.nom?.toLowerCase().includes(q) || 
        f.domaine?.toLowerCase().includes(q) ||
        f.diplome?.toLowerCase().includes(q)
      );
      
      return matchNom || matchVille || matchType || matchFiliere;
    });
  },

  applyFilters({ search = '', type = '', ville = '', diplome = '' } = {}) {
    let result = this.getEcoles();
    
    // Appliquer la recherche textuelle d'abord
    if (search && search.trim() !== '') {
      result = this.searchEcoles(search);
    }
    
    // Puis les filtres dropdown
    if (type) {
      result = result.filter(e => e.type === type);
    }
    if (ville) {
      result = result.filter(e => e.ville === ville);
    }
    if (diplome) {
      result = result.filter(e => 
        e.filières?.some(f => f.diplome === diplome)
      );
    }
    
    console.log(`${result.length} résultat(s) après filtres:`, { search, type, ville, diplome });
    return result;
  }
};
