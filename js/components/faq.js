function toggleFaq(btn){
  const id=btn.getAttribute('aria-controls'),ans=document.getElementById(id),tog=btn.querySelector('.faq-toggle'),num=id.replace('fa',''),sep=document.getElementById('fs'+num),isOpen=ans.classList.contains('open');
  document.querySelectorAll('.faq-a').forEach(e=>e.classList.remove('open'));
  document.querySelectorAll('.faq-toggle').forEach(e=>e.classList.remove('open'));
  document.querySelectorAll('.faq-q').forEach(e=>e.setAttribute('aria-expanded','false'));
  document.querySelectorAll('.faq-sep').forEach(e=>e.classList.remove('hidden'));
  if(!isOpen){ans.classList.add('open');tog.classList.add('open');btn.setAttribute('aria-expanded','true');if(sep)sep.classList.add('hidden')}
}