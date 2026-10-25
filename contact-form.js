(() => {
  'use strict';
  const copy = {
 ar:{sending:'جارٍ إرسال الطلب…',error:'تعذّر تأكيد الإرسال. احتفظنا ببياناتك. للتواصل:',local:'يرجى فتح النموذج من الموقع المنشور لإرسال طلبك.',activation:'لم يُفعّل استقبال النموذج بعد. يرجى التواصل معنا مباشرة:'},
    de:{sending:'Anfrage wird gesendet …',error:'Die Anfrage konnte nicht bestätigt werden. Ihre Angaben bleiben erhalten. Kontakt:',local:'Bitte öffnen Sie das Formular über die veröffentlichte Website.',activation:'Der Empfang ist noch nicht aktiviert. Bitte kontaktieren Sie uns direkt:'},
    fr:{sending:'Envoi en cours…',error:'L’envoi n’a pas pu être confirmé. Vos informations sont conservées. Contact :',local:'Ouvrez ce formulaire depuis le site publié pour envoyer votre demande.',activation:'La réception du formulaire n’est pas encore activée. Contactez-nous directement :'},
    en:{sending:'Sending your enquiry…',error:'Submission could not be confirmed. Your information has been kept. Contact:',local:'Please open this form on the published website to send your enquiry.',activation:'Form delivery has not been activated yet. Please contact us directly:'}
  };
  function accepted(result) {
    return (result.success === true || result.success === 'true') && !/activat|confirm your email|verify your email/i.test(result.message || '');
  }
  document.addEventListener('submit', async event => {
    const form=event.target;
    if (!form.matches('form[data-form]')) return;
    event.preventDefault();event.stopImmediatePropagation();
    if (form.dataset.sending === 'true') return;
    const t=copy[document.documentElement.lang]||copy.de;
    const status=form.querySelector('.form-status');
    const show=(text,email)=>{if(!status)return;status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.textContent=text;if(email){const a=document.createElement('a');a.href='mailto:'+email;a.textContent=' '+email;status.append(a);}};
    if(!form.reportValidity())return;
    if(location.protocol==='file:'){show(t.local);return;}
    const data=new FormData(form);
    if(data.get('_honey'))return;
    const email=form.querySelector('input[type=email]').value.trim();
    data.set('email',email);data.set('_replyto',email);
    data.set('name',form.querySelector('#contact-name').value.trim());
    data.set('message',form.querySelector('textarea').value.trim());
    data.set('_url',location.href);data.set('Sprache',document.documentElement.lang);
    const phone=form.querySelector('#contact-phone'),dial=form.querySelector('#contact-country-code');
    if(phone&&dial)data.set('Telefonnummer vollständig',phone.value.trim().startsWith('+')?phone.value.trim():dial.value+' '+phone.value.trim());
    const endpoint=form.getAttribute('action');const recipient=endpoint.split('/').pop();
    const button=form.querySelector('button[type=submit]');form.dataset.sending='true';button.disabled=true;form.setAttribute('aria-busy','true');show(t.sending);
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),25000);
    try{
      const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(Object.fromEntries(data)),signal:controller.signal});
      if(!response.ok)throw Error('HTTP '+response.status);
      const result=await response.json();
      if(!accepted(result)){show(/activat|confirm|verify/i.test(result.message||'')?t.activation:t.error,recipient);return;}
      const success=form.parentElement.querySelector('[data-success]')||document.querySelector('[data-success]');
      if(!success)throw Error('Missing success element');
      form.hidden=true;success.classList.add('is-visible');success.setAttribute('tabindex','-1');success.focus({preventScroll:true});show('');
    }catch(error){show(t.error,recipient);}
    finally{clearTimeout(timer);form.dataset.sending='false';form.removeAttribute('aria-busy');button.disabled=false;}
  },true);
})();
