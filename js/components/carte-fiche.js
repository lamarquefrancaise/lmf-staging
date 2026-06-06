// js/components/carte-fiche.js
// Carte de France simplifiée pour les fiches marque.
// Affiche les sites de fabrication d'UNE marque sous forme de points sur une carte SVG.
//
// Pré-requis :
//   - d3 v7 + topojson v3 chargés (cdnjs ou local)
//   - <div id="map-container"></div> dans le DOM
//   - MAP_DATA = [{ lon, lat, region, label }, ...] injecté par le build
//   - /js/countries-50m.json et /js/regions-france.json accessibles
//
// Diffère de carte.js (pages catégorie) :
//   - Pas de carrousel de légende
//   - Pas de zoom multi-niveaux
//   - Tooltip simple sur survol des points
//   - 100% rétrocompatible : ne se déclenche que si #map-container existe ET #carte n'existe pas

(function() {
  'use strict';

  const container = document.getElementById('map-container');
  if (!container) return;

  // Si on est sur une page catégorie (avec #carte wrapper), on laisse carte.js gérer
  if (document.getElementById('carte')) return;

  // Vérifier que MAP_DATA est défini et non vide
  if (typeof MAP_DATA === 'undefined' || !Array.isArray(MAP_DATA) || !MAP_DATA.length) {
    return;
  }

  let inited = false;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function chargerLibs() {
    if (window.d3 && window.topojson) return Promise.resolve();
    return Promise.all([
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js'),
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js')
    ]);
  }

  async function initCarte() {
    if (inited) return;
    inited = true;

    const SZ = 500;

    // SVG
    const svg = d3.select('#map-container').append('svg')
      .attr('viewBox', `0 0 ${SZ} ${SZ}`)
      .style('width', '100%')
      .style('height', 'auto');

    // Loader
    const loader = svg.append('text')
      .attr('x', SZ / 2).attr('y', SZ / 2)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'Arial,sans-serif')
      .attr('font-size', '13')
      .attr('fill', '#9ca3af')
      .text('Chargement de la carte…');

    // Tooltip
    let tip = document.getElementById('mapTip');
    if (!tip) {
      tip = document.createElement('div');
      tip.id = 'mapTip';
      tip.className = 'map-tip';
      container.appendChild(tip);
    }

    // Groupes
    const gFond  = svg.append('g').attr('class', 'g-fond');
    const gReg   = svg.append('g').attr('class', 'g-regions');
    const gPins  = svg.append('g').attr('class', 'g-pins');

    // Projection identique à carte.js pour cohérence visuelle
    const proj = d3.geoMercator().rotate([-2.8, -46.7]).scale(2900).translate([SZ / 2, SZ / 2]);
    const path = d3.geoPath().projection(proj);

    try {
      const [world, regionsGeo] = await Promise.all([
        d3.json('/js/countries-50m.json'),
        d3.json('/js/regions-france.json')
      ]);

      const countries = topojson.feature(world, world.objects.countries);
      const [france]  = countries.features.filter(d => d.properties.name === 'France');

      loader.remove();

      // Pays voisins
      gFond.selectAll('path')
        .data(countries.features.filter(d => d.properties.name !== 'France'))
        .enter().append('path')
        .attr('d', path)
        .attr('fill', '#f0ece3')
        .attr('stroke', '#ddd9d0')
        .attr('stroke-width', '.4');

      // France
      gFond.append('path')
        .datum(france)
        .attr('d', path)
        .attr('fill', '#e5dfd3')
        .attr('stroke', '#c5bba8')
        .attr('stroke-width', '1.5');

      // Régions (juste pour le tracé, sans interaction)
      gReg.selectAll('path')
        .data(regionsGeo.features)
        .enter().append('path')
        .attr('d', path)
        .attr('fill', 'transparent')
        .attr('stroke', '#c5bba8')
        .attr('stroke-width', '.5');

      // Points pour chaque site de fabrication
      MAP_DATA.forEach(site => {
        const lon = parseFloat(site.lon);
        const lat = parseFloat(site.lat);
        if (isNaN(lon) || isNaN(lat)) return;

        const [cx, cy] = proj([lon, lat]);
        if (isNaN(cx) || isNaN(cy)) return;

        const g = gPins.append('g').style('cursor', 'pointer');

        // Halo
        g.append('circle')
          .attr('cx', cx).attr('cy', cy)
          .attr('r', 14)
          .attr('fill', 'rgba(184,150,62,.18)');

        // Point central
        g.append('circle')
          .attr('cx', cx).attr('cy', cy)
          .attr('r', 6)
          .attr('fill', '#d4af6a')
          .attr('stroke', '#fff')
          .attr('stroke-width', 1.5);

        // Interactions tooltip
        g.on('mouseenter', function(event) {
          tip.textContent = site.label || '';
          tip.style.opacity = '1';
          positionnerTip(event, tip);
        });
        g.on('mousemove', function(event) { positionnerTip(event, tip); });
        g.on('mouseleave', () => { tip.style.opacity = '0'; });
      });
    } catch (e) {
      loader.text('Carte indisponible');
      console.warn('[carte-fiche] Erreur de chargement :', e);
    }
  }

  function positionnerTip(event, tip) {
    const rect = container.getBoundingClientRect();
    let x = event.clientX - rect.left + 12;
    let y = event.clientY - rect.top - 10;
    if (x + 200 > rect.width) x = event.clientX - rect.left - 210;
    if (y < 0) y = 10;
    tip.style.left = x + 'px';
    tip.style.top  = y + 'px';
  }

  // Init paresseuse via IntersectionObserver pour ne pas charger d3 si la section n'est pas visible
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        obs.disconnect();
        chargerLibs().then(initCarte);
      }
    }, { threshold: 0.1 });
    obs.observe(container);
  } else {
    chargerLibs().then(initCarte);
  }

})();