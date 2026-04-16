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
console.log('Node version:', process.version);
console.log('SUPABASE_URL défini:', !!SUPABASE_URL);

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
    <p class="b-feat-desc" itemprop="description">${m.mini_descriptif || m.description || ''}</p>
    <div class="b-feat-footer">
      <div style="display:flex;align-items:center;gap:.5rem">
        <div class="b-dot" aria-hidden="true"></div>
        <span class="b-loc">${m.ville} — ${m.region}</span>
      </div>
      <a href="${m.url_site}" class="b-link" itemprop="url" target="_blank" rel="noopener noreferrer">
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
  <p class="b-desc">${m.mini_descriptif || m.description || ''}</p>
  <div class="b-footer">
    <div style="display:flex;align-items:center;gap:.42rem">
      <div class="b-dot" aria-hidden="true"></div>
      <span class="b-loc">${m.ville} — ${m.region}</span>
    </div>
    <a href="${m.url_site}" class="b-link" itemprop="url" target="_blank" rel="noopener noreferrer">
      Découvrir ${m.nom_societe} →
    </a>
  </div>
</article>`;
  }).join('');

  return `<div id="brandsGrid" class="brands-grid" role="list">${cartes}</div>`;
}

// ─────────────────────────────────────────────
// FONCTION : générer la section marques complète
// Retourne '' si aucune donnée Supabase
// ─────────────────────────────────────────────
async function genererSectionMarques(data) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('⚠️  Variables Supabase manquantes — section marques ignorée.');
    return '';
  }

  const url = `${SUPABASE_URL}/rest/v1/entreprises?categories=cs.{${data.supabase_categorie}}&select=nom_societe,description,mini_descriptif,ville,region,url_site,verifiee,categories`;
  console.log('URL appelée:', url);

  const res = await fetch(url, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.warn(`⚠️  Erreur Supabase (${res.status}):`, errBody);
    return '';
  }

  const marques = await res.json();
  console.log('Réponse Supabase:', JSON.stringify(marques));
  if (!marques.length) return '';

  const vedette = marques.find(m => m.verifiee === true) || null;
  const grille  = marques.filter(m => m !== vedette).slice(0, 6);

  const htmlFeatured = vedette       ? genererFeatured(vedette, data.supabase_categorie) : '';
  const htmlGrid     = grille.length ? genererGrid(grille, data.supabase_categorie)      : '';

  if (!htmlFeatured && !htmlGrid) return '';

  const ctaHtml = grille.length
    ? `<div class="brands-cta"><button class="btn-ghost" type="button">${data.cta_texte}</button></div>`
    : '';

  return `
<section class="marques-section" id="marques" aria-labelledby="marques-title">
  <div class="containeur">
    <div class="s-label">${data.section_label}</div>
    <h2 class="s-title" id="marques-title">${data.section_titre}</h2>
    <div class="s-div"></div>
    <p class="s-sub">${data.section_sous_titre}</p>
    ${htmlFeatured}
    ${htmlGrid}
    ${ctaHtml}
  </div>
</section>`;
}

// ─────────────────────────────────────────────
// BUILD PRINCIPAL (async pour Supabase)
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

    // Injection section marques (Supabase) — uniquement si data JSON existe
    const dataPath = path.join(__dirname, `data/${page.actif}.json`);
    if (html.includes('{{MARQUES_SECTION}}')) {
      if (fs.existsSync(dataPath)) {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const sectionHtml = await genererSectionMarques(data);
        html = html.replace('{{MARQUES_SECTION}}', sectionHtml);
      } else {
        html = html.replace('{{MARQUES_SECTION}}', '');
        console.warn(`⚠️  Pas de fichier data/${page.actif}.json — section marques supprimée.`);
      }
    }

    fs.writeFileSync(chemin, html, 'utf8');
    console.log(`✅ ${page.fichier}`);
    succes++;
  }

  console.log(`\nBuild terminé : ${succes} page(s) traitée(s).`);
}

build();