(function(){
  var nav=document.querySelector('.site-nav');
  if(nav){addEventListener('scroll',function(){nav.classList.toggle('scrolled',scrollY>10)},{passive:true});}
  var burger=document.querySelector('.burger'),links=document.querySelector('.nav-links');
  if(burger&&links){burger.addEventListener('click',function(){links.classList.toggle('open')});}

  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}})},{threshold:.1});
  document.querySelectorAll('.rv').forEach(function(el){io.observe(el)});

  // theme filter (index)
  var chips=document.querySelectorAll('.chip[data-f]');
  chips.forEach(function(c){c.addEventListener('click',function(){
    chips.forEach(function(x){x.classList.remove('on')});c.classList.add('on');
    var f=c.dataset.f;
    document.querySelectorAll('.theme[data-theme]').forEach(function(t){
      t.classList.toggle('hidden',f!=='all'&&t.dataset.theme!==f);
      t.querySelectorAll('.rv').forEach(function(r){r.classList.add('in')});
    });
    if(f!=='all'){var t=document.querySelector('.theme[data-theme="'+f+'"]');if(t)scrollTo({top:t.getBoundingClientRect().top+scrollY-140,behavior:'smooth'});}
  })});
  if(location.hash){var h=document.querySelector('.chip[data-f="'+location.hash.slice(1)+'"]');if(h)h.click();}

  // table of contents highlight (project pages)
  var toc=document.querySelectorAll('.toc a');
  if(toc.length){
    var secs=Array.prototype.map.call(toc,function(a){return document.querySelector(a.getAttribute('href'))});
    var spy=function(){var y=scrollY+160,i=0;secs.forEach(function(s,k){if(s&&s.offsetTop<=y)i=k});toc.forEach(function(a,k){a.classList.toggle('on',k===i)})};
    addEventListener('scroll',spy,{passive:true});spy();
  }

  // copy citation
  document.querySelectorAll('.copy').forEach(function(b){b.addEventListener('click',function(){
    var t=b.parentElement.querySelector('code').innerText;
    (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){b.textContent='Copied'},function(){b.textContent='Select and copy'});
    setTimeout(function(){b.textContent='Copy'},1800);
  })});

  // figure lightbox
  var lb=document.createElement('div');lb.className='lb';lb.innerHTML='<img alt="">';document.body.appendChild(lb);
  document.querySelectorAll('figure img').forEach(function(img){img.addEventListener('click',function(){lb.querySelector('img').src=img.src;lb.querySelector('img').alt=img.alt;lb.classList.add('open')})});
  lb.addEventListener('click',function(){lb.classList.remove('open')});
  addEventListener('keydown',function(e){if(e.key==='Escape')lb.classList.remove('open')});

  var y=document.getElementById('yr');if(y)y.textContent=new Date().getFullYear();
})();

// contact form: opens the visitor's email app with the message filled in
(function(){
  var f=document.getElementById('cform');if(!f)return;
  var note=document.getElementById('form-note');
  f.addEventListener('submit',function(e){
    e.preventDefault();
    var n=f.name.value.trim(),m=f.email.value.trim(),s=f.subject.value.trim(),b=f.message.value.trim();
    if(!n||!m||!b||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m)){note.textContent=note.dataset.error||'Please add your name, a valid email and a message.';return;}
    var body=b+'\n\n'+n+'\n'+m;
    location.href='mailto:zahra.gharaee@gmail.com?subject='+encodeURIComponent(s||('Message from '+n))+'&body='+encodeURIComponent(body);
    note.textContent=note.dataset.ok||'Your email app should open with the message ready to send.';
  });
})();

/* example record: dashed lines from each card to the photo */
(function(){
  var recs=document.querySelectorAll('.rec');
  if(!recs.length)return;
  var NS='http://www.w3.org/2000/svg';
  function draw(rec){
    var old=rec.querySelector('svg.rec-lines'); if(old)old.remove();
    var photo=rec.querySelector('.rec-photo'); if(!photo)return;
    var cols=rec.querySelectorAll('.rec-col');
    if(getComputedStyle(rec).gridTemplateColumns.split(' ').length<3)return;
    var R=rec.getBoundingClientRect(), P=photo.getBoundingClientRect();
    var cx=P.left+P.width/2-R.left, cy=P.top+P.height/2-R.top, r=P.width/2+9;
    var svg=document.createElementNS(NS,'svg'); svg.setAttribute('class','rec-lines');
    svg.setAttribute('width',R.width); svg.setAttribute('height',R.height);
    cols.forEach(function(col,i){
      col.querySelectorAll('.rec-card').forEach(function(c){
        var C=c.getBoundingClientRect();
        var x1=(i===0?C.right:C.left)-R.left, y1=C.top+C.height/2-R.top;
        var a=Math.atan2(y1-cy,x1-cx), x2=cx+r*Math.cos(a), y2=cy+r*Math.sin(a);
        var mx=(x1+x2)/2;
        var p=document.createElementNS(NS,'path');
        p.setAttribute('d','M'+x1+' '+y1+' C '+mx+' '+y1+', '+mx+' '+y2+', '+x2+' '+y2);
        svg.appendChild(p);
      });
    });
    rec.insertBefore(svg,rec.firstChild);
  }
  /* give the shorter column a little more line spacing, so both columns end level */
  function level(rec){
    var cols=rec.querySelectorAll('.rec-col');
    var lines=rec.querySelectorAll('.rec-card .kvs>b,.rec-card p,.rec-dna');
    lines.forEach(function(l){l.style.paddingTop=l.style.paddingBottom=''});
    if(cols.length<2||getComputedStyle(rec).gridTemplateColumns.split(' ').length<3)return;
    var h=[].map.call(cols,function(c){return c.getBoundingClientRect().height});
    var s=h[0]<h[1]?0:1, d=Math.abs(h[0]-h[1]);
    var own=cols[s].querySelectorAll('.rec-card .kvs>b,.rec-card p,.rec-dna');
    if(!own.length||d<2)return;
    var pad=Math.min(d/own.length,14)/2;
    own.forEach(function(l){l.style.paddingTop=l.style.paddingBottom=pad+'px'});
  }
  function all(){recs.forEach(function(r){level(r);draw(r)})}
  addEventListener('load',all); addEventListener('resize',all);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(all);
})();

/* stat cards: one size for all big numbers, the largest that fits every card */
(function(){
  function fit(){
    document.querySelectorAll('.stats').forEach(function(s){
      var bigs=s.querySelectorAll('.st-big'); if(!bigs.length)return;
      bigs.forEach(function(b){b.style.fontSize=''});
      var size=parseFloat(getComputedStyle(bigs[0]).fontSize);
      while(size>20&&[].some.call(bigs,function(b){return b.scrollWidth>b.clientWidth+1})){
        size-=1; bigs.forEach(function(b){b.style.fontSize=size+'px'});
      }
    });
  }
  addEventListener('load',fit); addEventListener('resize',fit);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
})();

