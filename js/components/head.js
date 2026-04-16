// Bloque l'indexation sur le staging
const noindex = document.createElement('meta')
noindex.name = 'robots'
noindex.content = 'noindex, nofollow, noarchive'
document.head.appendChild(noindex)