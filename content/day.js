(function(){
  var S=__START__;
  var t=new Date();
  var d=Math.floor((Date.UTC(t.getFullYear(),t.getMonth(),t.getDate())-Date.UTC(S.y,S.m-1,S.d))/86400000);
  var N=d<0?1:(d%40)+1;
  var lis=document.querySelectorAll('li[data-day="'+N+'"]');
  for(var i=0;i<lis.length;i++){lis[i].classList.add('is-today');}
  var pl=document.querySelector('.hero button.play'),v=document.querySelector('.hero video');
  if(pl&&v){pl.addEventListener('click',function(){
    v.hidden=false;pl.hidden=true;
    if(v.textTracks&&v.textTracks[0]){v.textTracks[0].mode='showing';}
    v.play();
  });}
  var b=document.getElementById('share');
  if(b&&navigator.share){
    var f=document.getElementById('share-links');
    if(f){f.hidden=true;}
    b.hidden=false;
    b.addEventListener('click',function(){
      navigator.share({title:b.getAttribute('data-title'),text:b.getAttribute('data-text'),url:'https://3r4l.org/'}).catch(function(){});
    });
  }
})();
