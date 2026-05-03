// build.js
// Lance avec : node build.js

const fs   = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

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
const organizationJsonLd = fs.readFileSync(path.join(__dirname, 'js/Organization-json-ld.json'), 'utf8');
const menuBurgerJs       = fs.readFileSync(path.join(__dirname, 'js/components/menu-burger.js'), 'utf8');
const faqJs              = fs.readFileSync(path.join(__dirname, 'js/components/faq.js'), 'utf8');
const emailObfusqueJs    = fs.readFileSync(path.join(__dirname, 'js/components/email-obfusque.js'), 'utf8');
const analyticsJs        = fs.readFileSync(path.join(__dirname, 'js/components/analytics.js'), 'utf8');




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
  const { categorie, sousCategorie } = page;
  const base = 'https://lamarquefrancaise.fr';

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

// ─────────────────────────────────────────────
// FONCTION : générer le sitemap.xml à partir des pages marquées sitemap: true
// ─────────────────────────────────────────────
function genererSitemap() {
  const base = 'https://lamarquefrancaise.fr';
  const buildDate = new Date().toISOString().split('T')[0];

  const urls = PAGES
    .filter(page => page.sitemap === true)
    .map(page => {
      // Convertir 'index.html' → '/' et 'foo/index.html' → '/foo/'
      let loc = page.fichier.replace(/index\.html$/, '');
      if (!loc.startsWith('/')) loc = '/' + loc;
      return `  <url>
    <loc>${base}${loc}</loc>
    <lastmod>${buildDate}</lastmod>
  </url>`;
    })
    .join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  const cheminSitemap = path.join(__dirname, 'sitemap.xml');
  fs.writeFileSync(cheminSitemap, sitemap, 'utf8');
  const nbUrls = PAGES.filter(p => p.sitemap === true).length;
  console.log(`✅ sitemap.xml généré (${nbUrls} URL${nbUrls > 1 ? 's' : ''})`);
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

  console.log(`\nBuild terminé : ${succes} page(s) traitée(s).`);

  // Génération du sitemap.xml
  genererSitemap();
}

build();