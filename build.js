// build.js
// Lance avec : node build.js
// Injecte le CSS nav et le HTML nav dans toutes les pages déclarées dans PAGES.

const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────
// PAGES À TRAITER
// Ajouter ici chaque page avec son chemin et
// son slug de catégorie pour le lien actif.
// ─────────────────────────────────────────────
const PAGES = [
  { fichier: 'made-in-france/epicerie-fine/index.html', actif: 'epicerie-fine' },
  //{ fichier: 'made-in-france/mode/index.html',          actif: 'mode' },
  //{ fichier: 'made-in-france/beaute/index.html',        actif: 'beaute' },
  //{ fichier: 'made-in-france/bijoux/index.html',        actif: 'bijoux' },
  //{ fichier: 'made-in-france/maison/index.html',        actif: 'maison' },
  //{ fichier: 'made-in-france/sport/index.html',         actif: 'sport' },
  //{ fichier: 'made-in-france/technologie/index.html',   actif: 'technologie' },
  //{ fichier: 'index.html',                              actif: '' },
];

// ─────────────────────────────────────────────
// LECTURE DES SOURCES
// ─────────────────────────────────────────────
const navCss  = fs.readFileSync(path.join(__dirname, 'css/nav.css'), 'utf8');
const navHtml = fs.readFileSync(path.join(__dirname, 'templates/nav.html'), 'utf8');

// ─────────────────────────────────────────────
// FONCTION : résoudre le nav avec le bon lien actif
// Remplace {{NAV_ACTIVE:slug}} par class="active" si
// le slug correspond à la page courante, sinon supprime le marqueur.
// ─────────────────────────────────────────────
function resoudreNav(actif) {
  return navHtml.replace(/\{\{NAV_ACTIVE:([^}]+)\}\}/g, (_, slug) => {
    return slug === actif ? ' class="active"' : '';
  });
}

// ─────────────────────────────────────────────
// TRAITEMENT DE CHAQUE PAGE
// ─────────────────────────────────────────────
let succes = 0;
let erreurs = 0;

for (const page of PAGES) {
  const chemin = path.join(__dirname, page.fichier);

  if (!fs.existsSync(chemin)) {
    console.warn(`⚠️  Fichier introuvable, ignoré : ${page.fichier}`);
    continue;
  }

  let html = fs.readFileSync(chemin, 'utf8');

  // Injection CSS nav
  if (html.includes('{{NAV_CSS}}')) {
    html = html.replace('{{NAV_CSS}}', navCss);
  } else {
    console.warn(`⚠️  Marqueur {{NAV_CSS}} absent dans : ${page.fichier}`);
  }

  // Injection HTML nav
  if (html.includes('{{NAV}}')) {
    html = html.replace('{{NAV}}', resoudreNav(page.actif));
  } else {
    console.warn(`⚠️  Marqueur {{NAV}} absent dans : ${page.fichier}`);
  }

  fs.writeFileSync(chemin, html, 'utf8');
  console.log(`✅ ${page.fichier}`);
  succes++;
}

console.log(`\nBuild terminé : ${succes} page(s) traitée(s), ${erreurs} erreur(s).`);