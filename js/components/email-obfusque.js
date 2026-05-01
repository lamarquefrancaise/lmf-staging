(function(){
  const btnEmail = document.getElementById('btnEmail');
  const emailLink = document.getElementById('emailLink');
  const btnCopy = document.getElementById('btnCopy');

  // Fragments encodés Base64 (jamais d'email en clair)
  const f1 = 'Ym9uam91cg==';                    // partie locale
  const f2 = 'bGFtYXJxdWVmcmFuY2Fpc2U=';        // domaine
  const f3 = 'ZnI=';                            // tld

  const buildEmail = () => {
    try {
      return atob(f1) + '@' + atob(f2) + '.' + atob(f3);
    } catch(e) {
      return '';
    }
  };

  const reveal = () => {
    const email = buildEmail();
    if (!email) return;
    emailLink.textContent = email;
    emailLink.setAttribute('href', 'mailto:' + email);
    emailLink.setAttribute('aria-hidden', 'false');
    emailLink.classList.add('revealed');
    btnCopy.setAttribute('aria-hidden', 'false');
    btnCopy.classList.add('revealed');
    btnEmail.classList.add('revealed');
    btnEmail.setAttribute('aria-expanded', 'true');
    emailLink.focus();
  };

  btnEmail.addEventListener('click', reveal);

  btnCopy.addEventListener('click', async () => {
    const email = buildEmail();
    if (!email) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        const tmp = document.createElement('textarea');
        tmp.value = email;
        tmp.setAttribute('readonly', '');
        tmp.style.position = 'absolute';
        tmp.style.left = '-9999px';
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand('copy');
        document.body.removeChild(tmp);
      }
      const original = btnCopy.textContent;
      btnCopy.textContent = '✓ Copié';
      btnCopy.classList.add('copied');
      setTimeout(() => {
        btnCopy.textContent = original;
        btnCopy.classList.remove('copied');
      }, 2000);
    } catch(e) {
      console.warn('[LMF] Impossible de copier l\'email');
    }
  });
})();