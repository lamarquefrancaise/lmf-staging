// build.js
// Lance avec : node build.js
// Injecte le CSS nav, footer, global, breadcrumb et les données Supabase
// dans toutes les pages déclarées dans PAGES.

const fs   = require('fs');
const path = require('path');

// ─────────────────────────────────────────────
// CREDENTIALS SUPABASE (injectés via secrets GitHub Actions)
// ─────────────────────────────────────────────
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// ─────────────────────────────────────────────
// PAGES À TRAITER
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// LECTURE DES SOURCES STATIQUES
// ─────────────────────────────────────────────
const navCss        = fs.readFileSync(path.join(__dirname, 'css/nav.css'), 'utf8');
const navHtml       = fs.readFileSync(path.join(__dirname, 'templates/nav.html'), 'utf8');
const footerCss     = fs.readFileSync(path.join(__dirname, 'css/footer.css'), 'utf8');
const footerHtml    = fs.readFileSync(path.join(__dirname, 'templates/footer.html'), 'utf8');
const globalCss     = fs.readFileSync(path.join(__dirname, 'css/global.css'), 'utf8');
const breadcrumbCss = fs.readFileSync(path.join(__dirname, 'css/breadcrumb.css'), 'utf8');

// ─────────────────────────────────────────────
// FONCTION : résoudre le nav avec le bon lien actif
// ─────────────────────────────────────────────
function resoudreNav(actif) {
  return navHtml.replace(/\{\{NAV_ACTIVE:([^}]+)\}\}/g, (_, slug) => {
    return slug === actif ? ' class="active"' : '';
  });
}

// ─────────────────────────────────────────────
// FONCTION : générer l'article #brandFeatured
// ─────────────────────────────────────────────
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
      <a href="${m.url_site}" class="b-link" itemprop="url">
        Découvrir ${m.nom_societe} →
      </a>
    </div>
  </div>
</article>`;
}

// ─────────────────────────────────────────────
// FONCTION : générer la grille #brandsGrid
// ─────────────────────────────────────────────
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
    <a href="${m.url_site}" class="b-link" itemprop="url">
      Découvrir ${m.nom_societe} →
    </a>
  </div>
</article>`;
  }).join('');

  return `<div id="brandsGrid" class="brands-grid" role="list">${cartes}</div>`;
}

// ─────────────────────────────────────────────
// FONCTION : générer les items de légende
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// FONCTION : générer la section carte complète
// Retourne '' si aucune marque avec coordonnées
// Inclut :
//   - le <script> MAP_DATA (données dynamiques)
//   - le <script src="/js/carte.js"> (code statique)
// ─────────────────────────────────────────────
function genererSectionCarte(marquesAvecCoords, data) {
  if (!marquesAvecCoords.length) return '';

  const mapDataJs = marquesAvecCoords.map(m => {
    const lon    = parseFloat(m.longitude);
    const lat    = parseFloat(m.latitude);
    const region = (m.region || '').replace(/'/g, "\\'");
    const label  = (m.nom_societe || '').replace(/'/g, "\\'");
    return `  { lon: ${lon}, lat: ${lat}, region: '${region}', label: '${label}' }`;
  }).join(',\n');

  const legende = genererLegende(marquesAvecCoords);

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

// ─────────────────────────────────────────────
// FONCTION PRINCIPALE : fetch Supabase + génération
// ─────────────────────────────────────────────
async function genererSectionMarques(data) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('⚠️  Variables Supabase manquantes — section marques ignorée.');
    return { marques: '', carte: '', heroCount: '0' };
  }

  // ── Comptage total pour heroCount ──────────────────────────
  const resCount = await fetch(
    `${SUPABASE_URL}/rest/v1/entreprises?categories=cs.{${data.supabase_categorie}}&select=id`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Prefer: 'count=exact' } }
  );
  const heroCount = resCount.ok
    ? (resCount.headers.get('content-range') || '').split('/')[1] || '0'
    : '0';

  // ── Données marques ────────────────────────────────────────
  const url = `${SUPABASE_URL}/rest/v1/entreprises?categories=cs.{${data.supabase_categorie}}&select=nom_societe,description,mini_descriptif,ville,region,url_site,verifiee,categories,longitude,latitude`;

  const res = await fetch(url, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.warn(`⚠️  Erreur Supabase (${res.status}):`, errBody);
    return { marques: '', carte: '', heroCount };
  }

  const marques = await res.json();
  if (!marques.length) return { marques: '', carte: '', heroCount };

  // ── Section marques ────────────────────────────────────────
  const vedette = marques.find(m => m.verifiee === true) || null;
  const grille  = marques.filter(m => m !== vedette).slice(0, 6);

  const htmlFeatured = vedette       ? genererFeatured(vedette, data.supabase_categorie) : '';
  const htmlGrid     = grille.length ? genererGrid(grille, data.supabase_categorie)      : '';

  const htmlMarques = (htmlFeatured || htmlGrid) ? `
<section class="marques-section" id="marques" aria-labelledby="marques-title">
  <div class="containeur">
    <div class="s-label">${data.section_label}</div>
    <h2 class="s-title" id="marques-title">${data.section_titre}</h2>
    <div class="s-div"></div>
    <p class="s-sub">${data.section_sous_titre}</p>
    ${htmlFeatured}
    ${htmlGrid}
    ${grille.length ? `<div class="brands-cta"><button class="btn-ghost" type="button">${data.cta_texte}</button></div>` : ''}
  </div>
</section>` : '';

  // ── Section carte ──────────────────────────────────────────
  // Uniquement les marques affichées (vedette + grille) avec coordonnées GPS
  const marquesAffichees  = [vedette, ...grille].filter(Boolean);
  const marquesAvecCoords = marquesAffichees.filter(m =>
    m.longitude && m.latitude &&
    !isNaN(parseFloat(m.longitude)) &&
    !isNaN(parseFloat(m.latitude))
  );

  const htmlCarte = genererSectionCarte(marquesAvecCoords, data);

  return { marques: htmlMarques, carte: htmlCarte, heroCount };
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

    // Injection CSS global
    if (html.includes('{{GLOBAL_CSS}}')) {
      html = html.replace('{{GLOBAL_CSS}}', globalCss);
    } else {
      console.warn(`⚠️  Marqueur {{GLOBAL_CSS}} absent dans : ${page.fichier}`);
    }

    // Injection CSS nav
    if (html.includes('{{NAV_CSS}}')) {
      html = html.replace('{{NAV_CSS}}', navCss);
    } else {
      console.warn(`⚠️  Marqueur {{NAV_CSS}} absent dans : ${page.fichier}`);
    }

    // Injection CSS breadcrumb
    if (html.includes('{{BREADCRUMB_CSS}}')) {
      html = html.replace('{{BREADCRUMB_CSS}}', breadcrumbCss);
    } else {
      console.warn(`⚠️  Marqueur {{BREADCRUMB_CSS}} absent dans : ${page.fichier}`);
    }

    // Injection CSS footer
    if (html.includes('{{FOOTER_CSS}}')) {
      html = html.replace('{{FOOTER_CSS}}', footerCss);
    } else {
      console.warn(`⚠️  Marqueur {{FOOTER_CSS}} absent dans : ${page.fichier}`);
    }

    // Injection HTML nav
    if (html.includes('{{NAV}}')) {
      html = html.replace('{{NAV}}', resoudreNav(page.actif));
    } else {
      console.warn(`⚠️  Marqueur {{NAV}} absent dans : ${page.fichier}`);
    }

    // Injection HTML footer
    if (html.includes('{{FOOTER}}')) {
      html = html.replace('{{FOOTER}}', footerHtml);
    } else {
      console.warn(`⚠️  Marqueur {{FOOTER}} absent dans : ${page.fichier}`);
    }

    // Injection section marques + carte + heroCount (Supabase)
    const dataPath = path.join(__dirname, `data/${page.actif}.json`);
    if (html.includes('{{MARQUES_SECTION}}')) {
      if (fs.existsSync(dataPath)) {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const { marques, carte, heroCount } = await genererSectionMarques(data);

        html = html.replace('{{MARQUES_SECTION}}', marques);
        html = html.replace('{{CARTE_SECTION}}',   carte);

        // Injection heroCount dans <strong id="heroCount">
        html = html.replace(
          /<strong id="heroCount">[^<]*<\/strong>/,
          `<strong id="heroCount">${heroCount}</strong>`
        );
      } else {
        html = html.replace('{{MARQUES_SECTION}}', '');
        html = html.replace('{{CARTE_SECTION}}',   '');
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