(function(){
  var r=document.documentElement,b=document.getElementById('theme');if(!b){return;}
  function dark(){var t=r.getAttribute('data-theme');if(t){return t==='dark';}return window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;}
  function mark(){b.setAttribute('aria-label',dark()?b.getAttribute('data-label-light'):b.getAttribute('data-label-dark'));}
  b.addEventListener('click',function(){var v=dark()?'light':'dark';r.setAttribute('data-theme',v);try{localStorage.setItem('theme',v);}catch(e){}mark();});
  mark();
})();