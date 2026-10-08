(function(){
  var r=document.documentElement,bs=document.querySelectorAll('.theme button[data-set]');
  function mark(){var c=r.getAttribute('data-theme')||'';for(var i=0;i<bs.length;i++){bs[i].setAttribute('aria-pressed',bs[i].getAttribute('data-set')===c?'true':'false');}}
  for(var i=0;i<bs.length;i++){bs[i].addEventListener('click',function(){
    var v=this.getAttribute('data-set');
    if(r.getAttribute('data-theme')===v){r.removeAttribute('data-theme');v='';}else{r.setAttribute('data-theme',v);}
    try{if(v){localStorage.setItem('theme',v);}else{localStorage.removeItem('theme');}}catch(e){}
    mark();
  });}
  mark();
})();