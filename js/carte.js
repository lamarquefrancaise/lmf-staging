// js/carte.js
// Gestion de la légende carrousel et de la carte D3
// MAP_DATA est injecté par le build dans un <script> avant ce fichier

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

document.getElementById('legPrev').addEventListener('click', () => activateLeg(legActiveIdx - 1));
document.getElementById('legNext').addEventListener('click', () => activateLeg(legActiveIdx + 1));
legItems().forEach((item, i) => item.addEventListener('click', () => activateLeg(i)));

// Init dots légende
(function () {
  const dots = document.getElementById('legDots');
  if (!dots) return;
  legItems().forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'leg-dot-nav' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => activateLeg(i));
    dots.appendChild(d);
  });
})();

function fixLegHeight() {
  const _li = legItems();
  if (_li[0] && legWrap) {
    legWrap.style.height  = (_li[0].offsetHeight * VISIBLE) + 'px';
    legWrap.style.overflow = 'hidden';
  }
}
window.addEventListener('load', fixLegHeight);
window.addEventListener('resize', () => { fixLegHeight(); scrollLeg(legScrollIdx); });

// ─────────────────────────────────────────────
// CARTE D3
// MAP_DATA est défini dans le <script> injecté
// par le build juste avant ce fichier
// ─────────────────────────────────────────────
let mapInited = false;
function initMap() {
  if (mapInited) return;
  mapInited = true;
  const SZ        = 500;
  const container = document.getElementById('map-container');
  const tip       = document.getElementById('mapTip');
  const svg       = d3.select('#map-container').append('svg')
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

  (async () => {
    try {
      //const world     = await d3.json('https://unpkg.com/world-atlas@2.0.2/countries-50m.json');
      const world = await d3.json('/js/countries-50m.json');
      const countries = topojson.feature(world, world.objects.countries);
      const [france]  = countries.features.filter(d => d.properties.name === 'France');
      const proj      = d3.geoMercator().rotate([-2.8, -46.7]).scale(2900).translate([SZ / 2, SZ / 2]);
      const path      = d3.geoPath().projection(proj);

      svg.select('text').remove();

      // Pays voisins
      svg.append('g').selectAll('path')
        .data(countries.features.filter(d => d.properties.name !== 'France'))
        .enter().append('path')
        .attr('d', path)
        .attr('fill', '#f0ece3')
        .attr('stroke', '#ddd9d0')
        .attr('stroke-width', '.4');

      // France
      svg.append('g').append('path')
        .datum(france)
        .attr('d', path)
        .attr('fill', '#e5dfd3')
        .attr('stroke', '#c5bba8')
        .attr('stroke-width', '1.5');

      // Pins
      svg.append('g').selectAll('g')
        .data(MAP_DATA)
        .enter().append('g')
        .attr('transform', d => {
          const [x, y] = proj([d.lon, d.lat]);
          return `translate(${x},${y})`;
        })
        .style('cursor', 'pointer')
        .each(function () {
          const g = d3.select(this);
          g.append('circle').attr('r', 13).attr('fill', 'rgba(184,150,62,.12)').attr('class', 'pin-halo');
          g.append('circle').attr('r', 5.5).attr('fill', '#b8963e');
          g.append('circle').attr('r', 2.5).attr('fill', '#fff');
        })
        .on('mouseenter', function (event, d) {
          d3.select(this).select('.pin-halo').attr('r', 20).attr('fill', 'rgba(184,150,62,.28)');
          const rect = container.getBoundingClientRect();
          tip.textContent = d.label;
          tip.style.opacity = '1';
          let x = event.clientX - rect.left + 12;
          let y = event.clientY - rect.top - 10;
          if (x + 250 > rect.width) x = event.clientX - rect.left - 260;
          tip.style.left = x + 'px';
          tip.style.top  = y + 'px';
          legItems().forEach((item, i) => { if (item.dataset.region === d.region) activateLeg(i); });
        })
        .on('mousemove', function (event) {
          const rect = container.getBoundingClientRect();
          let x = event.clientX - rect.left + 12;
          let y = event.clientY - rect.top - 10;
          if (x + 250 > rect.width) x = event.clientX - rect.left - 260;
          tip.style.left = x + 'px';
          tip.style.top  = y + 'px';
        })
        .on('mouseleave', function () {
          d3.select(this).select('.pin-halo').attr('r', 13).attr('fill', 'rgba(184,150,62,.12)');
          tip.style.opacity = '0';
        });

    } catch (e) {
      console.warn('Carte non disponible', e);
    }
  })();
}

// Chargement dynamique de D3 et TopoJSON uniquement quand la carte est visible
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
//        loadScript('https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js'),
//        loadScript('https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js')
          loadScript('/js/d3.min.js'),
          loadScript('/js/topojson.min.js')
      ]).then(() => initMap());
    }
  }, { threshold: 0.1 });
  mapObs.observe(mapSection);
} else {
  Promise.all([
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js'),
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js')
  ]).then(() => initMap());
}