(() => {
  const $=s=>document.querySelector(s), all=s=>[...document.querySelectorAll(s)];
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const available=['de','fr','en','ar'];
  const get=()=>{try{return localStorage.getItem('lang')}catch{return null}};
  const requested=new URLSearchParams(location.search).get('lang');
  let lang=window.dcInitialLanguage||[requested,get()].find(l=>available.includes(l))||'de';
  const reduce=matchMedia('(prefers-reduced-motion: reduce)'); let mediaObserver,revealObserver;
  const ui={ar:['مواقع مختارة','خمس تجارب رقمية. خمس هويات مميزة.','لنتحدث عن مشروعك','تشغيل الفيديو','إيقاف الفيديو مؤقتًا'],de:['Ausgewählte Websites','Fünf digitale Auftritte. Fünf eigene Identitäten.','Projekt anfragen','Video abspielen','Video pausieren'],fr:['Sites sélectionnés','Cinq présences digitales. Cinq identités singulières.','Parlons de votre projet','Lire la vidéo','Mettre en pause'],en:['Selected websites','Five digital experiences. Five distinct identities.','Discuss your project','Play video','Pause video'],es:['Sitios seleccionados','Cinco presencias digitales. Cinco identidades propias.','Hablemos de tu proyecto','Reproducir vídeo','Pausar vídeo'],it:['Siti selezionati','Cinque presenze digitali. Cinque identità uniche.','Parliamo del tuo progetto','Riproduci video','Pausa video']};
  for(const l of available){if(document.body.dataset.portfolio==='ecommerce'){ui[l][0]=({ar:'متاجر إلكترونية مختارة',de:'Ausgewählte Online-Shops',fr:'E-commerce sélectionnés',en:'Selected online stores',es:'Tiendas seleccionadas',it:'E-commerce selezionati'})[l];ui[l][1]=({ar:'خمسة متاجر. خمس تجارب تسوق.',de:'Fünf Shops. Fünf Einkaufserlebnisse.',fr:'Cinq boutiques. Cinq expériences d’achat.',en:'Five stores. Five shopping experiences.',es:'Cinco tiendas. Cinco experiencias de compra.',it:'Cinque negozi. Cinque esperienze di acquisto.'})[l];}else if(document.body.dataset.portfolio==='landing'){ui[l][0]=({ar:'صفحات هبوط مختارة',de:'Ausgewählte Landingpages',fr:'Landing pages sélectionnées',en:'Selected landing pages',es:'Landing pages seleccionadas',it:'Landing page selezionate'})[l];ui[l][1]=({ar:'أربع أفكار. أربعة انطباعات أولى مميزة.',de:'Vier Ideen. Vier starke erste Eindrücke.',fr:'Quatre idées. Quatre premières impressions.',en:'Four ideas. Four lasting first impressions.',es:'Cuatro ideas. Cuatro primeras impresiones.',it:'Quattro idee. Quattro prime impressioni.'})[l];}}
  const internal=hash=>'index.html?lang='+lang+(hash||'');
  function preview(m,item,mobile=false){
    const src=mobile?m.mobileMp4:m.desktopMp4;
    if(!src)return `<div class="portfolio-screen" aria-hidden="true"></div>`;
    return `<div class="portfolio-screen"><div class="screen-fallback"><span>Digital Concepts</span><strong>${escape(item.title)}</strong></div><video muted loop playsinline preload="none" data-src="${escape(src)}" ${m[mobile?'mobilePoster':'desktopPoster']?'poster="'+escape(m[mobile?'mobilePoster':'desktopPoster'])+'"':''} aria-label="${escape(item.title)}${mobile?' · Mobile':' · Desktop'}"></video>${mobile?'':'<button type="button" class="play-toggle" aria-pressed="false">'+escape(ui[lang][3])+'</button>'}</div>`;
  }
  function render(){
    mediaObserver?.disconnect();revealObserver?.disconnect();
    const t=DICTS[lang],u=ui[lang]; document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr'; document.title=t.meta.title; $('meta[name="description"]').content=t.meta.description;
    document.querySelectorAll('.skip,.footer nav a').forEach(el=>{if(!el.dataset.originalLabel)el.dataset.originalLabel=el.textContent;const k=el.dataset.originalLabel.trim();el.textContent=lang==='ar'?({'Skip to content':'تخطَّ إلى المحتوى','Zum Inhalt springen':'تخطَّ إلى المحتوى','Impressum':'البيانات القانونية','Datenschutz':'الخصوصية','AGB':'الشروط والأحكام'}[k]||k):el.dataset.originalLabel;});
    $('.lang-btn > span').textContent=lang.toUpperCase();$('.lang-btn').setAttribute('aria-label',t.langSwitcher.label);
    all('[data-lang]').forEach(b=>{b.classList.toggle('is-active',b.dataset.lang===lang);b.setAttribute('aria-checked',String(b.dataset.lang===lang));});
    all('.nav-links a,.menu-list a').forEach((a,i)=>{const n=i%4;a.textContent=[t.nav.home,t.nav.portfolio,t.nav.faq,t.nav.contact][n];a.href=[internal(),'#portfolio','#faq','#kontaktformular'][n];if(n===1)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    all('.brand').forEach(a=>a.href=internal());all('.nav-right > a,.menu-foot > a.btn').forEach(a=>{a.href='#kontaktformular';a.textContent=u[2]});
    $('#main').innerHTML=`<section class="portfolio-hero shell"><p class="hero-tag">Digital Concepts / ${escape(u[0])}</p><h1 class="hero-title">${escape(t.hero.titleBefore)}<em>${escape(t.hero.titleEm)}</em>${escape(t.hero.titleAfter)}</h1><div class="portfolio-intro"><p class="portfolio-index">01 — ${String(PORTFOLIO_MEDIA.length).padStart(2,'0')} / ${escape(t.nav.portfolio)}</p><div><p class="lead">${escape(t.hero.subtitle)}</p><a class="portfolio-visit" style="margin-top:25px" href="#portfolio">${escape(t.hero.scroll)} <span aria-hidden="true">↓</span></a></div></div></section>
    <section id="portfolio" class="shell portfolio-section"><div class="portfolio-section-head"><p class="sidenote">${escape(t.portfolio.label)}</p><h2>${escape(u[1])}</h2></div>${t.portfolio.items.map((item,i)=>{const m=PORTFOLIO_MEDIA[i];return `<article class="portfolio-row portfolio-reveal" id="${m.key}"><div class="portfolio-visual"><div class="portfolio-browser"><div class="browser-top"><span class="browser-dots" aria-hidden="true"><i></i><i></i><i></i></span><span>${escape(new URL(m.url).hostname)}</span><span aria-hidden="true">↗</span></div>${preview(m,item)}</div><div class="portfolio-phone" aria-hidden="true">${preview(m,item,true)}</div></div><div class="portfolio-text"><p class="sidenote">0${i+1} / ${escape(item.label)}</p><h3>${escape(item.title)}</h3><p>${escape(item.desc)}</p><ul class="portfolio-features">${item.features.map(f=>`<li>${escape(f)}</li>`).join('')}</ul><a class="portfolio-visit" href="${escape(m.url)}" target="_blank" rel="noopener noreferrer">${escape(t.portfolio.visit)} <span aria-hidden="true">↗</span></a></div></article>`}).join('')}</section>
    <section id="faq" class="shell portfolio-faq"><div class="faq-heading"><p class="sidenote">${escape(t.faq.label)}</p><h2 class="display">${escape(t.faq.title)}</h2><a class="portfolio-visit" href="#kontaktformular">${escape(u[2])} <span aria-hidden="true">↗</span></a></div><div class="faq-stack">${t.faq.items.map((x,i)=>`<article class="faq-panel portfolio-reveal"><h3><button class="faq-toggle" type="button" aria-expanded="false" aria-controls="faq-answer-${i}" id="faq-question-${i}"><span class="faq-number" aria-hidden="true">${String(i+1).padStart(2,'0')}</span><span>${escape(x.q)}</span><span class="faq-plus" aria-hidden="true"></span></button></h3><div class="faq-body" id="faq-answer-${i}" role="region" aria-labelledby="faq-question-${i}" inert><div><p>${escape(x.a)}</p></div></div></article>`).join('')}</div></section>`;
    all('.faq-toggle').forEach(button=>button.onclick=()=>{const open=button.getAttribute('aria-expanded')!=='true';all('.faq-toggle').forEach(b=>{const active=b===button&&open;b.setAttribute('aria-expanded',String(active));b.closest('.faq-panel').classList.toggle('is-open',active);document.getElementById(b.getAttribute('aria-controls')).inert=!active;});});
    all('.footer nav a').forEach(a=>{const u=new URL(a.getAttribute('href'),location.href);u.searchParams.set('lang',lang);a.href=u.href;});$('#copyright').textContent=t.footer;setupMedia();
    window.dcContactLanguage?.(lang);
    window.dispatchEvent(new Event('portfolio:render'));
    if('IntersectionObserver' in window&&!reduce.matches){document.body.classList.add('motion-ready');revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-in');revealObserver.unobserve(e.target)}}),{threshold:.08});all('.portfolio-reveal').forEach(e=>revealObserver.observe(e));}
  }
  function setupMedia(){mediaObserver=window.dcSetupPortfolioMedia(all('.portfolio-row'),{labels:ui[lang],reduce,reset:true});}
  const setMenu=open=>{document.body.classList.toggle('menu-open',open);$('.burger').setAttribute('aria-expanded',String(open));$('#mobilmenu').setAttribute('aria-hidden',String(!open));};
  $('.burger').onclick=()=>setMenu(!document.body.classList.contains('menu-open'));$('#mobilmenu').onclick=e=>{if(e.target.closest('a'))setMenu(false)};
  $('.lang-btn').onclick=e=>{e.stopPropagation();const open=$('.lang').classList.toggle('is-open');$('.lang-btn').setAttribute('aria-expanded',String(open))};
  const closeLang=()=>{$('.lang').classList.remove('is-open');$('.lang-btn').setAttribute('aria-expanded','false')};
  document.addEventListener('click',e=>{if(!e.target.closest('.lang'))closeLang()});
  all('[data-lang]').forEach(b=>b.onclick=()=>{lang=b.dataset.lang;try{localStorage.setItem('lang',lang)}catch{}render();closeLang();$('.lang-btn').focus()});
  $('.lang').addEventListener('keydown',e=>{const b=all('[data-lang]');if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();$('.lang').classList.add('is-open');$('.lang-btn').setAttribute('aria-expanded','true');let i=b.indexOf(document.activeElement);b[(i+(e.key==='ArrowDown'?1:b.length-1))%b.length].focus()}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeLang();setMenu(false)}});
  window.addEventListener('scroll',()=>$('.nav').classList.toggle('is-scrolled',scrollY>30),{passive:true});
  render();
})();

(() => {
const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
const storage={get(k){try{return localStorage.getItem(k)}catch{return null}},set(k,v){try{localStorage.setItem(k,v)}catch{}}};
  const messages = {
ar:{required:'يرجى ملء الحقول المحددة.',sending:'جارٍ إرسال الطلب…',error:'تعذّر الإرسال. راسلنا مباشرة على',nav:'تصفح الأقسام',dial:'رمز الاتصال الدولي',close:'إغلاق',menu:'فتح القائمة',language:'اختيار اللغة'},
    de:{required:'Bitte die markierten Felder ausfüllen.',sending:'Anfrage wird gesendet …',error:'Das Senden hat nicht funktioniert. Schreiben Sie uns direkt an',nav:'Abschnittsnavigation',dial:'Ländervorwahl',close:'Schliessen',menu:'Menü öffnen',language:'Sprache wählen'},
    fr:{required:'Veuillez remplir les champs indiqués.',sending:'Envoi en cours…',error:'L’envoi a échoué. Réessayez ou écrivez-nous à',nav:'Navigation des sections',dial:'Indicatif pays',close:'Fermer',menu:'Ouvrir le menu',language:'Choisir la langue'},
    en:{required:'Please complete the highlighted fields.',sending:'Sending your enquiry…',error:'Sending failed. Please retry or email us at',nav:'Section navigation',dial:'Country dial code',close:'Close',menu:'Open menu',language:'Choose language'},
    es:{required:'Completa los campos indicados.',sending:'Enviando solicitud…',error:'No se pudo enviar. Reintenta o escríbenos a',nav:'Navegación de secciones',dial:'Prefijo del país',close:'Cerrar',menu:'Abrir menú',language:'Elegir idioma'},
    it:{required:'Compila i campi indicati.',sending:'Invio in corso…',error:'Invio non riuscito. Riprova o scrivici a',nav:'Navigazione delle sezioni',dial:'Prefisso del paese',close:'Chiudi',menu:'Apri menu',language:'Scegli la lingua'}
  };

window.dcMessage=key=>messages[document.documentElement.lang]?.[key]||messages.en[key];
const records=[];const walker=document.createTreeWalker($('#kontaktformular'),NodeFilter.SHOW_TEXT);let node;
while(node=walker.nextNode()){const key=node.nodeValue.replace(/\s+/g,' ').trim();if(window.DC_TRANSLATIONS[key])records.push({node,key,original:node.nodeValue})}
window.dcContactLanguage=lang=>{document.querySelectorAll('#kontaktformular [placeholder],#kontaktformular [aria-label]').forEach(el=>{for(const attr of ['placeholder','aria-label']){const value=el.getAttribute(attr);if(!value)continue;const key='dcOriginal'+attr.replace('-','');if(!el.dataset[key])el.dataset[key]=value;const original=el.dataset[key];const entry=window.DC_TRANSLATIONS[original];if(entry)el.setAttribute(attr,lang==='de'?original:(entry[lang]||original));}});records.forEach(r=>{r.node.nodeValue=lang==='de'?r.original:r.original.replace(/\S[\s\S]*\S|\S/,window.DC_TRANSLATIONS[r.key][lang]||r.key)});$('#contact-country-code').setAttribute('aria-label',messages[lang].dial);};
  var form = $("[data-form]");
  if (form) {
    var ENDPOINT = form.getAttribute("action");
    var MAILTO = "info@digital-concepts.ch";

    var status = $(".form-status", form);
    var success = $("[data-success]");

    var showError = function (field, on) {
      var wrap = field.closest(".field") || field.closest(".consent");
      if (wrap) wrap.classList.toggle("has-error", on);
    };

    var validate = function () {
      var ok = true;
      $$("[required]", form).forEach(function (el) {
        var valid = el.type === "checkbox" ? el.checked : el.value.trim() !== "" && el.checkValidity();
        showError(el, !valid);
        if (!valid && ok) { ok = false; el.focus({ preventScroll: false }); }
      });
      return ok;
    };

    $$("[required]", form).forEach(function (el) {
      el.addEventListener("input", function () { showError(el, false); });
      el.addEventListener("change", function () { showError(el, false); });
    });

    var finish = function () {
      form.hidden = true;
      if (success) {
        success.classList.add("is-visible");
        success.setAttribute("tabindex", "-1");
        success.focus({ preventScroll: false });
      }
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) {
        if (status) status.textContent = window.dcMessage("required");
        return;
      }
      if (form.dataset.sending === "true") return;
      var data = new FormData(form);
      var dial = $("#contact-country-code", form), phone = $("#contact-phone", form);
      if (phone && phone.value.trim()) data.set("Telefonnummer vollständig", phone.value.trim().startsWith("+") ? phone.value.trim() : dial.value + " " + phone.value.trim());
      data.set("Sprache", document.documentElement.lang);

      if (!ENDPOINT) {
        var lines = [];
        data.forEach(function (v, k) { if (k !== "consent") lines.push(k + ": " + v); });
        window.location.href = "mailto:" + MAILTO +
          "?subject=" + encodeURIComponent("Projektanfrage über digital-concepts.ch") +
          "&body=" + encodeURIComponent(lines.join("\n"));
        finish();
        return;
      }

      form.dataset.sending = "true";
      var submitButton = $("button[type=submit]", form);
      submitButton.disabled = true;
      if (status) status.textContent = window.dcMessage("sending");
      var requestController = new AbortController();
      var requestTimeout = setTimeout(function () { requestController.abort(); }, 15000);
      fetch(ENDPOINT, { signal: requestController.signal, method: "POST", body: data, headers: { Accept: "application/json" } })
        .then(function (res) {
          if (!res.ok) throw new Error("Request failed");
          return res.json().then(function (result) {
            if (result.success !== true && result.success !== "true") throw new Error("Submission rejected");
            if (status) status.textContent = "";
            finish();
          });
        })
        .catch(function () {
          if (status) {
            status.textContent = window.dcMessage("error") + " " + MAILTO + ".";
          }
        }).finally(function () {
          clearTimeout(requestTimeout);
          form.dataset.sending = "false";
          submitButton.disabled = false;
        });
    });
  }

  const dial=$('#contact-country-code');let manual=false;
  dial.addEventListener('change',()=>{manual=true;storage.set('dc-dial',dial.value);});
  const savedDial=storage.get('dc-dial');if(savedDial&&[...dial.options].some(o=>o.value===savedDial)){dial.value=savedDial;manual=true;}
  const countries={CH:'+41',DE:'+49',FR:'+33',AT:'+43',IT:'+39',MA:'+212',BE:'+32',LU:'+352',NL:'+31',ES:'+34',PT:'+351',GB:'+44',IE:'+353',DK:'+45',SE:'+46',NO:'+47',FI:'+358',PL:'+48',CZ:'+420',GR:'+30',RO:'+40',TR:'+90',US:'+1',CA:'+1',AE:'+971',SA:'+966',DZ:'+213',TN:'+216',SN:'+221',CI:'+225',CN:'+86',JP:'+81',AU:'+61',BR:'+55'};
  async function detectCountry(){
    if(manual)return;
    for(const endpoint of ['https://ipapi.co/json/','https://ipwho.is/']){
      const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),3500);
      try{const response=await fetch(endpoint,{signal:controller.signal});if(!response.ok)throw Error();const data=await response.json();if(data.success===false||data.error)throw Error();const code=countries[String(data.country_code||data.country||'').toUpperCase()];if(code){if(!manual){dial.value=code;dial.querySelectorAll('option').forEach(o=>o.defaultSelected=o.value===code);}return;}}
      catch{}finally{clearTimeout(timer);}
    }
  }

window.dcContactLanguage(document.documentElement.lang);document.querySelector('[data-form]')?.addEventListener('focusin',detectCountry,{once:true});
})();
(() => {
  const reduce=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine) and (min-width:1000px)');
  let items=[],frame;const clamp=n=>Math.min(1,Math.max(0,n));
  function render(){frame=null;if(reduce.matches)return;const vh=innerHeight;items.forEach(({el,kind,index})=>{const box=el.getBoundingClientRect();if(box.bottom< -150||box.top>vh+180)return;const p=clamp((vh*.92-box.top)/(vh*.48));if(kind==='title'){el.style.setProperty('--read',`${35+p*65}%`);el.style.translate=`0 ${(1-p)*22}px`;}else if(kind==='visual'){const a=fine.matches?1:.45;el.style.transform=`perspective(1400px) translateY(${(1-p)*65*a}px) scale(${1-(1-p)*.065*a}) rotateX(${(1-p)*5*a}deg)`;}else{const q=clamp(p*1.25-(index%3)*.1);el.style.translate=`0 ${(1-q)*48}px`;el.style.opacity=String(.45+q*.55);}});}
  function queue(){if(!frame)frame=requestAnimationFrame(render)}
  function setup(){
    items.forEach(({el})=>{el.classList.remove('ff-scroll-title');['--read','translate','transform','opacity'].forEach(p=>el.style.removeProperty(p))});items=[];
    document.querySelectorAll('.portfolio-section-head h2,.faq-heading h2,#kontaktformular h2').forEach(el=>{el.classList.add('ff-scroll-title');items.push({el,kind:'title',index:0})});
    document.querySelectorAll('.portfolio-visual').forEach(el=>items.push({el,kind:'visual',index:0}));
    document.querySelectorAll('.portfolio-text,#kontaktformular .field').forEach((el,index)=>items.push({el,kind:'card',index}));
    document.querySelectorAll('.portfolio-browser,.faq-panel,.portfolio-visit').forEach(el=>{
      if(el.dataset.hoverBound)return;el.dataset.hoverBound='true';
      el.addEventListener('pointermove',e=>{if(!fine.matches||reduce.matches)return;const b=el.getBoundingClientRect();el.style.setProperty('--mx',`${e.clientX-b.left}px`);el.style.setProperty('--my',`${e.clientY-b.top}px`);},{passive:true});
      el.addEventListener('pointerleave',()=>{el.style.removeProperty('--mx');el.style.removeProperty('--my')});
    });queue();
  }
  window.addEventListener('scroll',queue,{passive:true});window.addEventListener('resize',queue);window.addEventListener('portfolio:render',setup);reduce.addEventListener('change',setup);setup();
})();
