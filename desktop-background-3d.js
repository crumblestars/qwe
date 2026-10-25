const DC_BG_MOBILE=matchMedia("(pointer:coarse)").matches;
const DC_BG_REDUCED=matchMedia("(prefers-reduced-motion:reduce)");
/* Shared index background: matrix, pointer light, 3D particles and cursor. */

(function () {
  const canvas = document.getElementById('bg-matrix-canvas');
  if(!canvas)return;
  const ctx = canvas.getContext('2d');if(!ctx)return;
  const spotEl = document.getElementById('bg-spotlight');
  const FONT_SIZE = 12, LINE_H = 18;

  const snippets = [
    '<div>','</div>','<p>','</p>','<span>','</span>','<h1>','</h1>','<h2>','</h2>',
    '<a href="">','</a>','<ul>','<li>','</li>','</ul>','<nav>','</nav>',
    '<header>','</header>','<footer>','</footer>','<section>','</section>',
    '<main>','</main>','<form>','</form>','<input />','<button>','</button>',
    'class="container"','id="app"','href="#"','src=""','alt=""','type="text"',
    '<!DOCTYPE html>','<html>','</html>','<head>','<body>','</body>',
    'display:flex','display:grid','position:absolute','overflow:hidden',
    'margin:0 auto','padding:16px','color:#dce4f3','width:100%','height:100vh',
    'font-size:14px','border-radius:8px','background:#03040a','z-index:10',
    'justify-content:center','align-items:center','flex-direction:column',
    '@media (max-width:768px)','::before','::after',':hover',':root',
    'var(--electric)','calc(100% - 20px)','transition:all 0.3s','opacity:0.5',
    'transform:translateX(-50%)','box-shadow:0 4px 12px','grid-template-columns',
    'rgba(210,225,255,0.5)','linear-gradient(135deg,','border:1px solid #dce4f3',
    'font-family:monospace','letter-spacing:2px','text-transform:uppercase',
  ];

  let rows = [], W, H;
  function buildLine(seed) {
    let parts = [], rng = seed;
    for (let i = 0; i < 80; i++) { rng=(rng*1664525+1013904223)&0xffffffff; parts.push(snippets[Math.abs(rng)%snippets.length],'  '); }
    return parts.join('');
  }
  function init() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    rows = [];
    for (let r = 0; r < Math.floor(H/LINE_H)+2; r++)
      rows.push({ y:r*LINE_H+LINE_H, text:buildLine(Math.floor(Math.random()*999999)), speed:.22+(r%9)*.06, offset:Math.random()*-3000, hue:[224,224,224,224,224,14,14,14,316,269][r%10], brightness:28+(r%4)*9, alpha:.42+(r%5)*.07 });
    ctx.font=`${FONT_SIZE}px Courier New,monospace`;
    rows.forEach(row=>{row.width=ctx.measureText(row.text).width;});
  }
  init();
  let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(init,120);},{passive:true});

  let matrixFrame=0,lastMatrix=0;
  function loop(now=0) {
    matrixFrame=0;if(document.hidden||!window.dcDesktopActive)return;
    if(now-lastMatrix<1000/(DC_BG_MOBILE?20:30)){matrixFrame=requestAnimationFrame(loop);return;}
    const step=lastMatrix?Math.min(3,(now-lastMatrix)/16.667):1;lastMatrix=now;
    ctx.clearRect(0,0,W,H); ctx.fillStyle='#03040a'; ctx.fillRect(0,0,W,H);
    ctx.font=`${FONT_SIZE}px 'Courier New',monospace`;
    for (const row of rows) {
      row.offset -= row.speed*step;
      const tw = row.width;
      if (-row.offset > tw) row.offset += tw;
      ctx.fillStyle = `hsla(${row.hue},75%,${row.brightness}%,${row.alpha})`;
      let x = row.offset; while(x < W){ ctx.fillText(row.text,x,row.y); x+=tw; }
    }
    if(!DC_BG_REDUCED.matches)matrixFrame=requestAnimationFrame(loop);
  }
  loop(100);
  ["visibilitychange","dc-background-change"].forEach(event=>document.addEventListener(event,()=>{if(document.hidden||!window.dcDesktopActive){cancelAnimationFrame(matrixFrame);matrixFrame=0;}else if(!matrixFrame){lastMatrix=0;matrixFrame=requestAnimationFrame(loop);}}));

  // Spotlight — disabled over #contact
  const contactEl = document.getElementById('contact');
  function updateSpot(x, y) {
    if(!spotEl)return;
    const contact = document.getElementById('contact');
    const r = contact ? contact.getBoundingClientRect() : {top:Infinity};
    if (y >= r.top - 10) {
      spotEl.style.background = 'rgba(3,4,10,0.97)';
    } else {
      spotEl.style.background = `radial-gradient(circle 300px at ${x}px ${y}px, rgba(3,4,10,0) 0%, rgba(3,4,10,0) 18%, rgba(3,4,10,.82) 60%, rgba(3,4,10,.95) 100%)`;
    }
  }
  let spotFrame=0,spotX=0,spotY=0;
  document.addEventListener('mousemove',e=>{spotX=e.clientX;spotY=e.clientY;if(!spotFrame)spotFrame=requestAnimationFrame(()=>{spotFrame=0;updateSpot(spotX,spotY);});},{passive:true});
  document.addEventListener('mouseleave', () => { if(spotEl)spotEl.style.background = 'rgba(3,4,10,0.93)'; });
})();


(function () {
  const container = document.getElementById('bg-plexus');
  if(!container||!window.THREE)return;
  let renderer;try{renderer=new THREE.WebGLRenderer({antialias:!DC_BG_MOBILE,alpha:true,powerPreference:'low-power'});}catch(e){return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio||1, DC_BG_MOBILE?1.25:1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
  container.appendChild(renderer.domElement);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, .1, 1000);
  camera.position.z = 120;

  function makeBlobSprite(colHex, radius) {
    const size=256; const cv=document.createElement('canvas'); cv.width=cv.height=size;
    const c=cv.getContext('2d');
    const grd=c.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);
    grd.addColorStop(0, colHex.replace(')' ,',0.18)').replace('rgb','rgba'));
    grd.addColorStop(1,'rgba(0,0,0,0)');
    c.fillStyle=grd; c.fillRect(0,0,size,size);
    const tex=new THREE.CanvasTexture(cv);
    const mat=new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
    const sp=new THREE.Sprite(mat); sp.scale.set(radius,radius,1); return sp;
  }
  const blob1=makeBlobSprite('rgb(71,116,255)',180);  blob1.position.set(55,-20,-30);  scene.add(blob1);
  const blob2=makeBlobSprite('rgb(255,112,71)',150); blob2.position.set(-30,25,-20);  scene.add(blob2);
  const blob3=makeBlobSprite('rgb(255,63,199)',90);  blob3.position.set(20,-40,-10);  scene.add(blob3);

  const COUNT=DC_BG_MOBILE?300:1000,CONNECT_DIST=28,REPEL_DIST=20,REPEL_FORCE=0.016,SX=155,SY=85;
  const positions=new Float32Array(COUNT*3),colors=new Float32Array(COUNT*3),sizes=new Float32Array(COUNT);
  const vel=[],base=[],phase=[],colorGroup=[];

  for(let i=0;i<COUNT;i++){
    const x=(Math.random()-.5)*SX*2,y=(Math.random()-.5)*SY*2,z=(Math.random()-.5)*35;
    positions[i*3]=x;positions[i*3+1]=y;positions[i*3+2]=z;
    base.push(new THREE.Vector3(x,y,z));
    vel.push(new THREE.Vector3((Math.random()-.5)*.08,(Math.random()-.5)*.08,(Math.random()-.5)*.04));
    phase.push(Math.random()*Math.PI*2);
    const roll=(i%100)/100;const g=roll<.47?0:roll<.73?1:roll<.86?2:roll<.95?3:4; colorGroup.push(g);
    let r,g2,b;
    const palette=[[.278,.455,1],[1,.439,.278],[1,.247,.78],[.553,.361,1],[.204,.863,1]];[r,g2,b]=palette[g];
    colors[i*3]=r;colors[i*3+1]=g2;colors[i*3+2]=b;
    sizes[i]=1.2+Math.random()*1.8;
  }

  const vShader=`attribute float size;attribute vec3 color;varying vec3 vColor;varying float vAlpha;uniform float uTime;
    void main(){vColor=color;vec3 p=position;p.y+=sin(uTime*.0008+position.x*.04)*.6;p.x+=cos(uTime*.0006+position.y*.03)*.4;
    vAlpha=(0.55+0.3*sin(uTime*.001+position.z*.1))*1.12;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
    gl_PointSize=size*(280.0/(-modelViewMatrix*vec4(p,1.0)).z);}`;
  const fShader=`varying vec3 vColor;varying float vAlpha;
    void main(){float d=distance(gl_PointCoord,vec2(.5));if(d>0.5)discard;
    float a=smoothstep(0.5,0.15,d)*vAlpha;gl_FragColor=vec4(vColor,a);}`;

  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('color',new THREE.BufferAttribute(colors,3));
  geo.setAttribute('size',new THREE.BufferAttribute(sizes,1));
  const pMat=new THREE.ShaderMaterial({vertexShader:vShader,fragmentShader:fShader,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uTime:{value:0}}});
  scene.add(new THREE.Points(geo,pMat));

  const MAX_LINES=DC_BG_MOBILE?750:2800;
  const lPos=new Float32Array(MAX_LINES*6),lCol=new Float32Array(MAX_LINES*6);
  const lGeo=new THREE.BufferGeometry();
  lGeo.setAttribute('position',new THREE.BufferAttribute(lPos,3).setUsage(THREE.DynamicDrawUsage));
  lGeo.setAttribute('color',new THREE.BufferAttribute(lCol,3).setUsage(THREE.DynamicDrawUsage));
  const lMat=new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.8,depthWrite:false,blending:THREE.AdditiveBlending});
  scene.add(new THREE.LineSegments(lGeo,lMat));

  const BURST_COUNT=80;const bPos=new Float32Array(BURST_COUNT*3);const bVel=[];
  for(let i=0;i<BURST_COUNT;i++){bPos[i*3]=(Math.random()-.5)*SX*2;bPos[i*3+1]=(Math.random()-.5)*SY*2;bPos[i*3+2]=(Math.random()-.5)*10;bVel.push(new THREE.Vector3((Math.random()-.5)*.12,(Math.random()-.5)*.12,0));}
  const burstGeo=new THREE.BufferGeometry();
  burstGeo.setAttribute('position',new THREE.BufferAttribute(bPos,3).setUsage(THREE.DynamicDrawUsage));
  const bvShader=`attribute float size;uniform float uTime;void main(){vec3 p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);gl_PointSize=2.0*(280.0/(-modelViewMatrix*vec4(p,1.0)).z);}`;
  const bfShader=`void main(){float d=distance(gl_PointCoord,vec2(.5));if(d>0.5)discard;gl_FragColor=vec4(.278,.455,1.,0.35*(1.-d*2.));}`;
  const burstMat=new THREE.ShaderMaterial({vertexShader:bvShader,fragmentShader:bfShader,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uTime:{value:0}}});
  scene.add(new THREE.Points(burstGeo,burstMat));

  const STAR_COUNT=DC_BG_MOBILE?10:22;const starData=[];
  function resetStar(s){s.x=(Math.random()-.5)*SX*2;s.y=(Math.random()-.4)*SY*2;s.z=(Math.random()-.5)*10;
    const angle=Math.PI*(1.05+Math.random()*.9);const spd=.9+Math.random()*1.8;
    s.vx=Math.cos(angle)*spd;s.vy=Math.sin(angle)*spd;s.vz=0;
    s.len=12+Math.random()*28;s.alpha=.18+Math.random()*.32;s.life=0;s.maxLife=55+Math.random()*90;
    const sr=Math.random();s.cyan=sr<.60;s.beige=!s.cyan&&sr<.93;s.delay=Math.random()*120;}
  for(let i=0;i<STAR_COUNT;i++){
    const sg=new THREE.BufferGeometry();const sp=new Float32Array(6);const sc=new Float32Array(6);
    sg.setAttribute('position',new THREE.BufferAttribute(sp,3).setUsage(THREE.DynamicDrawUsage));
    sg.setAttribute('color',new THREE.BufferAttribute(sc,3).setUsage(THREE.DynamicDrawUsage));
    const sm=new THREE.LineBasicMaterial({vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
    const sl=new THREE.LineSegments(sg,sm);scene.add(sl);
    const s={geo:sg,posArr:sp,colArr:sc,mat:sm};resetStar(s);s.delay=Math.random()*150;starData.push(s);}

  const mouse3D=new THREE.Vector3(9999,9999,0);
  const ms={x:window.innerWidth/2,y:window.innerHeight/2};
  let cx=window.innerWidth/2,cy=window.innerHeight/2,rx=window.innerWidth/2,ry=window.innerHeight/2;
  const cursorEl=document.getElementById('cursor'),cursorDot=document.getElementById('cursor-dot');

  function onPointer(px,py){
    ms.x=px;ms.y=py;cx=px;cy=py;
    const n=new THREE.Vector3((px/window.innerWidth)*2-1,-(py/window.innerHeight)*2+1,.5);
    n.unproject(camera);const d=n.sub(camera.position).normalize();
    mouse3D.copy(camera.position).addScaledVector(d,-camera.position.z/d.z);}

  window.addEventListener('mousemove',e=>onPointer(e.clientX,e.clientY));
  window.addEventListener('touchstart',e=>onPointer(e.touches[0].clientX,e.touches[0].clientY),{passive:true});
  window.addEventListener('touchmove', e=>onPointer(e.touches[0].clientX,e.touches[0].clientY),{passive:true});
  let webglResize;window.addEventListener('resize',()=>{clearTimeout(webglResize);webglResize=setTimeout(()=>{renderer.setSize(window.innerWidth,window.innerHeight);camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();},120);},{passive:true});

  const linePalette=[[.278,.455,1],[1,.439,.278],[1,.247,.78],[.553,.361,1],[.204,.863,1]];
  let lc=0,bgFrame=0,lastBackground=-Infinity;
  function animate(t){
    bgFrame=0;if(document.hidden||!window.dcDesktopActive)return;
    if(!DC_BG_REDUCED.matches)bgFrame=requestAnimationFrame(animate);
    if(t-lastBackground<1000/(DC_BG_MOBILE?30:60)-1)return;lastBackground=t;const T=t*.001;
    pMat.uniforms.uTime.value=T;burstMat.uniforms.uTime.value=T;
    for(let i=0;i<COUNT;i++){const ix=i*3;
      const ax=positions[ix],ay=positions[ix+1],az=positions[ix+2];
      vel[i].y+=Math.sin(T*.0005+phase[i])*.0025;
      const dx=ax-mouse3D.x,dy=ay-mouse3D.y,dz=az-mouse3D.z;
      const dm=Math.sqrt(dx*dx+dy*dy+dz*dz);
      if(dm>0&&dm<REPEL_DIST){const f=(REPEL_DIST-dm)/REPEL_DIST*REPEL_FORCE;vel[i].x+=dx/dm*f;vel[i].y+=dy/dm*f;}
      vel[i].x+=(base[i].x-ax)*.002;vel[i].y+=(base[i].y-ay)*.002;vel[i].z+=(base[i].z-az)*.0018;
      vel[i].multiplyScalar(.978);positions[ix]+=vel[i].x;positions[ix+1]+=vel[i].y;positions[ix+2]+=vel[i].z;}
    geo.attributes.position.needsUpdate=true;
    lc=0;
    for(let i=0;i<COUNT&&lc<MAX_LINES;i++){const ax=positions[i*3],ay=positions[i*3+1],az=positions[i*3+2];
      for(let j=i+1;j<COUNT&&lc<MAX_LINES;j++){const bx=positions[j*3],by=positions[j*3+1],bz=positions[j*3+2];
        const d2=(ax-bx)**2+(ay-by)**2+(az-bz)**2;
        if(d2<CONNECT_DIST*CONNECT_DIST){const d=Math.sqrt(d2);const ba=1-d/CONNECT_DIST;const mx2=(ax+bx)*.5-mouse3D.x,my2=(ay+by)*.5-mouse3D.y;
          const mb=Math.max(0,1-Math.sqrt(mx2*mx2+my2*my2)/30);const a=Math.min(.85,ba*.45+mb*.55);const lo=lc*6;
          lPos[lo]=ax;lPos[lo+1]=ay;lPos[lo+2]=az;lPos[lo+3]=bx;lPos[lo+4]=by;lPos[lo+5]=bz;
          const g=colorGroup[i];let lr,lg,lb;
          const lp=linePalette[g];lr=lp[0]*(.65+mb*.35);lg=lp[1]*(.65+mb*.35);lb=lp[2]*(.65+mb*.35);
          lCol[lo]=lr*a;lCol[lo+1]=lg*a;lCol[lo+2]=lb*a;lCol[lo+3]=lr*a;lCol[lo+4]=lg*a;lCol[lo+5]=lb*a;lc++;}}}
    lGeo.attributes.position.needsUpdate=true;lGeo.attributes.color.needsUpdate=true;lGeo.setDrawRange(0,lc*2);
    for(let i=0;i<BURST_COUNT;i++){bPos[i*3]+=bVel[i].x;bPos[i*3+1]+=bVel[i].y;
      if(Math.abs(bPos[i*3])>SX)bVel[i].x*=-1;if(Math.abs(bPos[i*3+1])>SY)bVel[i].y*=-1;}
    burstGeo.attributes.position.needsUpdate=true;
    for(const s of starData){if(s.delay>0){s.delay--;continue;}s.life++;if(s.life>s.maxLife){resetStar(s);continue;}
      const fade=Math.sin(s.life/s.maxLife*Math.PI);s.x+=s.vx;s.y+=s.vy;
      s.posArr[0]=s.x;s.posArr[1]=s.y;s.posArr[2]=s.z;
      s.posArr[3]=s.x-s.vx*(s.len/Math.max(Math.abs(s.vx),.01));
      s.posArr[4]=s.y-s.vy*(s.len/Math.max(Math.abs(s.vy),.01));s.posArr[5]=s.z;
      const a=s.alpha*fade;
      if(s.cyan){s.colArr[0]=.278;s.colArr[1]=.455;s.colArr[2]=1;s.colArr[3]=0;s.colArr[4]=.15;s.colArr[5]=.3;}
      else if(s.beige){s.colArr[0]=1;s.colArr[1]=.44;s.colArr[2]=.28;s.colArr[3]=.18;s.colArr[4]=.14;s.colArr[5]=.08;}
      else{s.colArr[0]=.55;s.colArr[1]=0;s.colArr[2]=.9;s.colArr[3]=.1;s.colArr[4]=0;s.colArr[5]=.2;}
      for(let k=0;k<6;k++)s.colArr[k]*=a;
      s.geo.attributes.position.needsUpdate=true;s.geo.attributes.color.needsUpdate=true;s.mat.opacity=1;
      if(s.x>SX+20||s.x<-SX-20||s.y>SY+20||s.y<-SY-20)resetStar(s);}
    blob1.material.opacity=.55+Math.sin(T*.6)*.12;
    blob2.material.opacity=.45+Math.sin(T*.4+1)*.12;
    blob3.material.opacity=.5+Math.sin(T*.5+2)*.10;
    rx+=(cx-rx)*.12;ry+=(cy-ry)*.12;
    if(cursorEl&&!DC_BG_MOBILE){cursorEl.style.left=rx+'px';cursorEl.style.top=ry+'px';}
    if(cursorDot&&!DC_BG_MOBILE){cursorDot.style.left=(cx-rx)+'px';cursorDot.style.top=(cy-ry)+'px';}
    camera.position.x+=((ms.x/window.innerWidth-.5)*5-camera.position.x)*.007;
    camera.position.y+=(-(ms.y/window.innerHeight-.5)*3-camera.position.y)*.007;
    camera.lookAt(scene.position);renderer.render(scene,camera);}
  animate(0);
  ["visibilitychange","dc-background-change"].forEach(event=>document.addEventListener(event,()=>{if(document.hidden||!window.dcDesktopActive){cancelAnimationFrame(bgFrame);bgFrame=0;}else if(!bgFrame){lastBackground=-Infinity;bgFrame=requestAnimationFrame(animate);}}));
})();
