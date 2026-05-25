// build.js
// Lance avec : node build.js

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// ─────────────────────────────────────────────
// Configuration des fiches marque (chemin URL + libellé affiché)
// Modifier ces 2 valeurs suffit pour renommer l'espace fiches marque
// sur tout le site (dossier, breadcrumb, sitemap, JSON-LD, etc.).
// ─────────────────────────────────────────────
const FICHES_MARQUE = {
  CHEMIN: 'annuaire-marques',
  LABEL:  'Annuaire des marques'
};

const PAGES = [
  { fichier: 'index.html',                                    actif: '',              categorie: null,            sousCategorie: null,    sitemap: true },
  { fichier: 'made-in-france/epicerie-fine/index.html',       actif: 'epicerie-fine', categorie: 'epicerie-fine', sousCategorie: null,    sitemap: true },
  { fichier: 'made-in-france/miel/index.html',                actif: 'miel',          categorie: 'epicerie-fine', sousCategorie: 'miel',  sitemap: true },
  { fichier: 'made-in-france/mode/index.html',                actif: 'mode',          categorie: 'mode',          sousCategorie: null,    sitemap: true },
  { fichier: 'made-in-france/beaute/index.html',              actif: 'beaute',        categorie: 'beaute',        sousCategorie: null,    sitemap: true },
  { fichier: 'made-in-france/bijoux/index.html',              actif: 'bijoux',        categorie: 'bijoux',        sousCategorie: null,    sitemap: true },
  { fichier: 'made-in-france/maison/index.html',              actif: 'maison',        categorie: 'maison',        sousCategorie: null,    sitemap: true },
  { fichier: 'made-in-france/sport/index.html',               actif: 'sport',         categorie: 'sport',         sousCategorie: null,    sitemap: true },
  { fichier: 'made-in-france/technologie/index.html',         actif: 'technologie',   categorie: 'technologie',   sousCategorie: null,    sitemap: true },
  { fichier: 'referencer-votre-marque/index.html',            actif: '',              categorie: null,            sousCategorie: null,    sitemap: true },
  { fichier: 'mentions-legales/index.html',                   actif: '',              categorie: null,            sousCategorie: null,    sitemap: true },
  { fichier: 'politique-de-confidentialite/index.html',       actif: '',              categorie: null,            sousCategorie: null,    sitemap: true },
  { fichier: 'conditions-generales-de-vente/index.html',      actif: '',              categorie: null,            sousCategorie: null,    sitemap: true },
  { fichier: 'conditions-generales-utilisation/index.html',   actif: '',              categorie: null,            sousCategorie: null,    sitemap: true },
  { fichier: 'contact/index.html',                            actif: '',              categorie: null,            sousCategorie: null,    sitemap: true },

];

const navCss             = fs.readFileSync(path.join(__dirname, 'css/nav.css'), 'utf8');
const navHtml            = fs.readFileSync(path.join(__dirname, 'templates/nav.html'), 'utf8');
const footerCss          = fs.readFileSync(path.join(__dirname, 'css/footer.css'), 'utf8');
const footerHtml         = fs.readFileSync(path.join(__dirname, 'templates/footer.html'), 'utf8');
const globalCss          = fs.readFileSync(path.join(__dirname, 'css/global.css'), 'utf8');
const breadcrumbCss      = fs.readFileSync(path.join(__dirname, 'css/breadcrumb.css'), 'utf8');
const heroCategorieCss   = fs.readFileSync(path.join(__dirname, 'css/hero-categories.css'), 'utf8');
const heroLegalCss       = fs.readFileSync(path.join(__dirname, 'css/hero-legal.css'), 'utf8');
const sousCategorieCss   = fs.readFileSync(path.join(__dirname, 'css/sous-cat-grid.css'), 'utf8');
const carteCss           = fs.readFileSync(path.join(__dirname, 'css/carte-france-et-legende.css'), 'utf8');
const seoTextCateCss     = fs.readFileSync(path.join(__dirname, 'css/seo-texte-categories.css'), 'utf8');
const faqCss             = fs.readFileSync(path.join(__dirname, 'css/faq.css'), 'utf8');
const autresCateCss      = fs.readFileSync(path.join(__dirname, 'css/autres-categories.css'), 'utf8');
const bandeauCtaCss      = fs.readFileSync(path.join(__dirname, 'css/bandeau-cta.css'), 'utf8');
const marquesSectionCss  = fs.readFileSync(path.join(__dirname, 'css/marques-section.css'), 'utf8');
const marqueVedetteCss   = fs.readFileSync(path.join(__dirname, 'css/marque-vedette.css'), 'utf8');
const marquesGridCss     = fs.readFileSync(path.join(__dirname, 'css/marques-grid.css'), 'utf8');
const produitsSectionCss = fs.readFileSync(path.join(__dirname, 'css/produits-section.css'), 'utf8');
const organizationJsonLd = fs.readFileSync(path.join(__dirname, 'js/Organization-json-ld.json'), 'utf8').trim();
const menuBurgerJs       = fs.readFileSync(path.join(__dirname, 'js/components/menu-burger.js'), 'utf8');
const faqJs              = fs.readFileSync(path.join(__dirname, 'js/components/faq.js'), 'utf8');
const emailObfusqueJs    = fs.readFileSync(path.join(__dirname, 'js/components/email-obfusque.js'), 'utf8');
const analyticsJs        = fs.readFileSync(path.join(__dirname, 'js/components/analytics.js'), 'utf8');

// ─── AJOUT FICHE MARQUE ───
const ficheMarqueCss     = fs.readFileSync(path.join(__dirname, 'css/fiche-marque.css'), 'utf8');
const pageMarqueTemplate = fs.readFileSync(path.join(__dirname, 'templates/Page_marque.html'), 'utf8');




const CATEGORIES = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/categories.json'), 'utf8'));

// ─────────────────────────────────────────────
// HELPER : trouver le parent principal d'une sous-catégorie
// Utilise parent_principal si défini, sinon le premier parent trouvé
// ─────────────────────────────────────────────
function trouverParentPrincipal(sousCategSlug) {
  // Chercher dans toutes les catégories
  const parentsExplicites = [];
  for (const [catSlug, catData] of Object.entries(CATEGORIES)) {
    const found = catData.sous_categories.find(sc => sc.slug === sousCategSlug);
    if (found) {
      if (found.parent_principal === catSlug) return { slug: catSlug, nom: catData.nom };
      parentsExplicites.push({ slug: catSlug, nom: catData.nom, sc: found });
    }
  }
  // Pas de parent_principal explicite → premier trouvé
  if (parentsExplicites.length) {
    return { slug: parentsExplicites[0].slug, nom: parentsExplicites[0].nom };
  }
  return null;
}

// ─────────────────────────────────────────────
// HELPER : trouver le nom d'affichage d'une sous-catégorie
// ─────────────────────────────────────────────
function trouverNomAffichageSousCat(sousCategSlug) {
  for (const catData of Object.values(CATEGORIES)) {
    const found = catData.sous_categories.find(sc => sc.slug === sousCategSlug);
    if (found) return found.nom_affichage || found.slug;
  }
  return sousCategSlug;
}

// ─────────────────────────────────────────────
// HELPERS FICHE MARQUE
// ─────────────────────────────────────────────

// Extraire le slug depuis url_site Supabase (URL relative)
// Ex : "/annuaire-marques/rucher-marandou/" → "rucher-marandou"
// Robuste : gère aussi les anciennes URLs absolues et les variantes avec/sans slash final
function extraireSlugMarque(urlSite) {
  if (!urlSite || typeof urlSite !== 'string') return null;
  const cleanUrl = urlSite.replace(/\/+$/, '');
  const segments = cleanUrl.split('/').filter(Boolean);
  return segments[segments.length - 1] || null;
}

// Générer les initiales d'une marque (2 max)
function genererInitiales(nom) {
  if (!nom) return '?';
  return nom.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// Échapper le HTML pour injection sécurisée (anti-XSS)
function echapper(s) {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Code département → code ISO geo.region "FR-XX"
// Entrée : "24" → sortie : "FR-24"
//         "1"  → sortie : "FR-01"  (padding sur 2 chiffres)
//         "2A" → sortie : "FR-2A"  (Corse-du-Sud)
//         "971" → sortie : "FR-971" (Guadeloupe, DOM)
function geoRegionCode(departement) {
  if (!departement) return 'FR';
  const code = String(departement).trim().toUpperCase();
  if (code === '2A' || code === '2B') return `FR-${code}`;
  const num = parseInt(code, 10);
  if (isNaN(num) || num < 1 || num > 976) return 'FR';
  if (num >= 971) return `FR-${num}`;
  return `FR-${String(num).padStart(2, '0')}`;
}


// ─────────────────────────────────────────────
// FONCTION : générer le JSON-LD WebPage
// ─────────────────────────────────────────────
function genererWebPageJsonLd(data, buildDate) {
  const titre = (data.page_title       || '').replace(/"/g, '\\"');
  const desc  = (data.page_description || '').replace(/"/g, '\\"');
  const url   =  data.page_canonical   || '';
  return `{"@context":"https://schema.org","@type":"WebPage","name":"${titre}","description":"${desc}","url":"${url}","inLanguage":"fr-FR","dateModified":"${buildDate}","isPartOf":{"@type":"WebSite","name":"La Marque Française","url":"https://www.lamarquefrancaise.fr"},"publisher":{"@type":"Organization","name":"La Marque Française","url":"https://www.lamarquefrancaise.fr","logo":"https://www.lamarquefrancaise.fr/img/favicon.svg"}}`;
}

// ─────────────────────────────────────────────
// FONCTION : générer le JSON-LD CollectionPage
// ─────────────────────────────────────────────
function genererCollectionPageJsonLd(data, heroCount) {
  const titre    = (data.page_title       || '').replace(/"/g, '\\"');
  const desc     = (data.page_description || '').replace(/"/g, '\\"');
  const url      = data.page_canonical    || '';
  const display  = (data.categorie_display || data.section_titre || '').replace(/"/g, '\\"');
  const sameAs   = data.collection_same_as ? `,"sameAs":"${data.collection_same_as}"` : '';
  const count    = parseInt(heroCount) || 0;
  return `{"@context":"https://schema.org","@type":"CollectionPage","name":"${titre}","description":"${desc}","url":"${url}","numberOfItems":${count},"inLanguage":"fr-FR","about":{"@type":"Thing","name":"${display}"${sameAs}},"isPartOf":{"@type":"WebSite","name":"La Marque Française","url":"https://www.lamarquefrancaise.fr"}}`;
}

// ─────────────────────────────────────────────
// FONCTION : injecter les meta SEO du head depuis le JSON
// + variables hero pilotées par le JSON
// ─────────────────────────────────────────────
function injecterMetaSeo(html, data, heroCount, buildDate) {
  const injections = [
    ['{{PAGE_TITLE}}',       data.page_title        || ''],
    ['{{PAGE_DESCRIPTION}}', data.page_description  || ''],
    ['{{PAGE_CANONICAL}}',   data.page_canonical    || ''],
    ['{{OG_IMAGE}}',         data.og_image          || ''],
    ['{{OG_IMAGE_ALT}}',     data.og_image_alt      || ''],
    ['{{BUILD_DATE}}',       buildDate],

    // Variables Hero pilotées par le JSON
    ['{{HERO_BADGE}}',     data.hero_badge     || ''],
    ['{{HERO_H1_BEFORE}}', data.hero_h1_before || ''],
    ['{{HERO_H1_EM}}',     data.hero_h1_em     || ''],
    ['{{HERO_H1_AFTER}}',  data.hero_h1_after  || ''],
    ['{{HERO_DESC}}',      data.hero_desc      || ''],

    ['{{WEBPAGE_JSON_LD}}',          genererWebPageJsonLd(data, buildDate)],
    ['{{COLLECTION_PAGE_JSON_LD}}', genererCollectionPageJsonLd(data, heroCount)],
  ];
  for (const [marqueur, valeur] of injections) {
    if (html.includes(marqueur)) html = html.replaceAll(marqueur, valeur);
  }
  return html;
}

// ─────────────────────────────────────────────
// FONCTION : générer le fil d'ariane
// ─────────────────────────────────────────────
function genererBreadcrumb(page) {
  // Cas spécial : fiche marque
  if (page.type === 'marque' && page.marque) {
    return `
<div class="breadcrumb-bar">
  <nav aria-label="Fil d'Ariane" class="breadcrumb">
    <a href="/">Accueil</a><span class="breadcrumb-sep">›</span>
    <a href="/${FICHES_MARQUE.CHEMIN}/">${FICHES_MARQUE.LABEL}</a><span class="breadcrumb-sep">›</span>
    <span class="breadcrumb-current" aria-current="page">${echapper(page.marque.nom_societe)}</span>
  </nav>
</div>`;
  }

  const { categorie, sousCategorie } = page;

  // Page d'accueil ou sans catégorie
  if (!categorie) {
    return `
<div class="breadcrumb-bar">
  <nav aria-label="Fil d'Ariane" class="breadcrumb">
    <a href="/">Accueil</a>
  </nav>
</div>`;
  }

  const nomCategorie = CATEGORIES[categorie]?.nom || categorie;

  // Page sous-catégorie
  if (sousCategorie) {
    const parent         = trouverParentPrincipal(sousCategorie);
    const nomSousCat     = trouverNomAffichageSousCat(sousCategorie);
    const slugParent     = parent ? parent.slug : categorie;
    const nomParent      = parent ? parent.nom  : nomCategorie;

    return `
<div class="breadcrumb-bar">
  <nav aria-label="Fil d'Ariane" class="breadcrumb">
    <a href="/">Accueil</a><span class="breadcrumb-sep">›</span>
    <a href="/made-in-france/">Made in France</a><span class="breadcrumb-sep">›</span>
    <a href="/made-in-france/${slugParent}/">${nomParent}</a><span class="breadcrumb-sep">›</span>
    <span class="breadcrumb-current" aria-current="page">${nomSousCat}</span>
  </nav>
</div>`;
  }

  // Page catégorie principale
  return `
<div class="breadcrumb-bar">
  <nav aria-label="Fil d'Ariane" class="breadcrumb">
    <a href="/">Accueil</a><span class="breadcrumb-sep">›</span>
    <a href="/made-in-france/">Made in France</a><span class="breadcrumb-sep">›</span>
    <span class="breadcrumb-current" aria-current="page">${nomCategorie}</span>
  </nav>
</div>`;
}

function genererBreadcrumbJsonLd(page) {
  const base = 'https://lamarquefrancaise.fr';

  // Cas spécial : fiche marque
  if (page.type === 'marque' && page.marque) {
    const items = [
      `{"@type":"ListItem","position":1,"name":"Accueil","item":"${base}/"}`,
      `{"@type":"ListItem","position":2,"name":"${FICHES_MARQUE.LABEL}","item":"${base}/${FICHES_MARQUE.CHEMIN}/"}`,
      `{"@type":"ListItem","position":3,"name":"${echapper(page.marque.nom_societe)}"}`
    ];
    return `{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[${items.join(',')}]}`;
  }

  const { categorie, sousCategorie } = page;

  const items = [
    `{"@type":"ListItem","position":1,"name":"Accueil","item":"${base}/"}`,
    `{"@type":"ListItem","position":2,"name":"Made in France","item":"${base}/made-in-france/"}`
  ];

  if (categorie) {
    if (sousCategorie) {
      const parent     = trouverParentPrincipal(sousCategorie);
      const slugParent = parent ? parent.slug : categorie;
      const nomParent  = parent ? parent.nom  : (CATEGORIES[categorie]?.nom || categorie);
      const nomSousCat = trouverNomAffichageSousCat(sousCategorie);

      items.push(`{"@type":"ListItem","position":3,"name":"${nomParent}","item":"${base}/made-in-france/${slugParent}/"}`);
      items.push(`{"@type":"ListItem","position":4,"name":"${nomSousCat}","item":"${base}/made-in-france/${sousCategorie}/"}`);
    } else {
      const nomCategorie = CATEGORIES[categorie]?.nom || categorie;
      items.push(`{"@type":"ListItem","position":3,"name":"${nomCategorie}","item":"${base}/made-in-france/${categorie}/"}`);
    }
  }

  return `{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[${items.join(',')}]}`;
}

// ─────────────────────────────────────────────
// FONCTION : vérifier si une sous-catégorie a du contenu
// ─────────────────────────────────────────────
async function sousCategorieADuContenu(sc) {
  const nom = sc.nom_supabase;

  const resE = await fetch(
    `${SUPABASE_URL}/rest/v1/entreprises?categories=cs.{${nom}}&select=id&limit=1`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Prefer: 'count=exact' } }
  );
  if (resE.ok) {
    const count = parseInt((resE.headers.get('content-range') || '0/0').split('/')[1]);
    if (count > 0) return true;
  }

  const resP = await fetch(
    `${SUPABASE_URL}/rest/v1/produits?categories=cs.{${nom}}&select=id&limit=1`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Prefer: 'count=exact' } }
  );
  if (resP.ok) {
    const count = parseInt((resP.headers.get('content-range') || '0/0').split('/')[1]);
    if (count > 0) return true;
  }

  return false;
}

// ─────────────────────────────────────────────
// FONCTION : générer les sous-catégories + retourner le nombre visible
// ─────────────────────────────────────────────
async function genererSousCategoriesHtml(categorieSlug, sousCategorieCourante) {
  if (!categorieSlug || !CATEGORIES[categorieSlug]) return { html: '', count: 0 };

  const { sous_categories } = CATEGORIES[categorieSlug];
  if (!sous_categories || !sous_categories.length) return { html: '', count: 0 };

  const resultats = await Promise.all(
    sous_categories.map(async sc => {
      const aContenu = await sousCategorieADuContenu(sc);
      return { ...sc, aContenu };
    })
  );

  const avecContenu = resultats.filter(sc => sc.aContenu);
  if (!avecContenu.length) return { html: '', count: 0 };

  const cartes = avecContenu.map(sc => {
    const estActive    = sc.slug === sousCategorieCourante;
    const classeActive = estActive ? ' active' : '';
    const url          = `/made-in-france/${sc.slug}/`;

    if (estActive) {
      return `
<div class="sc-card${classeActive}" role="listitem" aria-current="page">
  <div class="sc-ph" role="img">
    <picture>
      <source srcset="/img/250x310/avif/${sc.image}.avif" type="image/avif">
      <img src="/img/250x310/webp/${sc.image}.webp" alt="${sc.alt}" width="250" height="310" loading="lazy" decoding="async">
    </picture>
  </div>
  <div class="sc-overlay"></div>
  <div class="sc-label"><span class="sc-name"><h3>${sc.nom_affichage}</h3></span></div>
</div>`;
    }

    return `
<a href="${url}" class="sc-card${classeActive}" role="listitem">
  <div class="sc-ph" role="img">
    <picture>
      <source srcset="/img/250x310/avif/${sc.image}.avif" type="image/avif">
      <img src="/img/250x310/webp/${sc.image}.webp" alt="${sc.alt}" width="250" height="310" loading="lazy" decoding="async">
    </picture>
  </div>
  <div class="sc-overlay"></div>
  <div class="sc-label"><span class="sc-name"><h3>${sc.nom_affichage}</h3></span></div>
</a>`;
  }).join('');

  return { html: cartes, count: avecContenu.length };
}

// ─────────────────────────────────────────────
// FONCTION : générer la SECTION sous-catégories complète
// (titre + sous-titre + grille pilotés par data/<categorie>.json)
// ─────────────────────────────────────────────
async function genererSousCategoriesSection(categorieSlug, sousCategorieCourante, data) {
  const { html: cartesHtml, count } = await genererSousCategoriesHtml(categorieSlug, sousCategorieCourante);

  // Si aucune sous-catégorie avec contenu, on ne rend rien
  if (!cartesHtml || count === 0) {
    return { html: '', count: 0 };
  }

  const label     = data.sous_cat_label      || 'Explorer par type de produit';
  const titre     = data.sous_cat_titre      || 'Sous-catégories';
  const sousTitre = data.sous_cat_sous_titre || '';

  const html = `
<section class="sous-cats" id="sous-categories" aria-labelledby="sc-title">
  <div class="containeur">
    <div class="s-label">${label}</div>
    <h2 class="s-title" id="sc-title">${titre}</h2>
    <div class="s-div" aria-hidden="true"></div>
    ${sousTitre ? `<p class="s-sub">${sousTitre}</p>` : ''}
  </div>
  <div class="sc-wrap" style="max-width:1140px;margin:0 auto;position:relative">
    <div class="sc-grid" id="scGrid" role="list">
      ${cartesHtml}
    </div>
  </div>
</section>`;

  return { html, count };
}

// ─────────────────────────────────────────────
// FONCTION : compter le total de produits de la catégorie
// ─────────────────────────────────────────────
async function compterProduits(nomSupabase) {
  if (!nomSupabase) return '0';
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/produits?categories=cs.{${nomSupabase}}&select=id`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Prefer: 'count=exact' } }
  );
  if (!res.ok) return '0';
  return (res.headers.get('content-range') || '0/0').split('/')[1] || '0';
}

// ─────────────────────────────────────────────
// HELPER : compter les marques d'une catégorie (pour autres-cats)
// ─────────────────────────────────────────────
async function compterMarquesParCategorie(nomSupabase) {
  if (!nomSupabase || !SUPABASE_URL || !SUPABASE_KEY) return 0;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/entreprises?categories=cs.{${encodeURIComponent(nomSupabase)}}&select=id`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Prefer: 'count=exact' } }
    );
    if (!res.ok) return 0;
    return parseInt((res.headers.get('content-range') || '0/0').split('/')[1]) || 0;
  } catch (e) {
    return 0;
  }
}

function resoudreNav(actif) {
  return navHtml.replace(/\{\{NAV_ACTIVE:([^}]+)\}\}/g, (_, slug) => {
    return slug === actif ? ' class="active"' : '';
  });
}

function genererFeatured(m, categorie) {
  const initiales = m.nom_societe.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const badgeVerif = m.verifiee ? '<span class="b-feat-badge-verif">✓ Marque vérifiée</span>' : '';
  const sousCats   = m.categories ? m.categories.filter(c => c !== categorie).join(' · ') : '';
  return `
<article id="brandFeatured" class="b-featured" itemscope itemtype="https://schema.org/Brand" tabindex="0">
  <div class="b-feat-img">
    <span class="b-feat-logo" aria-hidden="true">${initiales}</span>
    <span class="b-feat-badge">⭐ Marque vedette</span>
  </div>
  <div class="b-feat-body">
    <span class="b-feat-tag">${sousCats}</span>
    <p class="b-feat-name" itemprop="name">${m.nom_societe}</p>
    ${badgeVerif}
    <p class="b-feat-desc" itemprop="description">${m.description || ''}</p>
    <div class="b-feat-footer">
      <div style="display:flex;align-items:center;gap:.5rem">
        <div class="b-dot" aria-hidden="true"></div>
        <span class="b-loc">${m.ville} — ${m.region}</span>
      </div>
      ${m.url_site ? `<a href="${m.url_site}" class="b-link" itemprop="url">Découvrir ${m.nom_societe} →</a>` : ''}
    </div>
  </div>
</article>`;
}

function genererGrid(marques, categorie) {
  const cartes = marques.map(m => {
    const initiales = m.nom_societe.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const badgeVerif = m.verifiee ? '<span class="b-ver">✓ Vérifié</span>' : '';
    const sousCats   = m.categories ? m.categories.filter(c => c !== categorie).join(' · ') : '';
    return `
<article class="b-card" role="listitem" itemscope itemtype="https://schema.org/Brand">
  <div class="b-card-head">
    <div class="b-logo" aria-hidden="true">${initiales}</div>
    ${badgeVerif}
  </div>
  <div class="b-meta">
    <p class="b-name" itemprop="name">${m.nom_societe}</p>
    <span class="b-tag">${sousCats}</span>
  </div>
  <p class="b-desc">${m.description || ''}</p>
  <div class="b-footer">
    <div style="display:flex;align-items:center;gap:.42rem">
      <div class="b-dot" aria-hidden="true"></div>
      <span class="b-loc">${m.ville} — ${m.region}</span>
    </div>
    ${m.url_site ? `<a href="${m.url_site}" class="b-link" itemprop="url">Découvrir ${m.nom_societe} →</a>` : ''}
  </div>
</article>`;
  }).join('');
  return `<div id="brandsGrid" class="brands-grid" role="list">${cartes}</div>`;
}

function selectionnerGrille(marques, vedette, limite) {
  const idVedette   = vedette ? vedette.id : null;
  const sansVedette = marques.filter(m => m.id !== idVedette);
  const misEnAvant  = sansVedette.filter(m => m.mis_en_avant === true);
  const autres      = sansVedette.filter(m => m.mis_en_avant !== true);
  if (misEnAvant.length >= limite) return misEnAvant.slice(0, limite);
  return [...misEnAvant, ...autres.slice(0, limite - misEnAvant.length)];
}

function genererLegende(marques) {
  return marques.map((m, i) => {
    const nom  = m.nom_societe || '';
    const mini = m.mini_descriptif || '';
    const loc  = m.ville && m.region ? `${m.ville} — ${m.region}` : (m.ville || m.region || '');
    return `
<div class="leg-item${i === 0 ? ' active' : ''}" data-region="${m.region || ''}">
  <div class="leg-item-top"><div class="leg-dot"></div><h3>${nom}</h3></div>
  ${mini ? `<p>${mini}</p>` : ''}
  ${loc  ? `<span class="leg-tag">${loc}</span>` : ''}
</div>`;
  }).join('');
}

function genererSectionCarte(toutesMarquesCoords, data) {
  if (!toutesMarquesCoords.length) return '';
  const mapDataJs = toutesMarquesCoords.map(m => {
    const lon    = parseFloat(m.longitude);
    const lat    = parseFloat(m.latitude);
    const region = (m.region          || '').replace(/'/g, "\\'");
    const label  = (m.nom_societe     || '').replace(/'/g, "\\'");
    const ville  = (m.ville           || '').replace(/'/g, "\\'");
    const mini   = (m.mini_descriptif || '').replace(/'/g, "\\'");
    return `  { lon: ${lon}, lat: ${lat}, region: '${region}', label: '${label}', ville: '${ville}', mini: '${mini}' }`;
  }).join(',\n');
  const legende = genererLegende(toutesMarquesCoords);
  return `
<section class="carte-section" id="carte" aria-labelledby="carte-title">
  <div class="containeur">
    <div class="s-label">${data.carte_label || 'Terroirs &amp; origines'}</div>
    <h2 class="s-title" id="carte-title">${data.carte_titre || 'Les régions françaises'}</h2>
    <div class="s-div"></div>
    <p class="s-sub">${data.carte_sous_titre || ''}</p>
    <div class="carte-layout">
      <div>
        <div id="map-container"><div id="mapTip" class="map-tip"></div></div>
        <p class="carte-note">${data.carte_note || ''}</p>
      </div>
      <div class="legende-box">
        <div class="legende-track-wrap" id="legWrap">
          <div class="legende-track" id="legTrack">${legende}</div>
        </div>
        <div class="legende-nav">
          <button class="leg-nav-btn" id="legPrev" type="button" aria-label="Région précédente">‹</button>
          <div class="leg-dots" id="legDots"></div>
          <button class="leg-nav-btn" id="legNext" type="button" aria-label="Région suivante">›</button>
        </div>
      </div>
    </div>
  </div>
</section>
<script>
const MAP_DATA = [
${mapDataJs}
];
</script>
<script src="/js/carte.js" defer></script>`;
}

function genererCarteProduit(p) {
  const nom     = p.nom_produit || '';
  const marque  = p.marque || '';
  const region  = p.region || '';
  const urlProd = p.url_produit || '#';
  const imgAvif = p.image_avif || '';
  const imgWebp = p.image_webp || '';
  const altImg  = `${nom} — ${marque}${region ? ', ' + region : ''}`;
  return `
<article class="p-card" role="listitem" itemscope itemtype="https://schema.org/Product">
  <a href="${urlProd}" class="p-card-link" aria-label="${nom}" tabindex="0" target="_blank" rel="noopener">${nom}</a>
  <div class="p-img"><div class="p-img-inner">
    <picture>
      ${imgAvif ? `<source srcset="${imgAvif}" type="image/avif">` : ''}
      <img src="${imgWebp}" alt="${altImg}" width="600" height="600" loading="lazy" decoding="async" itemprop="image">
    </picture>
  </div><div class="p-overlay"><span>Voir le produit →</span></div></div>
  <div class="p-info">
    <div class="p-brand" itemprop="brand" itemscope itemtype="https://schema.org/Brand"><span itemprop="name">${marque}</span></div>
    <h3 class="p-name" itemprop="name">${nom}</h3>
    ${p.prix ? `<div class="p-prix" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
      <span itemprop="price" content="${p.prix}">${p.prix}€</span>
      <meta itemprop="priceCurrency" content="EUR">
      <meta itemprop="availability" content="https://schema.org/InStock">
    </div>` : ''}
    <div class="p-orig"><div class="p-orig-dot"></div><span class="p-orig-lbl">${region}</span></div>
  </div>
</article>`;
}

function genererSectionProduits(produits, data) {
  if (!produits.length) return '';
  const cartes = produits.map(genererCarteProduit).join('');
  return `
<section class="produits-section" id="produits" aria-labelledby="produits-title">
  <div class="containeur">
    <div class="s-label">${data.produits_label || 'Coup de cœur'}</div>
    <h2 class="s-title" id="produits-title">${data.produits_titre || 'Produits à la une'}</h2>
    <div class="s-div"></div>
    <p class="s-sub">${data.produits_sous_titre || ''}</p>
    <div class="products-grid" role="list">${cartes}</div>
    ${data.produits_cta ? `<div style="text-align:center;margin-top:2rem"><button class="btn-ghost" type="button">${data.produits_cta}</button></div>` : ''}
  </div>
</section>`;
}

function genererItemListJsonLd(marques, data) {
  if (!marques.length) return '';
  const items = marques.map((m, i) => {
    const url  = m.url_site || '';
    const nom  = (m.nom_societe || '').replace(/"/g, '\\"');
    const desc = (m.description || m.mini_descriptif || '').replace(/"/g, '\\"');
    return `    {"@type":"ListItem","position":${i + 1},"item":{"@type":"Brand","name":"${nom}","url":"${url}","description":"${desc}"}}`;
  }).join(',\n');
  const nomListe  = (data.section_titre      || '').replace(/"/g, '\\"');
  const descListe = (data.section_sous_titre || '').replace(/"/g, '\\"');
  return `{"@context":"https://schema.org","@type":"ItemList","name":"${nomListe}","description":"${descListe}","itemListElement":[\n${items}\n]}`;
}

function genererFaqJsonLd(data) {
  if (!data.faq || !data.faq.length) return '';
  const items = data.faq.map(item => {
    const q = (item.question || '').replace(/"/g, '\\"');
    const r = (item.reponse  || '').replace(/"/g, '\\"');
    return `  {"@type":"Question","name":"${q}","acceptedAnswer":{"@type":"Answer","text":"${r}"}}`;
  }).join(',\n');
  return `{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[\n${items}\n]}`;
}

function genererFaqHtml(data) {
  if (!data.faq || !data.faq.length) return '';
  const items = data.faq.map((item, i) => {
    const n = i + 1;
    return `
      <div class="faq-item" role="listitem">
        <button class="faq-q" aria-expanded="false" type="button" aria-controls="fa${n}" onclick="toggleFaq(this)">
          <span class="faq-q-text">${item.question || ''}</span>
          <span class="faq-toggle">+</span>
        </button>
        <div class="faq-sep" id="fs${n}"></div>
        <div class="faq-a" id="fa${n}">${item.reponse || ''}</div>
      </div>`;
  }).join('');
  return `
<section class="faq" id="faq" aria-labelledby="faq-title">
  <div class="containeur">
    <div class="s-label">${data.faq_label || 'Questions fréquentes'}</div>
    <h2 class="s-title" id="faq-title">${data.faq_titre || 'Questions fréquentes'}</h2>
    <div class="s-div"></div>
    <p class="s-sub">${data.faq_sous_titre || ''}</p>
    <div class="faq-list" role="list">${items}</div>
  </div>
</section>`;
}

// ─────────────────────────────────────────────
// FONCTION : générer la section TEXTE SEO (h2 + sections H3 + sidebar)
// ─────────────────────────────────────────────
function genererSeoTexteSection(data) {
  const seo = data.seo_texte;
  if (!seo || !seo.h2) return '';

  const label = seo.label || 'Guide & conseils';
  const h2    = seo.h2    || '';

  // Sections H3 + paragraphes
  const sectionsHtml = (seo.sections || []).map(s => `
        <h3>${s.h3 || ''}</h3>
        <p>${s.html || ''}</p>`).join('');

  // Sidebar : sous-catégories populaires
  const sousCatsTitre = seo.sidebar_sous_cats_titre || 'Sous-catégories populaires';
  const sousCatsItems = (seo.sidebar_sous_cats || []).map(item => `
            <li><a href="${item.url}">${item.texte}</a></li>`).join('');

  const sidebarSousCats = (seo.sidebar_sous_cats && seo.sidebar_sous_cats.length) ? `
        <div class="seo-box">
          <h4>${sousCatsTitre}</h4>
          <ul>${sousCatsItems}
          </ul>
        </div>` : '';

  // Sidebar : labels à privilégier
  const labelsTitre = seo.sidebar_labels_titre || 'Labels à privilégier';
  const labelsItems = (seo.sidebar_labels || []).map(l => `
          <div class="lbl-badge">
            <div class="lbl-ico" aria-hidden="true">${l.icone || ''}</div>
            <div class="lbl-info">
              <h5>${l.nom || ''}</h5>
              <p>${l.description || ''}</p>
            </div>
          </div>`).join('');

  const sidebarLabels = (seo.sidebar_labels && seo.sidebar_labels.length) ? `
        <div class="seo-box seo-box-navy">
          <h4>${labelsTitre}</h4>${labelsItems}
        </div>` : '';

  // Aside complète : seulement si au moins un des deux blocs existe
  const sidebarHtml = (sidebarSousCats || sidebarLabels) ? `
      <aside class="seo-sidebar" aria-label="Informations complémentaires">${sidebarSousCats}${sidebarLabels}
      </aside>` : '';

  return `
<section class="seo-section" id="guide" aria-labelledby="seo-title">
  <div class="containeur">
    <div class="seo-layout">
      <div class="seo-content">
        <div class="s-label">${label}</div>
        <h2 id="seo-title">${h2}</h2>${sectionsHtml}
      </div>${sidebarHtml}
    </div>
  </div>
</section>`;
}

// ─────────────────────────────────────────────
// FONCTION : générer le bloc "Autres catégories"
// (auto, avec comptages live, exclut la catégorie courante et les vides)
// ─────────────────────────────────────────────
async function genererAutresCategoriesSection(categorieCourante, data) {
  const label     = data.autres_cat_label      || "Explorer l'annuaire";
  const titre     = data.autres_cat_titre      || 'Toutes les catégories made in France';
  const sousTitre = data.autres_cat_sous_titre || '';

  // Récupérer toutes les catégories sauf la courante
  const entries = Object.entries(CATEGORIES).filter(([slug]) => slug !== categorieCourante);

  // Compter en parallèle les marques de chaque catégorie
  const cartesPromises = entries.map(async ([slug, cat]) => {
    const count = await compterMarquesParCategorie(cat.supabase_categorie || cat.nom);
    // On masque les catégories vides : pas d'intérêt SEO ni UX
    if (count === 0) return null;

    const ancre        = cat.ancre_autres_cat || `Marques françaises ${cat.nom}`;
    const image        = cat.image            || slug;
    const alt          = cat.alt              || `${cat.nom} made in France`;
    const labelMarques = count > 1 ? `${count} marques françaises` : `${count} marque française`;

    return `
      <a href="/made-in-france/${slug}/" class="ac-card" role="listitem" aria-label="${ancre}">
        <div class="ac-ph" role="img">
          <picture>
            <source srcset="/img/250x310/avif/${image}.avif" type="image/avif">
            <img src="/img/250x310/webp/${image}.webp" alt="${alt}" width="250" height="310" loading="lazy" decoding="async">
          </picture>
        </div>
        <div class="ac-overlay" aria-hidden="true"></div>
        <div class="ac-label">
          <h3 class="ac-name">${cat.nom}</h3>
          <span class="ac-count">${labelMarques}</span>
        </div>
      </a>`;
  });

  const cartes = (await Promise.all(cartesPromises)).filter(Boolean).join('');

  // Si aucune autre catégorie n'a de marques, on ne rend pas la section
  if (!cartes) return '';

  return `
<section class="autres-cats" id="autres-categories" aria-labelledby="ac-title">
  <div class="containeur">
    <div class="s-label">${label}</div>
    <h2 class="s-title" id="ac-title">${titre}</h2>
    <div class="s-div" aria-hidden="true"></div>
    ${sousTitre ? `<p class="s-sub">${sousTitre}</p>` : ''}
    <div class="ac-grid" role="list">${cartes}
    </div>
  </div>
</section>`;
}

// ─────────────────────────────────────────────
// FONCTION : générer le CTA Référencer
// ─────────────────────────────────────────────
function genererCtaRefererSection(data) {
  const label       = data.cta_referer_label       || 'Vous êtes une marque française ?';
  const titre       = data.cta_referer_titre       || 'Référencez votre marque gratuitement';
  const description = data.cta_referer_description || '';
  const perks       = data.cta_referer_perks       || [];
  const bouton      = data.cta_referer_bouton      || 'Référencer ma marque →';
  const note        = data.cta_referer_note        || '';

  const perksHtml = perks.map(p => `
        <span class="cta-perk">${p}</span>`).join('');

  return `
<section class="cta-referer" id="referer" aria-labelledby="cta-title">
  <div class="cta-inner">
    <div class="cta-content">
      <div class="s-label">${label}</div>
      <h2 id="cta-title">${titre}</h2>
      <p>${description}</p>
      ${perks.length ? `<div class="cta-perks">${perksHtml}
      </div>` : ''}
    </div>
    <div class="cta-btns">
      <a href="/referencer-votre-marque/" class="btn-p" style="text-decoration:none;display:inline-block">${bouton}</a>
      ${note ? `<span class="cta-note">${note}</span>` : ''}
    </div>
  </div>
</section>`;
}

async function fetchProduits(categorie) {
  const url = `${SUPABASE_URL}/rest/v1/produits?categories=cs.{${categorie}}&select=id,nom_produit,marque,description,categories,prix,mis_en_avant,image_avif,image_webp,url_produit,created_at&order=created_at.desc`;
  const res = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
  if (!res.ok) return [];
  const produits = await res.json();
  if (!produits.length) return [];
  const misEnAvant = produits.filter(p => p.mis_en_avant === true);
  const autres     = produits.filter(p => p.mis_en_avant !== true);
  const selection  = misEnAvant.length >= 8 ? misEnAvant.slice(0, 8) : [...misEnAvant, ...autres.slice(0, 8 - misEnAvant.length)];
  const marquesUniques = [...new Set(selection.map(p => p.marque).filter(Boolean))];
  if (marquesUniques.length) {
    const marquesParam = marquesUniques.map(m => `"${m}"`).join(',');
    const resE = await fetch(
      `${SUPABASE_URL}/rest/v1/entreprises?nom_societe=in.(${marquesParam})&select=nom_societe,region`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    if (resE.ok) {
      const entreprises     = await resE.json();
      const regionParMarque = {};
      entreprises.forEach(e => { regionParMarque[e.nom_societe] = e.region || ''; });
      return selection.map(p => ({ ...p, region: regionParMarque[p.marque] || '' }));
    }
  }
  return selection;
}

async function genererSectionMarques(data) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('⚠️  Variables Supabase manquantes.');
    return { marques: '', carte: '', produits: '', heroCount: '0', produitsCount: '0', itemListJsonLd: '', afficherVedette: false, afficherGrid: false, afficherProduits: false };
  }

  // heroCount : total marques
  const resCount = await fetch(
    `${SUPABASE_URL}/rest/v1/entreprises?categories=cs.{${data.supabase_categorie}}&select=id`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Prefer: 'count=exact' } }
  );
  const heroCount = resCount.ok ? (resCount.headers.get('content-range') || '0/0').split('/')[1] || '0' : '0';

  // produitsCount : total produits
  const produitsCount = await compterProduits(data.supabase_categorie);

  // Marques
  const url = `${SUPABASE_URL}/rest/v1/entreprises?categories=cs.{${data.supabase_categorie}}&select=id,nom_societe,description,mini_descriptif,ville,region,url_site,verifiee,vedette,mis_en_avant,categories,longitude,latitude&order=created_at.desc`;
  const res = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });

  if (!res.ok) {
    console.warn(`⚠️  Erreur Supabase marques (${res.status})`);
    return { marques: '', carte: '', produits: '', heroCount, produitsCount, itemListJsonLd: '', afficherVedette: false, afficherGrid: false, afficherProduits: false };
  }

  const marques = await res.json();
  if (!marques.length) return { marques: '', carte: '', produits: '', heroCount, produitsCount, itemListJsonLd: '', afficherVedette: false, afficherGrid: false, afficherProduits: false };

  const vedette         = marques.find(m => m.vedette === true) || null;
  const grille          = selectionnerGrille(marques, vedette, 6);
  const htmlFeatured    = vedette       ? genererFeatured(vedette, data.supabase_categorie) : '';
  const htmlGrid        = grille.length ? genererGrid(grille, data.supabase_categorie)      : '';
  const afficherVedette = !!htmlFeatured;
  const afficherGrid    = !!htmlGrid;

  const htmlMarques = (afficherVedette || afficherGrid) ? `
<section class="marques-section" id="marques" aria-labelledby="marques-title">
  <div class="containeur">
    <div class="s-label">${data.section_label}</div>
    <h2 class="s-title" id="marques-title">${data.section_titre}</h2>
    <div class="s-div"></div>
    <p class="s-sub">${data.section_sous_titre}</p>
    ${htmlFeatured}
    ${htmlGrid}
    ${afficherGrid ? `<div class="brands-cta"><button class="btn-ghost" type="button">${data.cta_texte}</button></div>` : ''}
  </div>
</section>` : '';

  const marquesAffichees = [vedette, ...grille].filter(Boolean);
  const itemListJsonLd   = genererItemListJsonLd(marquesAffichees, data);

  // Carte
  const urlCarte = `${SUPABASE_URL}/rest/v1/entreprises?categories=cs.{${data.supabase_categorie}}&select=nom_societe,mini_descriptif,ville,region,longitude,latitude&longitude=not.is.null&latitude=not.is.null`;
  const resCarte = await fetch(urlCarte, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
  let toutesMarquesCoords = [];
  if (resCarte.ok) {
    const tm = await resCarte.json();
    toutesMarquesCoords = tm.filter(m => m.longitude && m.latitude && !isNaN(parseFloat(m.longitude)) && !isNaN(parseFloat(m.latitude)));
  }
  const htmlCarte = genererSectionCarte(toutesMarquesCoords, data);

  // Produits
  const produitsData     = await fetchProduits(data.supabase_categorie);
  const htmlProduits     = genererSectionProduits(produitsData, data);
  const afficherProduits = !!htmlProduits;

  return { marques: htmlMarques, carte: htmlCarte, produits: htmlProduits, heroCount, produitsCount, itemListJsonLd, afficherVedette, afficherGrid, afficherProduits };
}

// ═══════════════════════════════════════════════════════════════════
// FICHES MARQUE — Génération des blocs conditionnels selon offre
// ═══════════════════════════════════════════════════════════════════

// Récupérer une marque Supabase par son slug (segment de url_site)
// Compatible avec les formats :
//   - "/annuaire-marques/rucher-marandou/"   (nouveau format relatif avec slash final)
//   - "/annuaire-marques/rucher-marandou"    (sans slash final)
//   - "https://.../annuaire-marques/rucher-marandou"  (ancien format absolu)
async function fetchMarqueParSlug(slug) {
  // Pattern PostgREST "like" : matche tout ce qui contient "/{slug}/" ou se termine par "/{slug}"
  // → on utilise "like.*${slug}*" et on filtre côté JS pour ne garder que les vraies correspondances
  const url = `${SUPABASE_URL}/rest/v1/entreprises?url_site=like.*${encodeURIComponent('/' + slug)}*&select=*`;
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  });
  if (!res.ok) return null;
  const arr = await res.json();
  // Filtrage côté JS : on garde uniquement la marque dont le slug extrait correspond exactement
  // (évite les faux positifs si plusieurs marques contiennent "rucher" dans leur url)
  return arr.find(m => extraireSlugMarque(m.url_site) === slug) || null;
}

// Récupérer les produits d'une marque (par nom_societe)
async function fetchProduitsMarque(nomSociete, limit) {
  const url = `${SUPABASE_URL}/rest/v1/produits?marque=eq.${encodeURIComponent(nomSociete)}&order=mis_en_avant.desc,created_at.desc&limit=${limit}&select=*`;
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  });
  if (!res.ok) return [];
  return await res.json();
}

// Récupérer les marques similaires (au moins une catégorie en commun, hors marque courante)
async function fetchMarquesSimilaires(marque, limit = 3) {
  if (!marque.categories || !Array.isArray(marque.categories) || !marque.categories.length) return [];
  const cats = marque.categories.map(c => `"${c}"`).join(',');
  const url = `${SUPABASE_URL}/rest/v1/entreprises?categories=ov.{${encodeURIComponent(cats)}}&id=neq.${marque.id}&order=verifiee.desc,vedette.desc,created_at.desc&limit=${limit}&select=id,nom_societe,description,ville,region,categories,verifiee,url_site`;
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  });
  if (!res.ok) return [];
  return await res.json();
}

// ─── Génération du HERO_TAGS (catégories + badges conditionnels) ───
function genererHeroTags(marque) {
  const cats = (marque.categories || []).join(' · ');
  let html = `<span class="fm-tag fm-tag-cat">${echapper(cats)}</span>`;
  if (marque.verifiee) html += `<span class="fm-tag fm-tag-verif">✓ Marque vérifiée</span>`;
  if (marque.vedette)  html += `<span class="fm-tag fm-tag-vedette">★ Vedette</span>`;
  return html;
}

// ─── Génération du HERO_META ───
function genererHeroMeta(marque) {
  const items = [];
  if (marque.region)            items.push(['Région', marque.region]);
  if (marque.ville)             items.push(['Ville', `${marque.ville}${marque.departement ? ' · ' + marque.departement : ''}`]);
  if (marque.annee_creation)    items.push(['Fondé en', marque.annee_creation]);
  if (marque.effectifs_societe) items.push(['Effectifs', marque.effectifs_societe]);

  return items.map(([l, v]) => `
        <div class="fm-meta-i">
          <span class="fm-meta-l">${echapper(l)}</span>
          <span class="fm-meta-v">${echapper(v)}</span>
        </div>`).join('');
}

// ─── Génération du HERO_CTA (vide si Gratuit, bouton si Avancé/Premium) ───
function genererHeroCta(marque) {
  if (marque.offre_selectionnee === 'gratuite') return '';
  if (!marque.url_site_internet) return '';
  return `<div class="fm-hero-cta">
        <a href="${echapper(marque.url_site_internet)}" class="btn-p" target="_blank" rel="noopener noreferrer">Visiter le site →</a>
      </div>`;
}

// ─── SECTION DESCRIPTION (+ valeurs si Premium) ───
function genererSectionDescription(marque) {
  const desc = marque.description_page || '';
  if (!desc.trim()) return '';

  const paragraphes = desc.split(/\n\s*\n/).map(p => `<p>${echapper(p.trim())}</p>`).join('\n        ');

  const isPremium = marque.offre_selectionnee === 'premium';
  const valeurs = isPremium && Array.isArray(marque.valeurs) && marque.valeurs.length
    ? marque.valeurs.map(v => `<li>${echapper(v)}</li>`).join('\n          ')
    : '';

  const gridClass = valeurs ? 'fm-desc-grid' : 'fm-desc-grid no-valeurs';
  const blocValeurs = valeurs ? `
      <aside class="fm-valeurs" aria-labelledby="fm-val-t">
        <h3 id="fm-val-t">Valeurs de la marque</h3>
        <ul>
          ${valeurs}
        </ul>
      </aside>` : '';

  return `
<section class="fm-desc" aria-labelledby="fm-desc-t">
  <div class="containeur">
    <div class="s-label">À propos de la marque</div>
    <h2 class="s-title" id="fm-desc-t">À propos de ${echapper(marque.nom_societe)}</h2>
    <div class="s-div" aria-hidden="true"></div>
    <div class="${gridClass}">
      <div class="fm-desc-text">
      ${paragraphes}
      </div>${blocValeurs}
    </div>
  </div>
</section>`;
}

// ─── SECTION HISTOIRE (Premium uniquement, si renseignée) ───
function genererSectionHistoire(marque) {
  if (marque.offre_selectionnee !== 'premium') return '';
  if (!marque.histoire || !marque.histoire.trim()) return '';

  const paragraphes = marque.histoire.split(/\n\s*\n/).map(p => `<p>${echapper(p.trim())}</p>`).join('\n      ');

  return `
<section class="fm-histoire" aria-labelledby="fm-hist-t">
  <div class="containeur">
    <div class="s-label">Notre histoire</div>
    <h2 class="s-title" id="fm-hist-t">L'histoire de ${echapper(marque.nom_societe)}</h2>
    <div class="s-div" aria-hidden="true"></div>
    <div class="fm-histoire-text">
    ${paragraphes}
    </div>
  </div>
</section>`;
}

// ─── SECTION ORIGINES (Avancé + Premium) ───
function genererSectionOrigines(marque) {
  if (marque.offre_selectionnee === 'gratuite') return '';
  const aOrigine = marque.origine_matieres && marque.origine_matieres.trim();
  const aFabrication = marque.fabrication && marque.fabrication.trim();
  if (!aOrigine && !aFabrication) return '';

  let blocOrigine = '';
  if (aOrigine) {
    blocOrigine = `
        <article class="fm-orig-bloc">
          <h3>Origine des matières premières</h3>
          <p>${echapper(marque.origine_matieres)}</p>
        </article>`;
  }

  // Sites multiples ou fallback siège
  let sitesHtml = '';
  let nbSites = 0;
  let departementsUniques = [];
  if (Array.isArray(marque.sites_fabrication) && marque.sites_fabrication.length) {
    sitesHtml = '<ul class="fm-sites">';
    marque.sites_fabrication.forEach(s => {
      sitesHtml += `
            <li>${echapper(s.ville)}${s.departement ? ' · ' + echapper(s.departement) : ''}${s.type ? `<span class="fm-site-type">${echapper(s.type)}</span>` : ''}</li>`;
    });
    sitesHtml += '\n          </ul>';
    nbSites = marque.sites_fabrication.length;
    departementsUniques = [...new Set(marque.sites_fabrication.map(s => s.departement).filter(Boolean))];
  } else if (marque.ville && marque.latitude && marque.longitude) {
    sitesHtml = `<ul class="fm-sites">
            <li>${echapper(marque.ville)}${marque.departement ? ' · ' + echapper(marque.departement) : ''}<span class="fm-site-type">Siège</span></li>
          </ul>`;
    nbSites = 1;
    if (marque.departement) departementsUniques = [marque.departement];
  }

  let blocFabrication = '';
  if (aFabrication || sitesHtml) {
    blocFabrication = `
        <article class="fm-orig-bloc">
          <h3>Lieux de fabrication</h3>
          ${aFabrication ? `<p>${echapper(marque.fabrication)}</p>` : ''}
          ${sitesHtml}
        </article>`;
  }

  const legendeSites = nbSites > 0
    ? `${nbSites} site${nbSites > 1 ? 's' : ''} de fabrication${departementsUniques.length ? ' en ' + departementsUniques.join(' & ') : ''}`
    : '';

  return `
<section class="fm-origines" aria-labelledby="fm-orig-t">
  <div class="containeur">
    <div class="s-label">Origines &amp; fabrication</div>
    <h2 class="s-title" id="fm-orig-t">Origines des matières et lieux de fabrication</h2>
    <div class="s-div" aria-hidden="true"></div>

    <div class="fm-origines-grid">
      <div class="fm-orig-blocs">
      ${blocOrigine}${blocFabrication}
      </div>
      <div class="fm-carte-zone">
        <div id="map-container" role="img" aria-label="Carte des sites de fabrication"><div id="mapTip" class="map-tip"></div></div>
        ${legendeSites ? `<div class="fm-carte-legend">
          <span class="fm-carte-legend-dot" aria-hidden="true"></span>
          <span>${legendeSites}</span>
        </div>` : ''}
      </div>
    </div>
  </div>
</section>`;
}

// ─── SECTION PRODUITS MARQUE (Avancé 5, Premium 20) ───
function genererSectionProduitsMarque(marque, produits) {
  if (marque.offre_selectionnee === 'gratuite') return '';
  if (!produits.length) return '';

  const cartes = produits.map(p => {
    const imgWebp = p.image_webp || '';
    const imgAvif = p.image_avif || '';
    const imgHtml = imgWebp || imgAvif
      ? `<picture>
        ${imgAvif ? `<source srcset="${echapper(imgAvif)}" type="image/avif">` : ''}
        <img src="${echapper(imgWebp || imgAvif)}" alt="${echapper(p.nom_produit)} — ${echapper(p.marque)}" width="600" height="600" loading="lazy" decoding="async" itemprop="image">
      </picture>`
      : `<div class="p-img-placeholder">Image à venir</div>`;
    const prixHtml = p.prix ? `<div class="p-prix" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
        <span itemprop="price" content="${echapper(String(p.prix).replace(/[^0-9.,]/g,'').replace(',','.'))}">${echapper(p.prix)}€</span>
        <meta itemprop="priceCurrency" content="EUR">
      </div>` : '';

    return `
      <article class="p-card" role="listitem" itemscope itemtype="https://schema.org/Product">
        <a href="${echapper(p.url_produit || '#')}" class="p-card-link" target="_blank" rel="noopener noreferrer" aria-label="${echapper(p.nom_produit)}">${echapper(p.nom_produit)}</a>
        <div class="p-img"><div class="p-img-inner">
          ${imgHtml}
        </div><div class="p-overlay"><span>Voir le produit →</span></div></div>
        <div class="p-info">
          <div class="p-brand" itemprop="brand" itemscope itemtype="https://schema.org/Brand"><span itemprop="name">${echapper(p.marque)}</span></div>
          <h3 class="p-name" itemprop="name">${echapper(p.nom_produit)}</h3>
          ${prixHtml}
          ${marque.region ? `<div class="p-orig"><div class="p-orig-dot"></div><span class="p-orig-lbl">${echapper(marque.region)}</span></div>` : ''}
        </div>
      </article>`;
  }).join('');

  return `
<section class="produits-section" aria-labelledby="prod-t">
  <div class="containeur">
    <div class="s-label">Produits phares</div>
    <h2 class="s-title" id="prod-t">La sélection ${echapper(marque.nom_societe)}</h2>
    <div class="s-div" aria-hidden="true"></div>
    <p class="s-sub">Découvrez les produits directement sur le site de la marque.</p>
    <div class="products-grid" role="list">
      ${cartes}
    </div>
  </div>
</section>`;
}

// ─── SECTION LABELS (toutes offres, si labels[] non vide) ───
function genererSectionLabels(marque) {
  if (!Array.isArray(marque.labels) || !marque.labels.length) return '';
  const chips = marque.labels.map(l => `<span class="fm-chip">${echapper(l)}</span>`).join('\n        ');
  return `
<section class="fm-labels" aria-labelledby="fm-lab-t">
  <div class="containeur">
    <div class="s-label">Reconnaissance &amp; engagement</div>
    <h2 class="s-title" id="fm-lab-t">Labels &amp; certifications</h2>
    <div class="s-div" aria-hidden="true"></div>
    <div class="fm-labels-grid">
      ${chips}
    </div>
  </div>
</section>`;
}

// ─── SECTION CTA FINAL (Avancé + Premium) ───
function genererSectionCtaFinal(marque) {
  if (marque.offre_selectionnee === 'gratuite') return '';
  if (!marque.url_site_internet) return '';

  let domaine = marque.url_site_internet;
  try {
    domaine = new URL(marque.url_site_internet).hostname.replace(/^www\./, '');
  } catch(e) { /* fallback : URL brute */ }

  return `
<section class="fm-cta" aria-labelledby="fm-cta-t">
  <div class="containeur">
    <div class="fm-cta-content">
      <h2 id="fm-cta-t">Découvrir <em>${echapper(marque.nom_societe)}</em> sur leur site</h2>
      <p>Commande directe auprès de la marque. Vous soutenez une entreprise française à chaque achat.</p>
    </div>
    <a href="${echapper(marque.url_site_internet)}" class="btn-p" target="_blank" rel="noopener noreferrer">Visiter ${echapper(domaine)} →</a>
  </div>
</section>`;
}

// ─── SECTION MARQUES SIMILAIRES (toutes offres, si ≥1 résultat) ───
function genererSectionSimilaires(similaires) {
  if (!similaires.length) return '';
  const cartes = similaires.map(s => {
    const initiales = genererInitiales(s.nom_societe);
    const slug = extraireSlugMarque(s.url_site);
    const href = slug ? `/${FICHES_MARQUE.CHEMIN}/${slug}/` : '#';
    const verif = s.verifiee ? `<span class="b-ver">✓ Vérifié</span>` : '';
    const cat = (s.categories || [])[0] || '';
    const desc = (s.description || '').slice(0, 140);
    return `
      <a href="${href}" class="b-card" role="listitem" itemscope itemtype="https://schema.org/Brand">
        <div class="b-card-head">
          <div class="b-logo" aria-hidden="true">${initiales}</div>
          ${verif}
        </div>
        <div class="b-meta">
          <p class="b-name" itemprop="name">${echapper(s.nom_societe)}</p>
          ${cat ? `<span class="b-tag">${echapper(cat)}</span>` : ''}
        </div>
        <p class="b-desc">${echapper(desc)}</p>
        <div class="b-footer">
          <div style="display:flex;align-items:center;gap:.42rem">
            <div class="b-dot" aria-hidden="true"></div>
            <span class="b-loc">${echapper(s.ville || '')}${s.region ? ' — ' + echapper(s.region) : ''}</span>
          </div>
          <span class="b-link">Découvrir →</span>
        </div>
      </a>`;
  }).join('');

  return `
<section class="fm-similaires" aria-labelledby="fm-sim-t">
  <div class="containeur">
    <div class="s-label">Vous aimerez aussi</div>
    <h2 class="s-title" id="fm-sim-t">D'autres marques françaises à découvrir</h2>
    <div class="s-div" aria-hidden="true"></div>
    <div class="brands-grid" role="list">
    ${cartes}
    </div>
  </div>
</section>`;
}

// ─── MAP_DATA pour la carte d3 ───
function genererMapDataScript(marque) {
  if (marque.offre_selectionnee === 'gratuite') return '';
  let points = [];
  if (Array.isArray(marque.sites_fabrication) && marque.sites_fabrication.length) {
    points = marque.sites_fabrication
      .filter(s => s.lat && s.lng)
      .map(s => ({
        lon: parseFloat(s.lng),
        lat: parseFloat(s.lat),
        region: marque.region || '',
        label: `${s.ville || ''}${s.type ? ' — ' + s.type : ''}`
      }));
  } else if (marque.latitude && marque.longitude) {
    points = [{
      lon: parseFloat(marque.longitude),
      lat: parseFloat(marque.latitude),
      region: marque.region || '',
      label: `${marque.ville || ''} — Siège`
    }];
  }
  if (!points.length) return '';
  return `<script>const MAP_DATA = ${JSON.stringify(points)};</script>`;
}

// ─── JSON-LD marque ───
function genererJsonLdMarque(marque, produits) {
  const base = 'https://lamarquefrancaise.fr';
  const slug = extraireSlugMarque(marque.url_site);
  const pageUrl = `${base}/${FICHES_MARQUE.CHEMIN}/${slug}/`;

  const localBusiness = {
    "@context":"https://schema.org",
    "@type":"LocalBusiness",
    "name": marque.nom_societe,
    "description": marque.description || marque.mini_descriptif || '',
    "url": pageUrl,
    "address": {
      "@type":"PostalAddress",
      ...(marque.ville && { "addressLocality": marque.ville }),
      ...(marque.region && { "addressRegion": marque.region }),
      "addressCountry": "FR"
    },
    "areaServed":"FR",
    "inLanguage":"fr",
    ...(marque.annee_creation && { "foundingDate": String(marque.annee_creation) }),
    ...(marque.url_site_internet && { "sameAs": marque.url_site_internet })
  };

  const brand = {
    "@context":"https://schema.org",
    "@type":"Brand",
    "name": marque.nom_societe,
    ...(marque.url_site_internet && { "url": marque.url_site_internet })
  };

  const parts = [JSON.stringify(localBusiness), JSON.stringify(brand)];

  if (produits.length && marque.offre_selectionnee !== 'gratuite') {
    const itemList = {
      "@context":"https://schema.org",
      "@type":"ItemList",
      "name": `Produits ${marque.nom_societe}`,
      "itemListElement": produits.map((p, i) => ({
        "@type":"ListItem",
        "position": i + 1,
        "item": {
          "@type":"Product",
          "name": p.nom_produit,
          "brand": p.marque,
          ...(p.prix && {
            "offers": {
              "@type":"Offer",
              "price": String(p.prix).replace(/[^0-9.,]/g,'').replace(',', '.'),
              "priceCurrency": "EUR"
            }
          })
        }
      }))
    };
    parts.push(JSON.stringify(itemList));
  }

  return parts.join(',');
}

// ─── CSS critique inline pour le hero fiche marque (LCP) ───
function getFicheHeroCritique() {
  return `.fm-hero{background:var(--navy);position:relative;overflow:hidden;padding:4rem 2rem}
.fm-hero::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(184,150,62,.04) 59px,rgba(184,150,62,.04) 60px);pointer-events:none}
.fm-hero::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,var(--gold),transparent)}
.fm-hero .containeur{position:relative;z-index:1}
.fm-hero-logo{position:absolute;left:-180px;top:50%;transform:translateY(-50%);width:160px;height:160px;background:rgba(255,255,255,.04);border:1px solid rgba(184,150,62,.3);display:flex;align-items:center;justify-content:center;color:var(--gold-l);font-family:Georgia,'Times New Roman',serif;font-size:3rem;letter-spacing:.05em;flex-shrink:0}
.fm-hero-content{max-width:760px}
.fm-hero h1{font-family:Georgia,'Times New Roman',serif;font-size:clamp(2rem,4.5vw,3.2rem);color:var(--white);font-weight:normal;line-height:1.1;letter-spacing:.02em;margin-bottom:.75rem}
@media(max-width:1280px){.fm-hero-logo{position:relative;left:auto;top:auto;transform:none;margin-bottom:1.5rem}}
@media(max-width:768px){.fm-hero{padding:3rem 1.25rem 2.5rem}.fm-hero-logo{width:110px;height:110px;font-size:2rem;margin-bottom:1.25rem}}
.fm-desc{background:var(--cream);padding:5rem 2rem}
.fm-desc-grid{display:grid;grid-template-columns:1.7fr 1fr;gap:3.5rem;align-items:start;margin-top:3rem}
.fm-desc-grid.no-valeurs{grid-template-columns:1fr;max-width:780px}
.fm-desc-text p{font-family:Arial,sans-serif;font-size:.95rem;color:var(--muted);line-height:1.85;font-weight:300;margin-bottom:1.1rem}
.fm-desc-text p:last-child{margin-bottom:0}
@media(max-width:768px){.fm-desc{padding:3.5rem 1.25rem}.fm-desc-grid{grid-template-columns:1fr;gap:2rem;margin-top:2rem}}
.skip-link{position:absolute;top:-50px;left:1rem;background:var(--gold);color:var(--white);padding:.5rem 1rem;font-family:Arial,sans-serif;font-size:.85rem;text-decoration:none;z-index:999;transition:top .2s}.skip-link:focus{top:.5rem}`;
}

// ─── ORCHESTRATEUR — Génère une fiche marque complète ───
async function genererFicheMarque(marque) {
  const slug = extraireSlugMarque(marque.url_site);
  if (!slug) {
    console.warn(`⚠️  Marque ${marque.nom_societe} : url_site invalide, skip.`);
    return null;
  }

  const offre = marque.offre_selectionnee || 'gratuite';
  const limitProduits = offre === 'premium' ? 20 : (offre === 'avance' ? 5 : 0);

  // Récupération données dépendantes en parallèle
  const [produits, similaires] = await Promise.all([
    limitProduits > 0 ? fetchProduitsMarque(marque.nom_societe, limitProduits) : Promise.resolve([]),
    fetchMarquesSimilaires(marque, 3)
  ]);

  // Construction des variables SEO
  const base = 'https://lamarquefrancaise.fr';
  const pageUrl = `${base}/${FICHES_MARQUE.CHEMIN}/${slug}/`;
  const titleSeo = `${marque.nom_societe} — Marque française ${(marque.categories || []).join(' · ')} | La Marque Française`;
  const descSeo = (marque.description || marque.mini_descriptif || '').slice(0, 160);

  // Construction des sections conditionnelles
  const sectionDescription = genererSectionDescription(marque);
  const sectionHistoire    = genererSectionHistoire(marque);
  const sectionOrigines    = genererSectionOrigines(marque);
  const sectionProduits    = genererSectionProduitsMarque(marque, produits);
  const sectionLabels      = genererSectionLabels(marque);
  const sectionCtaFinal    = genererSectionCtaFinal(marque);
  const sectionSimilaires  = genererSectionSimilaires(similaires);

  // Variables carte (chargées uniquement si origines affichées)
  const carteAffichee = sectionOrigines !== '';
  const mapDataScript = carteAffichee ? genererMapDataScript(marque) : '';
  // d3 et topojson sont chargés en lazy par carte-fiche.js (via IntersectionObserver)
  // → pas de <script src=cdnjs> dans le head, gain de ~280 Ko bloquants
  const carteLibs = '';
  const carteCssLink = carteAffichee
    ? `<link rel="preload" href="/css/carte-france-et-legende.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/css/carte-france-et-legende.css"></noscript>`
    : '';
  // preconnect cdnjs uniquement si la carte est affichée (anticipe le lazy load d3)
  const cartePreconnect = carteAffichee
    ? `<link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>`
    : '';
  const carteScript = carteAffichee
    ? `<script src="/js/components/carte-fiche.js" defer></script>`
    : '';

  // CSS des cartes marques (.b-card) : uniquement si la section similaires est rendue
  const marquesGridCssFiche = sectionSimilaires
    ? marquesSectionCss + marquesGridCss
    : '';

  // Faux objet "page" pour réutiliser genererBreadcrumb*
  const pageFictive = { type: 'marque', marque };

  // Remplacements
  let html = pageMarqueTemplate;
  const remplacements = [
    ['{{PAGE_TITLE}}',             echapper(titleSeo)],
    ['{{PAGE_DESCRIPTION}}',       echapper(descSeo)],
    ['{{PAGE_CANONICAL}}',         pageUrl],
    ['{{OG_TITLE}}',               echapper(titleSeo)],
    ['{{OG_DESC}}',                echapper(descSeo)],
    ['{{OG_URL}}',                 pageUrl],
    ['{{GEO_REGION}}',             geoRegionCode(marque.departement)],
    ['{{GEO_PLACENAME}}',          echapper(marque.region || '')],
    ['{{ORGANIZATION_JSON_LD}}',   organizationJsonLd],
    ['{{BREADCRUMB}}',             genererBreadcrumb(pageFictive)],
    ['{{BREADCRUMB_JSON_LD}}',     genererBreadcrumbJsonLd(pageFictive)],
    ['{{JSON_LD_MARQUE}}',         genererJsonLdMarque(marque, produits)],
    ['{{NAV}}',                    resoudreNav('')],
    ['{{FOOTER}}',                 footerHtml],
    ['{{GLOBAL_CSS}}',             globalCss],
    ['{{NAV_CSS}}',                navCss],
    ['{{BREADCRUMB_CSS}}',         breadcrumbCss],
    ['{{FICHE_HERO_CRITIQUE_CSS}}', getFicheHeroCritique()],
    ['{{MARQUES_GRID_CSS_FICHE}}', marquesGridCssFiche],
    ['{{FOOTER_CSS}}',             footerCss],
    ['{{CARTE_PRECONNECT}}',       cartePreconnect],
    ['{{CARTE_LIBS}}',             carteLibs],
    ['{{CARTE_CSS_FICHE}}',        carteCssLink],
    ['{{LOGO_INITIALES}}',         genererInitiales(marque.nom_societe)],
    ['{{HERO_TAGS}}',              genererHeroTags(marque)],
    ['{{NOM_SOCIETE}}',            echapper(marque.nom_societe)],
    ['{{MINI_DESCRIPTIF}}',        echapper(marque.mini_descriptif || '')],
    ['{{HERO_META}}',              genererHeroMeta(marque)],
    ['{{HERO_CTA}}',               genererHeroCta(marque)],
    ['{{SECTION_DESCRIPTION}}',    sectionDescription],
    ['{{SECTION_HISTOIRE}}',       sectionHistoire],
    ['{{SECTION_ORIGINES}}',       sectionOrigines],
    ['{{SECTION_PRODUITS_MARQUE}}', sectionProduits],
    ['{{SECTION_LABELS}}',         sectionLabels],
    ['{{SECTION_CTA_FINAL}}',      sectionCtaFinal],
    ['{{SECTION_SIMILAIRES}}',     sectionSimilaires],
    ['{{MAP_DATA_SCRIPT}}',        mapDataScript],
    ['{{CARTE_SCRIPT_FICHE}}',     carteScript],
    ['{{MENU_BURGER_JS}}',         menuBurgerJs],
    ['{{EMAIL_OBFUSQUE_JS}}',      ''],
    ['{{ANALYTICS_JS}}',           analyticsJs]
  ];

  for (const [marqueur, contenu] of remplacements) {
    html = html.replaceAll(marqueur, contenu);
  }

  return { html, slug };
}

// ─── Scanner les fiches marque à (re)builder ───
async function buildFichesMarques() {
  const dossierRacine = path.join(__dirname, FICHES_MARQUE.CHEMIN);
  if (!fs.existsSync(dossierRacine)) {
    console.log(`ℹ️  Aucun dossier ${FICHES_MARQUE.CHEMIN}/, étape skipée.`);
    return [];
  }

  const slugsTraites = [];
  const sousDossiers = fs.readdirSync(dossierRacine, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  let buildes = 0;
  let skippes = 0;

  for (const slug of sousDossiers) {
    const fichierIndex = path.join(dossierRacine, slug, 'index.html');
    if (!fs.existsSync(fichierIndex)) {
      console.warn(`⚠️  ${FICHES_MARQUE.CHEMIN}/${slug}/ : pas de index.html, skip.`);
      continue;
    }

    const contenuActuel = fs.readFileSync(fichierIndex, 'utf8');
    // Détection des marqueurs : si aucun {{...}} → on ne touche pas
    if (!/\{\{[A-Z_]+\}\}/.test(contenuActuel)) {
      console.log(`⏭️  ${FICHES_MARQUE.CHEMIN}/${slug}/ : déjà buildé, skip.`);
      skippes++;
      slugsTraites.push(slug);  // on garde pour le sitemap
      continue;
    }

    // Récupération de la marque sur Supabase
    const marque = await fetchMarqueParSlug(slug);
    if (!marque) {
      console.warn(`⚠️  ${FICHES_MARQUE.CHEMIN}/${slug}/ : marque introuvable dans Supabase.`);
      continue;
    }

    try {
      const result = await genererFicheMarque(marque);
      if (!result) continue;
      fs.writeFileSync(fichierIndex, result.html, 'utf8');
      console.log(`✅ ${FICHES_MARQUE.CHEMIN}/${slug}/`);
      buildes++;
      slugsTraites.push(slug);
    } catch (e) {
      console.error(`❌ ${FICHES_MARQUE.CHEMIN}/${slug}/ : ${e.message}`);
    }
  }

  console.log(`\nFiches marque : ${buildes} construite(s), ${skippes} skippée(s).`);
  return slugsTraites;
}

// ─────────────────────────────────────────────
// FONCTION : récupérer la date du dernier commit Git pour un fichier
// Retourne 'YYYY-MM-DD' ou null si Git indisponible / fichier non commité
// ─────────────────────────────────────────────
const _gitDateCache = new Map();
function getLastModFromGit(relativePath) {
  if (_gitDateCache.has(relativePath)) return _gitDateCache.get(relativePath);

  try {
    // %cs = committer date au format short ISO (YYYY-MM-DD)
    // -1 = dernier commit uniquement
    const stdout = execSync(
      `git log -1 --format=%cs -- "${relativePath}"`,
      { cwd: __dirname, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    ).trim();
    const date = /^\d{4}-\d{2}-\d{2}$/.test(stdout) ? stdout : null;
    _gitDateCache.set(relativePath, date);
    return date;
  } catch (e) {
    _gitDateCache.set(relativePath, null);
    return null;
  }
}

// ─────────────────────────────────────────────
// FONCTION : générer le sitemap.xml à partir des pages marquées sitemap: true
// + des fiches marque présentes
// Le <lastmod> de chaque URL utilise la date du dernier commit Git du fichier
// source, avec fallback sur la date du build si Git indisponible.
// ─────────────────────────────────────────────
function genererSitemap(slugsMarques = []) {
  const base = 'https://lamarquefrancaise.fr';
  const buildDate = new Date().toISOString().split('T')[0];

  // Compteurs pour le diagnostic
  let nbAvecGit = 0;
  let nbFallback = 0;

  // URLs des pages statiques
  const urlsPages = PAGES
    .filter(page => page.sitemap === true)
    .map(page => {
      // Convertir 'index.html' → '/' et 'foo/index.html' → '/foo/'
      let loc = page.fichier.replace(/index\.html$/, '');
      if (!loc.startsWith('/')) loc = '/' + loc;

      const lastmod = getLastModFromGit(page.fichier) || buildDate;
      if (getLastModFromGit(page.fichier)) nbAvecGit++; else nbFallback++;

      return `  <url>
    <loc>${base}${loc}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
    });

  // URLs des fiches marque
  const urlsMarques = slugsMarques.map(slug => {
    const cheminSource = `${FICHES_MARQUE.CHEMIN}/${slug}/index.html`;
    const lastmod = getLastModFromGit(cheminSource) || buildDate;
    if (getLastModFromGit(cheminSource)) nbAvecGit++; else nbFallback++;

    return `  <url>
    <loc>${base}/${FICHES_MARQUE.CHEMIN}/${slug}/</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
  });

  const urls = [...urlsPages, ...urlsMarques].join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  const cheminSitemap = path.join(__dirname, 'sitemap.xml');
  fs.writeFileSync(cheminSitemap, sitemap, 'utf8');
  const nbUrls = PAGES.filter(p => p.sitemap === true).length + slugsMarques.length;
  console.log(`✅ sitemap.xml généré (${nbUrls} URL${nbUrls > 1 ? 's' : ''}, ${nbAvecGit} via Git, ${nbFallback} fallback build date)`);
  if (nbFallback > 0 && nbAvecGit === 0) {
    console.warn(`⚠️  Aucune date Git récupérée. Vérifie que le repo est cloné avec l'historique complet (fetch-depth: 0 dans GitHub Actions).`);
  }
}

// ─────────────────────────────────────────────
// BUILD PRINCIPAL
// ─────────────────────────────────────────────
async function build() {
  let succes = 0;

  for (const page of PAGES) {
    const chemin = path.join(__dirname, page.fichier);
    if (!fs.existsSync(chemin)) {
      console.warn(`⚠️  Fichier introuvable, ignoré : ${page.fichier}`);
      continue;
    }

    let html = fs.readFileSync(chemin, 'utf8');

    // CSS et JS statiques
    const injectionsCss = [
      ['{{GLOBAL_CSS}}',            globalCss],
      ['{{NAV_CSS}}',               navCss],
      ['{{BREADCRUMB_CSS}}',        breadcrumbCss],
      ['{{HERO_CATEGORIES_CSS}}',   heroCategorieCss],
      ['{{HERO_LEGAL_CSS}}',        heroLegalCss],
      ['{{SOUS_CATEGORIES_CSS}}',   sousCategorieCss],
      ['{{SEO_TEXTE_CATE_CSS}}',    seoTextCateCss],
      ['{{FAQ_CSS}}',               faqCss],
      ['{{AUTRE_CATE_CSS}}',        autresCateCss],
      ['{{BANDEAU_CTA_CSS}}',       bandeauCtaCss],
      ['{{FOOTER_CSS}}',            footerCss],
      ['{{ORGANIZATION_JSON_LD}}',  organizationJsonLd],
      ['{{MENU_BURGER_JS}}',        menuBurgerJs],
      ['{{FAQ_JS}}',                faqJs],
      ['{{EMAIL_OBFUSQUE_JS}}',     emailObfusqueJs],
      ['{{ANALYTICS_JS}}',          analyticsJs],



    ];
    for (const [marqueur, contenu] of injectionsCss) {
      if (html.includes(marqueur)) html = html.replace(marqueur, contenu);
      else console.warn(`⚠️  Marqueur ${marqueur} absent dans : ${page.fichier}`);
    }

    // Nav + Footer
    if (html.includes('{{NAV}}'))    html = html.replace('{{NAV}}',    resoudreNav(page.actif));
    if (html.includes('{{FOOTER}}')) html = html.replace('{{FOOTER}}', footerHtml);

    // ── Fil d'ariane ─────────────────────────────────────────
    if (html.includes('{{BREADCRUMB}}')) {
      html = html.replace('{{BREADCRUMB}}', genererBreadcrumb(page));
    }
    if (html.includes('{{BREADCRUMB_JSON_LD}}')) {
      html = html.replace('{{BREADCRUMB_JSON_LD}}', genererBreadcrumbJsonLd(page));
    }

    // ── Chargement du data JSON (utilisé par plusieurs sections) ──
    const dataPath = path.join(__dirname, `data/${page.actif}.json`);
    const aDataJson = page.actif && fs.existsSync(dataPath);
    const data = aDataJson ? JSON.parse(fs.readFileSync(dataPath, 'utf8')) : {};

    // ── Section sous-catégories complète ─────────────────────
    if (html.includes('{{SOUS_CATEGORIES_SECTION}}')) {
      const { html: scSection, count: scCount } = await genererSousCategoriesSection(
        page.categorie, page.sousCategorie, data
      );
      html = html.replace('{{SOUS_CATEGORIES_SECTION}}', scSection);

      // Compteur dans le hero
      html = html.replace(
        /<strong id="sousCategCount">[^<]*<\/strong>/,
        `<strong id="sousCategCount">${scCount}</strong>`
      );
      html = html.replace('{{SOUS_CAT_LABEL}}', scCount > 1 ? 'sous-catégories' : 'sous-catégorie');
    }

    // ── Sections Supabase + sections refactorées ─────────────
    if (html.includes('{{MARQUES_SECTION}}')) {
      if (aDataJson && page.categorie) {
        const { marques, carte, produits, heroCount, produitsCount, itemListJsonLd, afficherVedette, afficherGrid, afficherProduits } = await genererSectionMarques(data);

        const afficherSection = afficherVedette || afficherGrid;

        html = html.replace('{{MARQUES_SECTION}}',    marques);
        html = html.replace('{{CARTE_SECTION}}',      carte);
        html = html.replace('{{PRODUITS_SECTION}}',   produits);

        html = html.replace('{{MARQUES_SECTION_CSS}}', afficherSection  ? marquesSectionCss  : '');
        html = html.replace('{{MARQUE_VEDETTE_CSS}}',  afficherVedette  ? marqueVedetteCss   : '');
        html = html.replace('{{MARQUES_GRID_CSS}}',    afficherGrid     ? marquesGridCss     : '');
        html = html.replace('{{CARTE_CSS}}',           carte            ? carteCss           : '');
        html = html.replace('{{PRODUITS_CSS}}',        afficherProduits ? produitsSectionCss : '');

        html = html.replace('{{ITEMLIST_JSON_LD}}', itemListJsonLd);
        html = html.replace('{{FAQ_JSON_LD}}',      genererFaqJsonLd(data));
        html = html.replace('{{FAQ_SECTION}}',      genererFaqHtml(data));

        // Sections refactorées
        html = html.replace('{{SEO_TEXTE_SECTION}}',         genererSeoTexteSection(data));
        html = html.replace('{{AUTRES_CATEGORIES_SECTION}}', await genererAutresCategoriesSection(page.categorie, data));
        html = html.replace('{{CTA_REFERER_SECTION}}',       genererCtaRefererSection(data));

        // heroCount : marques référencées
        html = html.replace(
          /<strong id="heroCount">[^<]*<\/strong>/,
          `<strong id="heroCount">${heroCount}</strong>`
        );
        html = html.replace('{{MARQUES_LABEL}}', parseInt(heroCount) > 1 ? 'marques référencées' : 'marque référencée');

        // produitsCount : produits référencés
        html = html.replace(
          /<strong id="produitsCount">[^<]*<\/strong>/,
          `<strong id="produitsCount">${produitsCount}</strong>`
        );
        html = html.replace('{{PRODUITS_LABEL}}', parseInt(produitsCount) > 1 ? 'produits référencés' : 'produit référencé');

        // Injection meta SEO + variables hero + JSON-LD
        const buildDate = new Date().toISOString().split('T')[0];
        html = injecterMetaSeo(html, data, heroCount, buildDate);

      } else {
        // Pages sans data JSON : on nettoie tous les marqueurs résiduels
        const marqueurs = [
          '{{MARQUES_SECTION}}','{{CARTE_SECTION}}','{{PRODUITS_SECTION}}',
          '{{SEO_TEXTE_SECTION}}','{{AUTRES_CATEGORIES_SECTION}}','{{CTA_REFERER_SECTION}}',
          '{{MARQUES_SECTION_CSS}}','{{MARQUE_VEDETTE_CSS}}','{{MARQUES_GRID_CSS}}',
          '{{CARTE_CSS}}','{{PRODUITS_CSS}}',
          '{{ITEMLIST_JSON_LD}}','{{FAQ_JSON_LD}}','{{FAQ_SECTION}}',
          '{{WEBPAGE_JSON_LD}}','{{COLLECTION_PAGE_JSON_LD}}',
          '{{PAGE_TITLE}}','{{PAGE_DESCRIPTION}}','{{PAGE_CANONICAL}}',
          '{{OG_IMAGE}}','{{OG_IMAGE_ALT}}','{{BUILD_DATE}}',
          '{{HERO_BADGE}}','{{HERO_H1_BEFORE}}','{{HERO_H1_EM}}','{{HERO_H1_AFTER}}','{{HERO_DESC}}',
          '{{MARQUES_LABEL}}','{{PRODUITS_LABEL}}','{{SOUS_CAT_LABEL}}'
        ];
        marqueurs.forEach(m => { html = html.replaceAll(m, ''); });
        if (page.actif) console.warn(`⚠️  Pas de fichier data/${page.actif}.json — sections supprimées.`);
      }
    }

    fs.writeFileSync(chemin, html, 'utf8');
    console.log(`✅ ${page.fichier}`);
    succes++;
  }

  console.log(`\nBuild terminé : ${succes} page(s) standard traitée(s).`);

  // ───── Build des fiches marque ─────
  const slugsMarques = await buildFichesMarques();

  // ───── Génération du sitemap.xml (incluant les fiches marque) ─────
  genererSitemap(slugsMarques);
}

build();