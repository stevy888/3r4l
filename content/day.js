(function(){
  var S=__START__;
  var t=new Date();
  var d=Math.floor((Date.UTC(t.getFullYear(),t.getMonth(),t.getDate())-Date.UTC(S.y,S.m-1,S.d))/86400000);
  var N=d<0?1:(d%40)+1;
  var lis=document.querySelectorAll('li[data-day="'+N+'"]');
  for(var i=0;i<lis.length;i++){lis[i].classList.add('is-today');}
  /* THE LIVING CARD (owner 2026-10-09): the one audio (0 bytes before the tap), the play door, the cues the card was read to ([start, end] per cue, baked from content/card.vtt);
     the cue being read wears .now on every <em class="c"> that carries it (the home's paper and /card/'s whole card share the numbering); on the home the hidden lines of the paper
     arrive as the voice reaches them (.read.on, p.on) and fold away four seconds after the reading; the page follows the line when it leaves the screen. */
  var CU=__CUES__,au=document.querySelector('audio.card'),pl=document.querySelector('button.play');
  if(au&&pl&&CU.length){
    var label=pl.textContent,pause=pl.getAttribute('data-pause'),round=pl.classList.contains('round'),cur=-1,fold=null;
    var ems=function(i){return document.querySelectorAll('em.c[data-c="'+i+'"]');};
    var set=function(i){
      if(i===cur){return;}
      var k,e,p;
      if(cur>=0){e=ems(cur);for(k=0;k<e.length;k++){e[k].classList.remove('now');}}
      cur=i;
      if(i<0){return;}
      e=ems(i);
      for(k=0;k<e.length;k++){
        e[k].classList.add('now');
        p=e[k].parentNode;
        if(p&&p.parentNode&&p.parentNode.classList.contains('read')){p.parentNode.classList.add('on');p.classList.add('on');}
      }
      if(e.length){var r=e[0].getBoundingClientRect();if(r.top<72||r.bottom>window.innerHeight-72){e[0].scrollIntoView({block:'center',behavior:'smooth'});}}
    };
    var tick=function(t){var i,at=-1;for(i=0;i<CU.length;i++){if(t>=CU[i][0]-0.1&&t<CU[i][1]+0.3){at=i;}}set(at);};
    var off=function(){document.body.classList.remove('reading');pl.classList.remove('on');if(!round){pl.textContent=label;}};
    au.addEventListener('timeupdate',function(){tick(au.currentTime);});
    au.addEventListener('play',function(){clearTimeout(fold);document.body.classList.add('reading');pl.classList.add('on');if(!round){pl.textContent=pause;}});
    au.addEventListener('pause',off);
    au.addEventListener('ended',function(){set(-1);off();fold=setTimeout(function(){var on=document.querySelectorAll('.read.on, .read .on');for(var k=0;k<on.length;k++){on[k].classList.remove('on');}},4000);});
    pl.addEventListener('click',function(ev){ev.preventDefault();ev.stopPropagation();if(au.paused){au.play();}else{au.pause();}});
    window.__at=tick; /* the proof's hand (prove-reading.mjs): lights the cue at a time without a decoder */
  }
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
