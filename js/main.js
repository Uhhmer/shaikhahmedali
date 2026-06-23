document.getElementById('yr').textContent = new Date().getFullYear();
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

window.addEventListener('load', () => {
  const hasGSAP = typeof gsap !== 'undefined';
  const hasST = typeof ScrollTrigger !== 'undefined';
  const hasLenis = typeof Lenis !== 'undefined';
  if (hasGSAP && hasST) gsap.registerPlugin(ScrollTrigger);

  /* ---------- LETTER ROLL on skill chips + social links (play once, no reverse) ---------- */
  (function(){
    if(!FINE) return;
    var els=[].slice.call(document.querySelectorAll('.skill, .socials__links a'));
    if(!els.length) return;
    var step=24;
    function graphemes(t){
      if(typeof Intl!=='undefined' && Intl.Segmenter){
        var seg=new Intl.Segmenter('en',{granularity:'grapheme'});
        return Array.from(seg.segment(t), function(s){return s.segment;});
      }
      return Array.from(t);
    }
    function splitInto(node){
      [].slice.call(node.childNodes).forEach(function(n){
        if(n.nodeType===3){
          var frag=document.createDocumentFragment();
          graphemes(n.textContent).forEach(function(ch){
            if(ch===' '){ frag.appendChild(document.createTextNode(' ')); return; }
            var g=document.createElement('span'); g.className='casc-g'; g.textContent=ch; frag.appendChild(g);
          });
          n.replaceWith(frag);
        } else if(n.nodeType===1){ splitInto(n); }
      });
    }
    els.forEach(function(el){
      el.classList.add('casc-host');
      var line=document.createElement('span'); line.className='casc-line';
      while(el.firstChild){ line.appendChild(el.firstChild); }
      splitInto(line);
      el.appendChild(line);
      var glyphs=[].slice.call(el.querySelectorAll('.casc-g'));
      var on=false;
      function nearest(x){ var b=0,bd=Infinity; for(var i=0;i<glyphs.length;i++){ var r=glyphs[i].getBoundingClientRect(); var c=r.left+r.width/2, d=Math.abs(c-x); if(d<bd){bd=d;b=i;} } return b; }
      el.addEventListener('pointerenter',function(e){
        if(on) return; on=true;
        var hi=nearest(e.clientX);
        glyphs.forEach(function(g,i){ g.style.transition=''; g.style.transitionDelay=(Math.abs(i-hi)*step)+'ms'; });
        el.classList.add('casc-on');
      });
      el.addEventListener('pointerleave',function(){
        on=false;
        glyphs.forEach(function(g){ g.style.transition='none'; });
        el.classList.remove('casc-on');
        void el.offsetWidth;
        glyphs.forEach(function(g){ g.style.transition=''; });
      });
    });
  })();

  /* ---------- LOADER ---------- */
  const loader = document.getElementById('loader');
  const count = document.getElementById('count');
  const bar = document.getElementById('bar');
  function finishLoad(){
    window.__loaderHandled = true;
    if (loader && loader.parentNode){
      if (hasGSAP){ gsap.to(loader,{yPercent:-100,duration:.9,ease:'power4.inOut',onComplete:()=>loader.remove(),delay:.15}); }
      else { loader.style.transition='opacity .5s'; loader.style.opacity='0'; setTimeout(()=>loader.remove(),500); }
    }
    startEntrance();
  }
  if (REDUCED){ count.textContent='100'; bar.style.width='100%'; setTimeout(finishLoad,250); }
  else {
    let p=0;
    const tick=setInterval(()=>{
      p+=Math.max(1,Math.round((100-p)*0.12));
      if(p>=100){p=100;clearInterval(tick);setTimeout(finishLoad,180);}
      count.textContent=p; bar.style.width=p+'%';
    },45);
  }

  /* ---------- SMOOTH SCROLL ---------- */
  let lenis=null;
  if (hasLenis && !REDUCED){
    lenis = new Lenis({duration:1.1,easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)),smoothWheel:true});
    function raf(t){lenis.raf(t);requestAnimationFrame(raf);} requestAnimationFrame(raf);
    if (hasST){ lenis.on('scroll', ScrollTrigger.update); }
  }
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',e=>{
      const id=a.getAttribute('href'); if(id.length<2)return;
      const el=document.querySelector(id); if(!el)return;
      e.preventDefault(); closeMenu();
      if(lenis){lenis.scrollTo(el,{offset:0,duration:1.2});}
      else{el.scrollIntoView({behavior:REDUCED?'auto':'smooth'});}
    });
  });

  /* ---------- MENU ---------- */
  const menu=document.getElementById('menu');
  const openBtn=document.getElementById('menuOpen');
  const closeBtn=document.getElementById('menuClose');
  function openMenu(){menu.classList.add('open');menu.setAttribute('aria-hidden','false');if(lenis)lenis.stop();}
  function closeMenu(){menu.classList.remove('open');menu.setAttribute('aria-hidden','true');if(lenis)lenis.start();}
  openBtn.addEventListener('click',openMenu);
  closeBtn.addEventListener('click',closeMenu);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});

  /* ---------- AUTO-HIDE NAV (hide on scroll down, reveal on scroll up — no overlap with content) ---------- */
  (function(){
    var nav=document.querySelector('.nav');
    if(!nav) return;
    var lastY=(window.scrollY||0), hidden=false;
    function show(){ if(hidden){ nav.style.transform=''; hidden=false; } }
    function hide(){ if(!hidden){ nav.style.transform='translateY(-135%)'; hidden=true; } }
    function update(y){
      if(menu.classList.contains('open')){ show(); lastY=y; return; }   // keep visible while menu is open
      if(y>lastY+4 && y>150){ hide(); }                                  // scrolling down past the hero → hide
      else if(y<lastY-4 || y<80){ show(); }                              // scrolling up or near top → reveal
      lastY=y;
    }
    if(lenis){ lenis.on('scroll',function(e){ update((e&&e.scroll!=null)?e.scroll:(window.scrollY||0)); }); }
    else { window.addEventListener('scroll',function(){ update(window.scrollY||0); },{passive:true}); }
  })();

  /* ---------- CUSTOM CURSOR ---------- */
  if (FINE && !REDUCED){
    document.documentElement.classList.add('has-cursor');
    const cur=document.querySelector('.cursor'), dot=document.querySelector('.cursor-dot');
    const label=cur.querySelector('.cursor-label');
    let mx=innerWidth/2,my=innerHeight/2,cx=mx,cy=my;
    addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;dot.style.transform=`translate(${mx}px,${my}px) translate(-50%,-50%)`;});
    (function loop(){cx+=(mx-cx)*.18;cy+=(my-cy)*.18;cur.style.transform=`translate(${cx}px,${cy}px) translate(-50%,-50%)`;requestAnimationFrame(loop);})();
    document.querySelectorAll('a,button,[data-cursor]').forEach(el=>{
      el.addEventListener('mouseenter',()=>{cur.classList.add('is-hover');const t=el.getAttribute('data-cursor');label.textContent=(t&&t.length)?t:'';});
      el.addEventListener('mouseleave',()=>cur.classList.remove('is-hover'));
    });
    document.querySelectorAll('.pill,.menu-btn,.proj__arrow,.to-top,.btn-dark,.btn-line,.btn-send,.btn-ghost').forEach(el=>{
      el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect();const x=e.clientX-r.left-r.width/2;const y=e.clientY-r.top-r.height/2;el.style.transform=`translate(${x*.3}px,${y*.4}px)`;});
      el.addEventListener('mouseleave',()=>{el.style.transform='';});
    });
  }

  /* ---------- CONTACT FORM (static, mailto) ---------- */
  (function(){
    const EMAIL='shaikhahmedali839@gmail.com'; /* Send message → mailto here; Copy email → clipboard */
    let topic='Full-time role';
    document.querySelectorAll('.topic').forEach(b=>{
      b.addEventListener('click',()=>{
        document.querySelectorAll('.topic').forEach(x=>x.classList.remove('is-active'));
        b.classList.add('is-active'); topic=b.getAttribute('data-topic');
      });
    });
    const val=id=>{const el=document.getElementById(id);return el?el.value.trim():'';};
    const send=document.getElementById('sendNote');
    if(send) send.addEventListener('click',()=>{
      const name=val('cName'),email=val('cEmail'),note=val('cNote');
      const subject=encodeURIComponent('Portfolio enquiry — '+topic);
      const body=encodeURIComponent('Name: '+(name||'—')+'\nReply to: '+(email||'—')+'\nTopic: '+topic+'\n\n'+(note||''));
      window.location.href='mailto:'+EMAIL+'?subject='+subject+'&body='+body;
    });
    const copy=document.getElementById('copyEmail');
    if(copy) copy.addEventListener('click',()=>{
      const flash=(msg)=>{const prev=copy.textContent;copy.textContent=msg;setTimeout(()=>{copy.textContent=prev;},1600);};
      if(!EMAIL){flash('Email coming soon');return;}
      const ok=()=>flash('Copied ✓');
      const fallback=()=>{const ta=document.createElement('textarea');ta.value=EMAIL;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');ok();}catch(e){}ta.remove();};
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(EMAIL).then(ok).catch(fallback);}else{fallback();}
    });
  })();

  /* ---------- HANDCRAFTED: 3D image tilt on hover ---------- */
  if (FINE && !REDUCED){
    document.querySelectorAll('.portrait, .feature__media').forEach(function(fig){
      var img=fig.querySelector('img'); if(!img) return;
      fig.addEventListener('mousemove',function(e){
        var r=fig.getBoundingClientRect();
        var px=(e.clientX-r.left)/r.width-0.5, py=(e.clientY-r.top)/r.height-0.5;
        img.style.transform='perspective(900px) rotateX('+(-py*6).toFixed(2)+'deg) rotateY('+(px*8).toFixed(2)+'deg) scale(1.06)';
      });
      fig.addEventListener('mouseleave',function(){ img.style.transform=''; });
    });
  }

  /* ---------- HANDCRAFTED: hero stat count-up (falls back to final text) ---------- */
  (function(){
    var stats=document.querySelectorAll('.hero__stats .st b');
    if(!stats.length || REDUCED || !('IntersectionObserver' in window)) return;
    stats.forEach(function(b){ b.dataset.final=b.textContent.trim(); });
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(!e.isIntersecting) return; io.disconnect();
        stats.forEach(function(b){
          var raw=b.dataset.final, m=raw.match(/^([0-9.]+)(.*)$/); if(!m){return;}
          var target=parseFloat(m[1]), suffix=m[2]||'', dec=(m[1].split('.')[1]||'').length;
          var t0=performance.now(), dur=1500;
          (function tick(now){ var p=Math.min(1,(now-t0)/dur), e2=1-Math.pow(1-p,3);
            b.textContent=(target*e2).toFixed(dec)+suffix;
            if(p<1) requestAnimationFrame(tick); else b.textContent=raw;
          })(t0);
        });
      });
    },{threshold:.6});
    io.observe(document.querySelector('.hero__stats'));
  })();

  /* ---------- SOCIALS FAN: reactive distance-based spread (à la Lando) ---------- */
  (function(){
    var fan=document.querySelector('.fan');
    if(!fan || !FINE || REDUCED) return;
    var cards=[].slice.call(fan.querySelectorAll('.fan__card'));
    var base=[[-14,40],[-8,16],[-3,4],[3,4],[8,16],[14,40]];
    function apply(active){
      cards.forEach(function(c,i){
        if(i===active){
          c.style.transform='translate(0px,-34px) rotate(0deg) scale(1.12)';
          c.style.zIndex='40';
          c.style.boxShadow='0 40px 70px rgba(0,0,0,.32)';
        } else {
          var d=i-active, dir=d<0?-1:1, ad=Math.abs(d);
          var tx=dir*(60+(ad-1)*34);
          var rot=(base[i]?base[i][0]:0)*0.45;
          c.style.transform='translate('+tx+'px,-8px) rotate('+rot+'deg) scale(1)';
          c.style.zIndex=String(20-ad);
          c.style.boxShadow='';
        }
      });
    }
    function reset(){ cards.forEach(function(c){ c.style.transform=''; c.style.zIndex=''; c.style.boxShadow=''; }); }
    var lastIdx=-1;
    function pick(x){ var idx=0,best=Infinity; for(var i=0;i<cards.length;i++){ var r=cards[i].getBoundingClientRect(); var cx=(r.left+r.right)/2, dd=Math.abs(cx-x); if(dd<best){best=dd;idx=i;} } return idx; }
    fan.addEventListener('mousemove',function(e){ var idx=pick(e.clientX); if(idx!==lastIdx){ lastIdx=idx; apply(idx); } });
    fan.addEventListener('mouseleave',function(){ lastIdx=-1; reset(); });
  })();

  /* ---------- NAV colour adapts to the section behind it (replaces blend inversion) ---------- */
  (function(){
    var nav=document.querySelector('.nav');
    if(!nav) return;
    var darks=[].slice.call(document.querySelectorAll('.strip, .manifesto, .feature, .exp, .edu, .contact'));
    var navY=44;
    function update(){
      var dark=false;
      for(var i=0;i<darks.length;i++){ var r=darks[i].getBoundingClientRect(); if(r.top<=navY && r.bottom>=navY){ dark=true; break; } }
      nav.classList.toggle('is-dark', dark);
    }
    update();
    window.addEventListener('scroll', update, {passive:true});
    window.addEventListener('resize', update);
    if(typeof lenis!=='undefined' && lenis && lenis.on) lenis.on('scroll', update);
  })();

  /* ---------- PROJECT LINKS: don't reload the page when no URL is set yet ---------- */
  [].forEach.call(document.querySelectorAll('a.proj'), function(a){
    a.addEventListener('click', function(e){
      var h=a.getAttribute('href');
      if(!h || h==='#'){ e.preventDefault(); }   /* real links still work once added */
    });
  });

  if (!hasGSAP){ return; } /* no lib → content already visible */

  /* ---------- ENTRANCE ---------- */
  function startEntrance(){
    if (REDUCED) return;
    const tl=gsap.timeline({delay:.05});
    tl.from('[data-hero] span',{yPercent:115,duration:1,ease:'power4.out',stagger:.08})
      .from('.hero__role,.hero__lede,.hero__cta,.hero__stats',{y:30,opacity:0,duration:.8,ease:'power3.out',stagger:.08},'-=.6');
  }

  /* When the story-scroll takes over (desktop), its panels manage their own reveal —
     skip the per-element scroll reveals inside it so nothing is ever left hidden while pinned. */
  var STORY_ACTIVE = !REDUCED && window.matchMedia('(min-width:768px)').matches;

  /* ---------- SECTION-AWARE SCROLL REVEALS (varied motion per section) ---------- */
  if(!REDUCED){
    // baseline fade-up for eyebrows / section heads / small bits (hero handled by its own entrance)
    gsap.utils.toArray('[data-fade]').forEach(function(el){
      if(el.closest('.hero')) return;
      if(STORY_ACTIVE && el.closest('#story-scroll')) return;
      gsap.from(el,{y:34,opacity:0,duration:.9,ease:'power3.out',clearProps:'transform',scrollTrigger:{trigger:el,start:'top 85%'}});
    });
    // tailored reveal keyed to each section's content
    gsap.utils.toArray('[data-reveal]').forEach(function(el){
      if(STORY_ACTIVE && el.closest('#story-scroll')) return;
      var c=(el.closest('section')||document.body).className||'';
      var base={trigger:el,start:'top 80%'};
      if(c.indexOf('work')>-1){                 // PROJECTS — horizontal slide-in
        gsap.from(el,{x:-90,rotate:-2,opacity:0,duration:1.05,ease:'back.out(1.5)',clearProps:'transform',scrollTrigger:base});
      } else if(c.indexOf('exp')>-1){           // EXPERIENCE — soft float-up, sequential
        gsap.from(el,{y:80,scale:.94,opacity:0,duration:1.05,ease:'back.out(1.4)',clearProps:'transform',scrollTrigger:base});
      } else if(c.indexOf('skills')>-1){        // SKILLS — column lift + chip stagger-pop
        gsap.from(el,{y:44,opacity:0,duration:.9,ease:'power3.out',clearProps:'transform',scrollTrigger:base});
        var chips=el.querySelectorAll('.skill');
        if(chips.length){[].forEach.call(chips,function(ch){ch.style.transition='none';});gsap.from(chips,{scale:.55,opacity:0,duration:.6,ease:'back.out(1.9)',stagger:{each:.03,from:'start'},clearProps:'transform',scrollTrigger:{trigger:el,start:'top 80%'},onComplete:function(){[].forEach.call(chips,function(ch){ch.style.transition='';});}});}
      } else if(c.indexOf('edu')>-1){           // EDUCATION — directional slide from left
        gsap.from(el,{x:-80,rotate:-1.5,opacity:0,duration:1,ease:'back.out(1.4)',clearProps:'transform',scrollTrigger:base});
      } else if(c.indexOf('certs')>-1){         // CREDENTIALS — scale pop
        el.style.transition='none';gsap.from(el,{scale:.68,rotate:-6,opacity:0,duration:.85,ease:'back.out(1.9)',clearProps:'transform',scrollTrigger:base,onComplete:function(){el.style.transition='';}});
      } else if(c.indexOf('about')>-1){         // STORY — slide from right
        el.style.transition='none';gsap.from(el,{x:70,rotate:2,opacity:0,duration:1,ease:'back.out(1.4)',clearProps:'transform',scrollTrigger:base,onComplete:function(){el.style.transition='';}});
      } else if(c.indexOf('contact')>-1){       // CONTACT — blur removal + scale
        gsap.from(el,{scale:.9,opacity:0,filter:'blur(16px)',duration:1.1,ease:'back.out(1.3)',clearProps:'transform,filter',scrollTrigger:base});
      } else {
        gsap.from(el,{y:46,opacity:0,duration:.9,ease:'power3.out',clearProps:'transform',scrollTrigger:base});
      }
    });
    // SOCIALS — staggered card entrance from the centre (keeps the CSS fan transforms intact)
    var fanCards=STORY_ACTIVE ? [] : gsap.utils.toArray('.fan__card');
    if(fanCards.length){
      gsap.from(fanCards,{opacity:0,duration:.6,ease:'power2.out',stagger:{each:.08,from:'center'},clearProps:'opacity',scrollTrigger:{trigger:'.socials',start:'top 72%'}});
      gsap.from(document.querySelectorAll('.fan__card img'),{scale:.5,opacity:0,duration:.8,ease:'back.out(1.7)',stagger:{each:.08,from:'center'},clearProps:'transform',scrollTrigger:{trigger:'.socials',start:'top 72%'}});
    }
    // WORD REVEAL (manifesto + contact heading) — content masking
    gsap.utils.toArray('[data-words]').forEach(function(block){
      if(STORY_ACTIVE && block.closest('#story-scroll')) return; // managed by story-scroll
      const tmp=document.createElement('div'); tmp.innerHTML=block.innerHTML;
      (function wrap(node){
        node.childNodes.forEach(function(child){
          if(child.nodeType===3){
            const frag=document.createDocumentFragment();
            child.textContent.split(/(\s+)/).forEach(function(part){
              if(part.trim()===''){frag.appendChild(document.createTextNode(part));return;}
              const w=document.createElement('span');w.className='w';
              const inner=document.createElement('span');inner.textContent=part;
              w.appendChild(inner);frag.appendChild(w);
            });
            child.replaceWith(frag);
          } else if(child.nodeType===1){ wrap(child); }
        });
      })(tmp);
      block.innerHTML=tmp.innerHTML;
      gsap.from(block.querySelectorAll('.w>span'),{yPercent:115,duration:.9,ease:'power4.out',stagger:.045,scrollTrigger:{trigger:block,start:'top 82%'}});
    });
  }

  /* ---------- PARALLAX + MARQUEE ---------- */
  if(!REDUCED){
    gsap.utils.toArray('[data-parallax]').forEach(el=>{
      const amt=parseFloat(el.getAttribute('data-parallax'));
      gsap.to(el,{yPercent:amt*100,ease:'none',scrollTrigger:{trigger:el,start:'top bottom',end:'bottom top',scrub:true}});
    });
    gsap.utils.toArray('[data-marquee]').forEach(el=>{
      const dir=parseFloat(el.getAttribute('data-marquee'));
      gsap.to(el,{xPercent:-50*dir,ease:'none',scrollTrigger:{trigger:el,start:'top bottom',end:'bottom top',scrub:1}});
    });
  }

  /* ---------- FEATURE: scroll-expand image, then sign it (autograph overlay) ---------- */
  (function(){
    var sigPath=document.getElementById('sigPath');
    var media=document.querySelector('.feature__media');
    var overlay=document.querySelector('.feature__sign');
    var armed=false;
    if(sigPath && !REDUCED){
      var len=sigPath.getTotalLength();
      sigPath.style.strokeDasharray=len; sigPath.style.strokeDashoffset=len; sigPath.style.fillOpacity='0';
      sigPath.style.transition='stroke-dashoffset 1.3s cubic-bezier(.6,0,.2,1), fill-opacity .55s ease .85s';
      if(overlay) overlay.style.opacity='0';
      armed=true;
    }
    var played=false;
    function playSig(){ if(played) return; played=true;
      if(overlay) overlay.style.opacity='1';
      if(armed && sigPath){ sigPath.style.strokeDashoffset='0'; sigPath.style.fillOpacity='1'; }
    }
    if(media && hasST && !REDUCED){
      gsap.fromTo(media,{scale:0.52},{scale:1,ease:'none',
        scrollTrigger:{trigger:'.feature__track',start:'top top',end:'bottom bottom',scrub:true,
          onUpdate:function(self){ if(self.progress>0.82) playSig(); }}});
      ScrollTrigger.create({trigger:'.feature__track',start:'bottom center',once:true,onEnter:playSig});
      setTimeout(function(){ if(!played) playSig(); }, 16000);
    } else { playSig(); }
  })();

  /* ============================== STORY SCROLL ENGINE ==============================
     One pinned stage. Panels are stacked (absolute) and z-ordered.
     Per panel, tied 1:1 to scroll: (1) slide up from below at an angle over the
     static previous panel, (2) scroll its inner content up to expose EVERYTHING,
     (3) hold on the fully-read panel, then the next panel slides in.
     Reversible. Desktop only — mobile/reduced-motion keep plain stacked scrolling. */
  function buildStory(){
    if(!STORY_ACTIVE || !hasST) return;
    var sw=document.getElementById('story-scroll');
    if(!sw) return;
    var panels=[].slice.call(sw.children).filter(function(n){return n.tagName==='SECTION';});
    if(!panels.length) return;

    var ANGLE=10; /* rotation (deg) of the incoming panel — matches the reference tilt */

    /* wrap each panel's content so we can slide the panel and scroll its content independently */
    panels.forEach(function(sec,i){
      var inner=document.createElement('div'); inner.className='scene-inner';
      while(sec.firstChild){ inner.appendChild(sec.firstChild); }
      sec.appendChild(inner);
      sec.style.zIndex=String(10+i*10);
    });

    sw.classList.add('is-active');     /* panels become absolute, full-viewport, stacked */
    ScrollTrigger.refresh();           /* settle layout before measuring */

    var vh=window.innerHeight;
    var data=panels.map(function(sec){
      var inner=sec.querySelector('.scene-inner');
      var bottomGap=Math.round(vh*0.06);                       /* clear the last line before next slides over */
      var excess=Math.max(0, inner.scrollHeight - sec.clientHeight + bottomGap);
      return {sec:sec, inner:inner, excess:excess};
    });

    /* arm panels 2..N off-screen: fully below + rotated */
    data.forEach(function(d,i){ if(i>0) gsap.set(d.sec,{yPercent:100, rotation:ANGLE}); });

    var slideInPx=Math.round(vh*0.90);   /* scroll length for a panel to glide in */
    var holdPx   =Math.round(vh*0.60);   /* generous dwell on the fully-read panel */

    /* total pinned scroll length = sum of every panel's (slide-in + reveal + hold) */
    var total=0;
    data.forEach(function(d,i){ total += (i>0?slideInPx:0) + d.excess + holdPx; });

    var tl=gsap.timeline({
      scrollTrigger:{ trigger:sw, start:'top top', end:'+='+total, pin:true, scrub:1, anticipatePin:1 }
    });

    var t=0;
    data.forEach(function(d,i){
      if(i>0){                                               /* 1. slide in over the static previous panel */
        tl.to(d.sec,{yPercent:0, rotation:0, ease:'power2.out', duration:slideInPx}, t);
        t+=slideInPx;
      }
      if(d.excess>0){                                        /* 2. reveal: scroll content up 1:1, exposing all of it */
        tl.to(d.inner,{y:-d.excess, ease:'none', duration:d.excess}, t);
        t+=d.excess;
      }
      t+=holdPx;                                             /* 3. hold on the fully-read panel */
    });
    /* final dwell on the last panel so the timeline length matches the pinned scroll length */
    tl.to({_:0},{_:1, duration:holdPx});

    ScrollTrigger.refresh();
  }
  /* build after fonts settle so content heights (hence reveal distances) are exact */
  if(document.fonts && document.fonts.ready){ document.fonts.ready.then(buildStory); } else { buildStory(); }

  ScrollTrigger.refresh();
});
