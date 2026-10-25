(()=>{'use strict';const desktop=matchMedia('(min-width:701px) and (hover:hover) and (pointer:fine)');let root,loaded=false;
function load(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.append(s)})}
async function sync(){window.dcDesktopActive=desktop.matches;if(!desktop.matches){if(root)root.hidden=true;document.dispatchEvent(new Event('dc-background-change'));return}
if(!root){root=document.createElement('div');root.className='dc-desktop-background';root.setAttribute('aria-hidden','true');root.innerHTML='<canvas id="bg-matrix-canvas"></canvas><div id="bg-spotlight"></div><div id="bg-plexus"></div><div id="bg-scanlines"></div><div id="bg-vignette"></div>';document.body.prepend(root)}root.hidden=false;
if(!loaded){loaded=true;try{await load('three-r128.min.js')}catch{}await load('desktop-background-3d.js').catch(()=>{})}
document.dispatchEvent(new Event('dc-background-change'));
}desktop.addEventListener('change',sync);sync();})();
