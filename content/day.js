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
  var CU=__CUES__,au=document.querySelector('audio.card'),hr=document.querySelector('button.hear'),pl=document.querySelector('button.play')||hr; /* the home has no door on the drawing (rb-2): the hear door is the one hand */
  var H=document.getElementById('hero'),SC=[1,2,3,7,10,11];
  if(au&&pl&&CU.length){
    var lab=hr||pl,label=lab.textContent,pause=lab.getAttribute('data-pause'),round=!hr,cur=-1,fold=null; /* the labelled hand: the pair row's hear door on the home (the glyph on the sun has only an aria-label); on /card/ the round glyph itself */
    var ems=function(i){return document.querySelectorAll('em.c[data-c="'+i+'"]');};
    var set=function(i){
      if(i===cur){return;}
      var k,e,p;
      if(cur>=0){e=ems(cur);for(k=0;k<e.length;k++){e[k].classList.remove('now');}}
      cur=i;
      if(H&&i>=0){for(var s=0;s<SC.length;s++){if(i>=SC[s]){H.classList.add('s'+(s+1));}}}
      if(i<0){return;}
      e=ems(i);
      for(k=0;k<e.length;k++){
        e[k].classList.add('now');
        p=e[k].parentNode;
        if(p&&p.parentNode&&p.parentNode.classList.contains('read')){var sib=p.parentNode.querySelectorAll('p.on');for(var m=0;m<sib.length;m++){if(sib[m]!==p){sib[m].classList.remove('on');}}p.parentNode.classList.add('on');p.classList.add('on');} /* the plate's label: ONE line at a time (the paper of the living card let the lines accumulate; a read line left .on stood as an empty padded box above the live one — the cure of 2026-10-09) */
      }
      if(e.length){var r=e[0].getBoundingClientRect();if(r.top<72||r.bottom>window.innerHeight-72){e[0].scrollIntoView({block:H?'nearest':'center',behavior:'smooth'});} /* the home (the plate): the gentlest scroll, so the plate stays on the screen while the card's rule lights at 320 (the cure of 2026-10-09, both judges); /card/: the line to the centre as before */}
    };
    var tick=function(t){var i,at=-1;for(i=0;i<CU.length;i++){if(t>=CU[i][0]-0.1&&t<CU[i][1]+0.3){at=i;}}set(at);};
    var off=function(){document.body.classList.remove('reading');pl.classList.remove('on');if(hr){hr.classList.remove('on');}if(!round){lab.textContent=label;}};
    au.addEventListener('timeupdate',function(){tick(au.currentTime);});
    au.addEventListener('play',function(){clearTimeout(fold);document.body.classList.add('reading');pl.classList.add('on');if(hr){hr.classList.add('on');}if(!round){lab.textContent=pause;}if(H){if(au.currentTime<0.5){for(var s=1;s<=SC.length;s++){H.classList.remove('s'+s);}}H.classList.add('on');}});
    au.addEventListener('pause',off);
    au.addEventListener('ended',function(){set(-1);off();fold=setTimeout(function(){var on=document.querySelectorAll('.read.on, .read .on');for(var k=0;k<on.length;k++){on[k].classList.remove('on');}if(H){H.classList.remove('on');for(var s=1;s<=SC.length;s++){H.classList.remove('s'+s);}}},4000);});
    var toggle=function(ev){ev.preventDefault();ev.stopPropagation();if(au.paused){au.play();}else{au.pause();}};
    pl.addEventListener('click',toggle);if(hr&&hr!==pl){hr.addEventListener('click',toggle);}
    window.__at=tick; /* the proof's hand (prove-reading.mjs): lights the cue at a time without a decoder */
  }
  if('serviceWorker' in navigator&&document.referrer.indexOf(location.origin)===0){ /* THE OFFLINE WORKER (rung 3): registered from the second page on — a first load asks for nothing but the fonts */
    navigator.serviceWorker.register(document.querySelector('link[rel=manifest]').href.replace(/manifest\.webmanifest$/,'sw.js')).catch(function(){});
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
