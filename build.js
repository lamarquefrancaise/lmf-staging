// build.js
// Lance avec : node build.js

const fs   = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const PAGES = [
  { fichier: 'made-in-france/epicerie-fine/index.html', actif: 'epicerie-fine' },
  { fichier: 'made-in-france/mode/index.html',          actif: 'mode' },
  { fichier: 'made-in-france/beaute/index.html',        actif: 'beaute' },
  { fichier: 'made-in-france/bijoux/index.html',        actif: 'bijoux' },
  { fichier: 'made-in-france/maison/index.html',        actif: 'maison' },
  { fichier: 'made-in-france/sport/index.html',         actif: 'sport' },
  { fichier: 'made-in-france/technologie/index.html',   actif: 'technologie' },
  { fichier: 'index.html',                              actif: '' },
];

const navCss             = fs.readFileSync(path.join(__dirname, 'css/nav.css'), 'utf8');
const navHtml            = fs.readFileSync(path.join(__dirname, 'templates/nav.html'), 'utf8');
const footerCss          = fs.readFileSync(path.join(__dirname, 'css/footer.css'), 'utf8');
const footerHtml         = fs.readFileSync(path.join(__dirname, 'templates/footer.html'), 'utf8');
const globalCss          = fs.readFileSync(path.join(__dirname, 'css/global.css'), 'utf8');
const breadcrumbCss      = fs.readFileSync(path.join(__dirname, 'css/breadcrumb.css'), 'utf8');
const heroCategorieCss   = fs.readFileSync(path.join(__dirname, 'css/hero-categories.css'), 'utf8');
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

// ── Section carte : toutes les marques géolocalisées ─────────
function genererSectionCarte(toutesMarquesCoords, data) {
  if (!toutesMarquesCoords.length) return '';

  const mapDataJs = toutesMarquesCoords.map(m => {
    const lon    = parseFloat(m.longitude);
    const lat    = parseFloat(m.latitude);
    const region = (m.region           || '').replace(/'/g, "\\'");
    const label  = (m.nom_societe      || '').replace(/'/g, "\\'");
    const ville  = (m.ville            || '').replace(/'/g, "\\'");
    const mini   = (m.mini_descriptif  || '').replace(/'/g, "\\'");
    return `  { lon: ${lon}, lat: ${lat}, region: '${region}', label: '${label}', ville: '${ville}', mini: '${mini}' }`;
  }).join(',\n');

  // Légende initiale = toutes les marques géolocalisées
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
        <div id="map-container">
          <div id="mapTip" class="map-tip"></div>
        </div>
        <p class="carte-note">${data.carte_note || ''}</p>
      </div>
      <div class="legende-box">
        <div class="legende-track-wrap" id="legWrap">
          <div class="legende-track" id="legTrack">
            ${legende}
          </div>
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
  <a href="${urlProd}" class="p-card-link" aria-label="${nom}" tabindex="0">${nom}</a>
  <div class="p-img"><div class="p-img-inner">
    <picture>
      ${imgAvif ? `<source srcset="${imgAvif}" type="image/avif">` : ''}
      <img src="${imgWebp}" alt="${altImg}" width="600" height="600" loading="lazy" decoding="async">
    </picture>
  </div><div class="p-overlay"><span>Voir le produit →</span></div></div>
  <div class="p-info">
    <div class="p-brand" itemprop="brand" itemscope itemtype="https://schema.org/Brand">
      <span itemprop="name">${marque}</span>
    </div>
    <h3 class="p-name" itemprop="name">${nom}</h3>
    <div class="p-orig">
      <div class="p-orig-dot"></div>
      <span class="p-orig-lbl">${region}</span>
    </div>
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
    <div class="products-grid" role="list">
      ${cartes}
    </div>
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
    const q = item.question || '';
    const r = item.reponse  || '';
    return `
      <div class="faq-item" role="listitem">
        <button class="faq-q" aria-expanded="false" type="button" aria-controls="fa${n}" onclick="toggleFaq(this)">
          <span class="faq-q-text">${q}</span>
          <span class="faq-toggle">+</span>
        </button>
        <div class="faq-sep" id="fs${n}"></div>
        <div class="faq-a" id="fa${n}">${r}</div>
      </div>`;
  }).join('');
  return `
<section class="faq" id="faq" aria-labelledby="faq-title">
  <div class="containeur">
    <div class="s-label">${data.faq_label || 'Questions fréquentes'}</div>
    <h2 class="s-title" id="faq-title">${data.faq_titre || 'Questions fréquentes'}</h2>
    <div class="s-div"></div>
    <p class="s-sub">${data.faq_sous_titre || ''}</p>
    <div class="faq-list" role="list">
      ${items}
    </div>
  </div>
</section>`;
}

async function fetchProduits(categorie) {
  const url = `${SUPABASE_URL}/rest/v1/produits?categories=cs.{${categorie}}&select=id,nom_produit,marque,description,categories,prix,mis_en_avant,image_avif,image_webp,url_produit,created_at&order=created_at.desc`;
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  });
  if (!res.ok) {
    console.warn(`⚠️  Erreur Supabase produits (${res.status})`);
    return [];
  }
  const produits = await res.json();
  if (!produits.length) return [];

  const misEnAvant = produits.filter(p => p.mis_en_avant === true);
  const autres     = produits.filter(p => p.mis_en_avant !== true);
  const selection  = misEnAvant.length >= 8
    ? misEnAvant.slice(0, 8)
    : [...misEnAvant, ...autres.slice(0, 8 - misEnAvant.length)];

  const marquesUniques = [...new Set(selection.map(p => p.marque).filter(Boolean))];
  if (marquesUniques.length) {
    const marquesParam   = marquesUniques.map(m => `"${m}"`).join(',');
    const urlEntreprises = `${SUPABASE_URL}/rest/v1/entreprises?nom_societe=in.(${marquesParam})&select=nom_societe,region`;
    const resE = await fetch(urlEntreprises, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
    if (resE.ok) {
      const entreprises    = await resE.json();
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
    return { marques: '', carte: '', produits: '', heroCount: '0', itemListJsonLd: '', afficherVedette: false, afficherGrid: false, afficherProduits: false };
  }

  // Comptage heroCount
  const resCount = await fetch(
    `${SUPABASE_URL}/rest/v1/entreprises?categories=cs.{${data.supabase_categorie}}&select=id`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Prefer: 'count=exact' } }
  );
  const heroCount = resCount.ok
    ? (resCount.headers.get('content-range') || '').split('/')[1] || '0'
    : '0';

  // Toutes les marques de la catégorie pour la grille/vedette
  const url = `${SUPABASE_URL}/rest/v1/entreprises?categories=cs.{${data.supabase_categorie}}&select=id,nom_societe,description,mini_descriptif,ville,region,url_site,verifiee,vedette,mis_en_avant,categories,longitude,latitude&order=created_at.desc`;
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.warn(`⚠️  Erreur Supabase marques (${res.status}):`, errBody);
    return { marques: '', carte: '', produits: '', heroCount, itemListJsonLd: '', afficherVedette: false, afficherGrid: false, afficherProduits: false };
  }

  const marques = await res.json();
  if (!marques.length) return { marques: '', carte: '', produits: '', heroCount, itemListJsonLd: '', afficherVedette: false, afficherGrid: false, afficherProduits: false };

  // Vedette : champ vedette = true
  const vedette = marques.find(m => m.vedette === true) || null;
  const grille  = selectionnerGrille(marques, vedette, 6);

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

  // ── Carte : TOUTES les marques géolocalisées de la catégorie ─
  const urlCarte = `${SUPABASE_URL}/rest/v1/entreprises?categories=cs.{${data.supabase_categorie}}&select=nom_societe,mini_descriptif,ville,region,longitude,latitude&longitude=not.is.null&latitude=not.is.null`;
  const resCarte = await fetch(urlCarte, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  });

  let toutesMarquesCoords = [];
  if (resCarte.ok) {
    const toutesMarques = await resCarte.json();
    toutesMarquesCoords = toutesMarques.filter(m =>
      m.longitude && m.latitude &&
      !isNaN(parseFloat(m.longitude)) &&
      !isNaN(parseFloat(m.latitude))
    );
  }

  const htmlCarte = genererSectionCarte(toutesMarquesCoords, data);

  // Produits
  const produitsData     = await fetchProduits(data.supabase_categorie);
  const htmlProduits     = genererSectionProduits(produitsData, data);
  const afficherProduits = !!htmlProduits;

  return { marques: htmlMarques, carte: htmlCarte, produits: htmlProduits, heroCount, itemListJsonLd, afficherVedette, afficherGrid, afficherProduits };
}

async function build() {
  let succes = 0;

  for (const page of PAGES) {
    const chemin = path.join(__dirname, page.fichier);
    if (!fs.existsSync(chemin)) {
      console.warn(`⚠️  Fichier introuvable, ignoré : ${page.fichier}`);
      continue;
    }

    let html = fs.readFileSync(chemin, 'utf8');

    const injectionsCss = [
      ['{{GLOBAL_CSS}}',          globalCss],
      ['{{NAV_CSS}}',             navCss],
      ['{{BREADCRUMB_CSS}}',      breadcrumbCss],
      ['{{HERO_CATEGORIES_CSS}}', heroCategorieCss],
      ['{{SOUS_CATEGORIES_CSS}}', sousCategorieCss],
      ['{{SEO_TEXTE_CATE_CSS}}',  seoTextCateCss],
      ['{{FAQ_CSS}}',             faqCss],
      ['{{AUTRE_CATE_CSS}}',      autresCateCss],
      ['{{BANDEAU_CTA_CSS}}',     bandeauCtaCss],
      ['{{FOOTER_CSS}}',          footerCss],
    ];

    for (const [marqueur, contenu] of injectionsCss) {
      if (html.includes(marqueur)) {
        html = html.replace(marqueur, contenu);
      } else {
        console.warn(`⚠️  Marqueur ${marqueur} absent dans : ${page.fichier}`);
      }
    }

    if (html.includes('{{NAV}}'))    html = html.replace('{{NAV}}',    resoudreNav(page.actif));
    if (html.includes('{{FOOTER}}')) html = html.replace('{{FOOTER}}', footerHtml);

    const dataPath = path.join(__dirname, `data/${page.actif}.json`);
    if (html.includes('{{MARQUES_SECTION}}')) {
      if (fs.existsSync(dataPath)) {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const { marques, carte, produits, heroCount, itemListJsonLd, afficherVedette, afficherGrid, afficherProduits } = await genererSectionMarques(data);

        const afficherSection = afficherVedette || afficherGrid;

        html = html.replace('{{MARQUES_SECTION}}',   marques);
        html = html.replace('{{CARTE_SECTION}}',     carte);
        html = html.replace('{{PRODUITS_SECTION}}',  produits);

        html = html.replace('{{MARQUES_SECTION_CSS}}', afficherSection  ? marquesSectionCss  : '');
        html = html.replace('{{MARQUE_VEDETTE_CSS}}',  afficherVedette  ? marqueVedetteCss   : '');
        html = html.replace('{{MARQUES_GRID_CSS}}',    afficherGrid     ? marquesGridCss     : '');
        html = html.replace('{{CARTE_CSS}}',           carte            ? carteCss           : '');
        html = html.replace('{{PRODUITS_CSS}}',        afficherProduits ? produitsSectionCss : '');

        html = html.replace('{{ITEMLIST_JSON_LD}}', itemListJsonLd);
        html = html.replace('{{FAQ_JSON_LD}}',      genererFaqJsonLd(data));
        html = html.replace('{{FAQ_SECTION}}',      genererFaqHtml(data));

        html = html.replace(
          /<strong id="heroCount">[^<]*<\/strong>/,
          `<strong id="heroCount">${heroCount}</strong>`
        );
      } else {
        const marqueurs = ['{{MARQUES_SECTION}}','{{CARTE_SECTION}}','{{PRODUITS_SECTION}}',
          '{{MARQUES_SECTION_CSS}}','{{MARQUE_VEDETTE_CSS}}','{{MARQUES_GRID_CSS}}',
          '{{CARTE_CSS}}','{{PRODUITS_CSS}}','{{ITEMLIST_JSON_LD}}','{{FAQ_JSON_LD}}','{{FAQ_SECTION}}'];
        marqueurs.forEach(m => { html = html.replace(m, ''); });
        console.warn(`⚠️  Pas de fichier data/${page.actif}.json — sections supprimées.`);
      }
    }

    fs.writeFileSync(chemin, html, 'utf8');
    console.log(`✅ ${page.fichier}`);
    succes++;
  }

  console.log(`\nBuild terminé : ${succes} page(s) traitée(s).`);
}

build();