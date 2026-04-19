// js/carte.js
// Carte de France interactive à deux niveaux :
// - Vue nationale : un point par région avec le nombre de marques
// - Vue zoomée : les marques individuelles de la région cliquée
// MAP_DATA est injecté par le build dans un <script> avant ce fichjet

// ─────────────────────────────────────────────
// LÉGENDE CARROUSEL
// ─────────────────────────────────────────────
const legTrack = document.getElementById('legTrack');
const legWrap  = document.getElementById('legWrap');
const legDots  = document.getElementById('legDots');
const VISIBLE  = 5;
let legScrollIdx = 0;
let legActiveIdx = 0;
const legItems = () => Array.from(document.querySelectorAll('#legTrack .leg-item'));

function scrollLeg(scrollIdx) {
  const _li = legItems();
  const max  = Math.max(0, _li.length - VISIBLE);
  legScrollIdx = Math.max(0, Math.min(scrollIdx, max));
  const h = _li[0] ? _li[0].offsetHeight : 0;
  legTrack.style.transform = `translateY(-${legScrollIdx * h}px)`;
}

function activateLeg(idx) {
  const _li = legItems();
  legActiveIdx = Math.max(0, Math.min(idx, _li.length - 1));
  if (legActiveIdx < legScrollIdx) scrollLeg(legActiveIdx);
  else if (legActiveIdx >= legScrollIdx + VISIBLE) scrollLeg(legActiveIdx - VISIBLE + 1);
  _li.forEach((item, i) => item.classList.toggle('active', i === legActiveIdx));
  document.querySelectorAll('.leg-dot-nav').forEach((d, i) => d.classList.toggle('active', i === legActiveIdx));
}

function initDotsLegende() {
  const dots = document.getElementById('legDots');
  if (!dots) return;
  dots.innerHTML = '';
  legItems().forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'leg-dot-nav' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => activateLeg(i));
    dots.appendChild(d);
  });
}

document.getElementById('legPrev').addEventListener('click', () => activateLeg(legActiveIdx - 1));
document.getElementById('legNext').addEventListener('click', () => activateLeg(legActiveIdx + 1));
legItems().forEach((item, i) => item.addEventListener('click', () => activateLeg(i)));

initDotsLegende();

function fixLegHeight() {
  const _li = legItems();
  if (_li[0] && legWrap) {
    legWrap.style.height   = (_li[0].offsetHeight * VISIBLE) + 'px';
    legWrap.style.overflow = 'hidden';
  }
}
window.addEventListener('load', fixLegHeight);
window.addEventListener('resize', () => { fixLegHeight(); scrollLeg(legScrollIdx); });

// ─────────────────────────────────────────────
// MISE À JOUR LÉGENDE selon les marques visibles
// ─────────────────────────────────────────────
function mettreAJourLegende(marques, parRegion = false) {
  legScrollIdx = 0;
  legActiveIdx = 0;

  if (!legTrack) return;

  if (!marques.length) {
    legTrack.innerHTML = '<div class="leg-item active"><div class="leg-item-top"><div class="leg-dot"></div><p class="nom-marque">Aucune marque géolocalisée</p></div></div>';
  } else if (parRegion) {
    // Vue nationale : regroupement par région
    const regions = {};
    marques.forEach(m => {
      const r = m.region || 'Autre';
      if (!regions[r]) regions[r] = [];
      regions[r].push(m);
    });

    legTrack.innerHTML = Object.entries(regions).map(([region, items]) => {
      const itemsHtml = items.map((m, i) => {
        const loc = m.ville ? `${m.ville} — ${m.region}` : m.region || '';
        return `
<div class="leg-item" data-region="${m.region || ''}">
  <div class="leg-item-top"><div class="leg-dot"></div><p class="nom-marque">${m.label}</p></div>
  ${m.mini ? `<p>${m.mini}</p>` : ''}
  ${loc ? `<span class="leg-tag">${loc}</span>` : ''}
</div>`;
      }).join('');

      return `
<div class="leg-region-header">
  <h3 class="leg-region-titre">${region}</h3>
  <span class="leg-region-count">${items.length} marque${items.length > 1 ? 's' : ''}</span>
</div>
${itemsHtml}`;
    }).join('');
  } else {
    // Vue zoomée : liste simple sans groupement
    legTrack.innerHTML = marques.map((m, i) => {
      const loc = m.ville && m.region ? `${m.ville} — ${m.region}` : (m.ville || m.region || '');
      return `
<div class="leg-item${i === 0 ? ' active' : ''}" data-region="${m.region || ''}">
  <div class="leg-item-top"><div class="leg-dot"></div><p class="nom-marque">${m.label}</p></div>
  ${m.mini ? `<p>${m.mini}</p>` : ''}
  ${loc ? `<span class="leg-tag">${loc}</span>` : ''}
</div>`;
    }).join('');
  }

  legItems().forEach((item, i) => item.addEventListener('click', () => activateLeg(i)));
  initDotsLegende();
  fixLegHeight();
  scrollLeg(0);
}

// ─────────────────────────────────────────────
// CARTE D3 — deux niveaux de vue
// ─────────────────────────────────────────────
let mapInited = false;

function initMap() {
  if (mapInited) return;
  mapInited = true;

  const SZ        = 500;
  const container = document.getElementById('map-container');
  const tip       = document.getElementById('mapTip');

  const svg = d3.select('#map-container').append('svg')
    .attr('viewBox', `0 0 ${SZ} ${SZ}`)
    .style('width', '100%')
    .style('height', 'auto');

  svg.append('text')
    .attr('x', SZ / 2).attr('y', SZ / 2)
    .attr('text-anchor', 'middle')
    .attr('font-family', 'Arial,sans-serif')
    .attr('font-size', '13')
    .attr('fill', '#9ca3af')
    .text('Chargement de la carte…');

  // Groupes SVG
  const gFond    = svg.append('g').attr('class', 'g-fond');
  const gRegions = svg.append('g').attr('class', 'g-regions');
  const gPins    = svg.append('g').attr('class', 'g-pins');

  // Projection centrée sur la France
  const proj = d3.geoMercator().rotate([-2.8, -46.7]).scale(2900).translate([SZ / 2, SZ / 2]);
  const path = d3.geoPath().projection(proj);

  // État courant
  let vueActuelle = 'nationale'; // 'nationale' ou 'region'
  let regionActive = null;

  // ── Regrouper MAP_DATA par région ──────────────────────────
  const parRegion = {};
  MAP_DATA.forEach(m => {
    if (!parRegion[m.region]) parRegion[m.region] = [];
    parRegion[m.region].push(m);
  });

  (async () => {
    try {
      // Chargement des données géographiques
      const [world, regionsGeo] = await Promise.all([
        d3.json('/js/countries-50m.json'),
        d3.json('/js/regions-france.json')
      ]);

      const countries = topojson.feature(world, world.objects.countries);
      const [france]  = countries.features.filter(d => d.properties.name === 'France');

      svg.select('text').remove();

      // Pays voisins
      gFond.selectAll('path')
        .data(countries.features.filter(d => d.properties.name !== 'France'))
        .enter().append('path')
        .attr('d', path)
        .attr('fill', '#f0ece3')
        .attr('stroke', '#ddd9d0')
        .attr('stroke-width', '.4');

      // France fond
      gFond.append('path')
        .datum(france)
        .attr('d', path)
        .attr('fill', '#e5dfd3')
        .attr('stroke', '#c5bba8')
        .attr('stroke-width', '1.5');

      // ── Régions colorées ────────────────────────────────────
      gRegions.selectAll('path')
        .data(regionsGeo.features)
        .enter().append('path')
        .attr('d', path)
        .attr('fill', d => parRegion[d.properties.nom] ? 'rgba(184,150,62,.08)' : 'transparent')
        .attr('stroke', '#c5bba8')
        .attr('stroke-width', '.6')
        .style('cursor', d => parRegion[d.properties.nom] ? 'pointer' : 'default')
        .on('click', function(event, d) {
          if (!parRegion[d.properties.nom]) return;
          event.stopPropagation();
          zoomerRegion(d, regionsGeo);
        });

      // ── Points régions (vue nationale) ──────────────────────
      const pointsRegions = Object.entries(parRegion).map(([nom, marques]) => {
        // Centroïde de la région depuis le JSON
        const feature = regionsGeo.features.find(f => f.properties.nom === nom);
        if (!feature) return null;
        const centroide = path.centroid(feature);
        return { nom, marques, cx: centroide[0], cy: centroide[1] };
      }).filter(Boolean);

      const gPointsNat = gPins.append('g').attr('class', 'pins-nationales');

      pointsRegions.forEach(r => {
        const g = gPointsNat.append('g')
          .style('cursor', 'pointer')
          .on('click', function(event) {
            event.stopPropagation();
            const feature = regionsGeo.features.find(f => f.properties.nom === r.nom);
            if (feature) zoomerRegion(feature, regionsGeo);
          });

        // Halo
        g.append('circle')
          .attr('cx', r.cx).attr('cy', r.cy)
          .attr('r', 16)
          .attr('fill', 'rgba(184,150,62,.15)')
          .attr('class', 'pin-halo');

        // Point
        g.append('circle')
          .attr('cx', r.cx).attr('cy', r.cy)
          .attr('r', 8)
          .attr('fill', '#b8963e');

        // Nombre de marques
        g.append('text')
          .attr('x', r.cx).attr('y', r.cy + 4)
          .attr('text-anchor', 'middle')
          .attr('font-family', 'Arial,sans-serif')
          .attr('font-size', '8')
          .attr('font-weight', 'bold')
          .attr('fill', '#fff')
          .text(r.marques.length);

        // Survol
        g.on('mouseenter', function() {
          d3.select(this).select('.pin-halo').attr('r', 22).attr('fill', 'rgba(184,150,62,.3)');
          tip.textContent = `${r.nom} — ${r.marques.length} marque${r.marques.length > 1 ? 's' : ''}`;
          tip.style.opacity = '1';
          positionnerTip(event, container, tip);
        })
        .on('mousemove', function(event) { positionnerTip(event, container, tip); })
        .on('mouseleave', function() {
          d3.select(this).select('.pin-halo').attr('r', 16).attr('fill', 'rgba(184,150,62,.15)');
          tip.style.opacity = '0';
        });
      });

      // Mise à jour légende vue nationale
      mettreAJourLegende(MAP_DATA, true);

      // ── Clic en dehors → retour vue nationale ───────────────
      svg.on('click', function() {
        if (vueActuelle === 'region') retourNationale();
      });

      // ── ZOOM sur une région ─────────────────────────────────
      function zoomerRegion(feature, regionsGeo) {
        vueActuelle  = 'region';
        regionActive = feature.properties.nom;

        tip.style.opacity = '0';

        // Calculer les bounds de la région pour le zoom
        const bounds  = path.bounds(feature);
        const dx      = bounds[1][0] - bounds[0][0];
        const dy      = bounds[1][1] - bounds[0][1];
        const x       = (bounds[0][0] + bounds[1][0]) / 2;
        const y       = (bounds[0][1] + bounds[1][1]) / 2;
        const scale   = Math.min(8, 0.85 / Math.max(dx / SZ, dy / SZ));
        const tx      = SZ / 2 - scale * x;
        const ty      = SZ / 2 - scale * y;

        // Animer le zoom
        svg.transition().duration(600)
          .attr('viewBox', `${-tx / scale} ${-ty / scale} ${SZ / scale} ${SZ / scale}`);

        // Masquer les points nationaux
        gPins.select('.pins-nationales').style('display', 'none');

        // Afficher les régions avec opacité
        gRegions.selectAll('path')
          .transition().duration(400)
          .attr('fill', d => {
            if (d.properties.nom === regionActive) return 'rgba(184,150,62,.15)';
            return parRegion[d.properties.nom] ? 'rgba(184,150,62,.04)' : 'transparent';
          })
          .attr('stroke-width', d => d.properties.nom === regionActive ? '1.2' : '.4');

        // Pins individuels des marques de la région
        const marquesRegion = parRegion[regionActive] || [];
        gPins.selectAll('.pins-region').remove();
        const gPinsRegion = gPins.append('g').attr('class', 'pins-region');

        marquesRegion.forEach((m, i) => {
          const [px, py] = proj([m.lon, m.lat]);
          const g = gPinsRegion.append('g').style('cursor', 'pointer');

          g.append('circle')
            .attr('cx', px).attr('cy', py)
            .attr('r', 10 / scale)
            .attr('fill', 'rgba(184,150,62,.12)')
            .attr('class', 'pin-halo-zoom');

          g.append('circle')
            .attr('cx', px).attr('cy', py)
            .attr('r', 4.5 / scale)
            .attr('fill', '#b8963e');

          g.append('circle')
            .attr('cx', px).attr('cy', py)
            .attr('r', 2 / scale)
            .attr('fill', '#fff');

          // Survol + clic (info-bulle)
          const afficherTip = (event) => {
            tip.textContent = m.label;
            tip.style.opacity = '1';
            positionnerTip(event, container, tip);
            const items = legItems();
            const idx = items.findIndex(el => {
              const p = el.querySelector('.nom-marque');
              return p && p.textContent === m.label;
            });
            if (idx >= 0) activateLeg(idx);
          };

          g.on('mouseenter', (event) => afficherTip(event))
          .on('mousemove',  (event) => positionnerTip(event, container, tip))
          .on('mouseleave', () => {
              d3.select(g.node()).select('.pin-halo-zoom').attr('r', 10 / scale).attr('fill', 'rgba(184,150,62,.12)');
              tip.style.opacity = '0';
            })
          .on('click', (event) => {
              event.stopPropagation();
              afficherTip(event);
              d3.select(g.node()).select('.pin-halo-zoom').attr('r', 14 / scale).attr('fill', 'rgba(184,150,62,.3)');
            });
        });

        // Bouton retour
        afficherBoutonRetour();

        // Mettre à jour la légende avec les marques de la région
        mettreAJourLegende(marquesRegion.map(m => ({
          label: m.label,
          region: m.region,
          ville: m.ville || '',
          mini: m.mini || ''
        })));
      }

      // ── Retour vue nationale ─────────────────────────────────
      function retourNationale() {
        vueActuelle  = 'nationale';
        regionActive = null;

        tip.style.opacity = '0';

        svg.transition().duration(500)
          .attr('viewBox', `0 0 ${SZ} ${SZ}`);

        gPins.select('.pins-nationales').style('display', null);
        gPins.selectAll('.pins-region').remove();

        gRegions.selectAll('path')
          .transition().duration(400)
          .attr('fill', d => parRegion[d.properties.nom] ? 'rgba(184,150,62,.08)' : 'transparent')
          .attr('stroke-width', '.6');

        supprimerBoutonRetour();
        mettreAJourLegende(MAP_DATA, true);
      }

      // ── Bouton retour ────────────────────────────────────────
      function afficherBoutonRetour() {
        supprimerBoutonRetour();
        const btn = document.createElement('button');
        btn.id        = 'carteRetourBtn';
        btn.type      = 'button';
        btn.textContent = '← Retour France';
        btn.addEventListener('click', (event) => { event.stopPropagation(); retourNationale(); });
        container.appendChild(btn);
      }

      function supprimerBoutonRetour() {
        const existing = document.getElementById('carteRetourBtn');
        if (existing) existing.remove();
      }

    } catch (e) {
      console.warn('Carte non disponible', e);
    }
  })();
}

// ── Positionner l'info-bulle ────────────────────────────────
function positionnerTip(event, container, tip) {
  const rect = container.getBoundingClientRect();
  let x = event.clientX - rect.left + 12;
  let y = event.clientY - rect.top - 10;
  if (x + 250 > rect.width) x = event.clientX - rect.left - 260;
  if (y < 0) y = event.clientY - rect.top + 20;
  tip.style.left = x + 'px';
  tip.style.top  = y + 'px';
}

// ── Chargement dynamique D3 + TopoJSON ──────────────────────
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

const mapSection = document.getElementById('carte');
if (mapSection && 'IntersectionObserver' in window) {
  const mapObs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      mapObs.disconnect();
      Promise.all([
        loadScript('/js/d3.min.js'),
        loadScript('/js/topojson.min.js')
      ]).then(() => initMap());
    }
  }, { threshold: 0.1 });
  mapObs.observe(mapSection);
} else {
  Promise.all([
    loadScript('/js/d3.min.js'),
    loadScript('/js/topojson.min.js')
  ]).then(() => initMap());
}