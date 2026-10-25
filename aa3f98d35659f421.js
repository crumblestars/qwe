(() => {
  'use strict';
  const languages = ['de','fr','en','ar'];
  const $ = s => document.querySelector(s);
  const normalize = s => s.replace(/\s+/g,' ').trim();
  const storage = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k,v) { try { localStorage.setItem(k,v); } catch {} } };
  const messages = {
ar:{required:'يرجى ملء الحقول المحددة.',sending:'جارٍ إرسال الطلب…',error:'تعذّر الإرسال. راسلنا مباشرة على',nav:'تصفح الأقسام',dial:'رمز الاتصال الدولي',close:'إغلاق',menu:'فتح القائمة',language:'اختيار اللغة'},
    de:{required:'Bitte die markierten Felder ausfüllen.',sending:'Anfrage wird gesendet …',error:'Das Senden hat nicht funktioniert. Schreiben Sie uns direkt an',nav:'Abschnittsnavigation',dial:'Ländervorwahl',close:'Schliessen',menu:'Menü öffnen',language:'Sprache wählen'},
    fr:{required:'Veuillez remplir les champs indiqués.',sending:'Envoi en cours…',error:'L’envoi a échoué. Réessayez ou écrivez-nous à',nav:'Navigation des sections',dial:'Indicatif pays',close:'Fermer',menu:'Ouvrir le menu',language:'Choisir la langue'},
    en:{required:'Please complete the highlighted fields.',sending:'Sending your enquiry…',error:'Sending failed. Please retry or email us at',nav:'Section navigation',dial:'Country dial code',close:'Close',menu:'Open menu',language:'Choose language'},
    es:{required:'Completa los campos indicados.',sending:'Enviando solicitud…',error:'No se pudo enviar. Reintenta o escríbenos a',nav:'Navegación de secciones',dial:'Prefijo del país',close:'Cerrar',menu:'Abrir menú',language:'Elegir idioma'},
    it:{required:'Compila i campi indicati.',sending:'Invio in corso…',error:'Invio non riuscito. Riprova o scrivici a',nav:'Navigazione delle sezioni',dial:'Prefisso del paese',close:'Chiudi',menu:'Apri menu',language:'Scegli la lingua'}
  };
  let current='de';
  window.dcMessage = key => messages[current][key] || key;
  const records=[];
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode(n){return n.parentElement.closest('script,style,.lang') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;}});
  let node;
  while ((node=walker.nextNode())) {
    const key=normalize(node.nodeValue);
    if(window.DC_TRANSLATIONS[key]) records.push({node,original:node.nodeValue,key});
  }
  // Translate accessible labels and placeholders as well as visible text.
  const attributeRecords=[];
  document.querySelectorAll('[placeholder],[title],[aria-label],[alt]').forEach(el=>{
    for(const attr of ['placeholder','title','aria-label','alt']) {
      const original=el.getAttribute(attr), key=normalize(original||'');
      if(window.DC_TRANSLATIONS[key])attributeRecords.push({el,attr,original,key});
    }
  });
  const translate=key=>current==='de'?key:(window.DC_TRANSLATIONS[key]?.[current]||key);
  const meta=$('meta[name="description"]'), originalTitle=document.title, originalDescription=meta?.content;
  const titles={ar:'Digital Concepts — تصميم مواقع للشركات في سويسرا',fr:'Digital Concepts — Webdesign pour entreprises en Suisse',en:'Digital Concepts — Web design for businesses in Switzerland',es:'Digital Concepts — Diseño web para empresas en Suiza',it:'Digital Concepts — Web design per aziende in Svizzera'};
  function applyLanguage(lang,persist=false) {
    if(!languages.includes(lang))lang='de';
    const status=document.querySelector('.form-status');
    const statusKey=status && Object.keys(messages[current]).find(key=>['required','sending','error'].includes(key)&&status.textContent.startsWith(messages[current][key]));
    const statusSuffix=statusKey?status.textContent.slice(messages[current][statusKey].length):'';
    current=lang;document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';
    if(statusKey)status.textContent=messages[current][statusKey]+statusSuffix;
    for(const rec of attributeRecords)rec.el.setAttribute(rec.attr,lang==='de'?rec.original:translate(rec.key));
    if(persist)storage.set('lang',lang);
    for(const rec of records) rec.node.nodeValue=lang==='de'?rec.original:rec.original.replace(/\S[\s\S]*\S|\S/,(rec.key==='Unternehmen' && rec.node.parentElement.closest('label') ? ({ar:'الشركة',fr:'Entreprise',en:'Company',es:'Empresa',it:'Azienda'}[current] || rec.key) : translate(rec.key)));
    document.title=lang==='de'?originalTitle:titles[lang];
    if(meta)meta.content=lang==='de'?originalDescription:translate('Individuelles Webdesign und responsive Webentwicklung für Unternehmen in der Schweiz.');
    $('.lang-btn > span').textContent=lang.toUpperCase();
    $('.lang-btn').setAttribute('aria-label',messages[lang].language);
    $('.lang-menu').setAttribute('aria-label',messages[lang].language);
    document.querySelectorAll('[data-lang]').forEach(b=>{b.classList.toggle('is-active',b.dataset.lang===lang);b.setAttribute('aria-checked',String(b.dataset.lang===lang));});
    $('#contact-country-code').setAttribute('aria-label',messages[lang].dial);
    $('.burger').setAttribute('aria-label',messages[lang].menu);
    const compare=document.querySelector('[role=slider]'); if(compare)compare.setAttribute('aria-label',({ar:'مقارنة بين الموقع القديم والجديد',de:'Vergleich zwischen alter und neuer Website',fr:'Comparaison entre ancien et nouveau site',en:'Compare the old and new website',es:'Comparar la web antigua y la nueva',it:'Confronto tra vecchio e nuovo sito'})[lang]);
    document.querySelectorAll('.brand').forEach(el=>el.setAttribute('aria-label','Digital Concepts – '+translate('Startseite')));
    document.querySelector('.nav nav').setAttribute('aria-label',translate('Navigation'));
    document.querySelector('.menu-list').setAttribute('aria-label',translate('Navigation'));
    document.querySelectorAll('a[href*="/index.html"]').forEach(a=>{const path=a.getAttribute('href').split('?')[0];a.setAttribute('href',path+'?lang='+lang);});
    window.dispatchEvent(new Event('resize'));
    window.ScrollTrigger?.refresh();
  }
  const menu=$('.lang-menu');
  menu.addEventListener('click',e=>{const b=e.target.closest('[data-lang]');if(!b)return;applyLanguage(b.dataset.lang,true);const u=new URL(location.href);u.searchParams.set('lang',current);try{history.replaceState(null,'',u);}catch{}$('.lang').classList.remove('is-open');$('.lang-btn').setAttribute('aria-expanded','false');$('.lang-btn').focus();});
  $('.lang').addEventListener('keydown',e=>{
    const buttons=[...menu.querySelectorAll('button')];let i=buttons.indexOf(document.activeElement);
    if(e.key==='Escape'){ $('.lang').classList.remove('is-open');$('.lang-btn').setAttribute('aria-expanded','false');$('.lang-btn').focus(); }
    if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();$('.lang').classList.add('is-open');$('.lang-btn').setAttribute('aria-expanded','true');i=e.key==='Home'?0:e.key==='End'?buttons.length-1:e.key==='ArrowDown'?(i+1)%buttons.length:(i-1+buttons.length)%buttons.length;buttons[i].focus();}
  });
  // Native anchors retain deep links, keyboard navigation, and the user's language.
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  document.addEventListener('click',e=>{
    const a=e.target.closest('a[href^="#"]');if(!a)return;
    const el=document.getElementById(a.hash.slice(1));if(!el)return;
    e.preventDefault();
    const move=()=>{el.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});if(!el.hasAttribute('tabindex'))el.setAttribute('tabindex','-1');el.focus({preventScroll:true});};
    requestAnimationFrame(move);
    try{history.pushState(null,'',a.hash);}catch{}
    if(a.dataset.serviceRequest){let field=$('[name="Gewünschte Leistung"]');if(!field){field=document.createElement('input');field.type='hidden';field.name='Gewünschte Leistung';$('[data-form]').append(field);}field.value=a.querySelector('.svc-name')?.textContent||a.dataset.serviceRequest;}
  });


  // Detect country independently of language. Never overwrite a manual choice.
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
  const queryLang=new URLSearchParams(location.search).get('lang');
  const browserLang=(navigator.languages||[navigator.language]).map(l=>l.toLowerCase().split('-')[0]).find(l=>languages.includes(l));
  const initial=window.dcInitialLanguage||[queryLang,storage.get('lang'),browserLang,'de'].find(l=>languages.includes(l));
  applyLanguage(initial,languages.includes(queryLang));document.querySelector('[data-form]')?.addEventListener('focusin',detectCountry,{once:true});
})();
