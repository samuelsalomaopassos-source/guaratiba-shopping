window.Ceu=(()=>{const c=document.getElementById("ceu"),o=c&&(c.getContext("webgl",{antialias:!1,alpha:!1,premultipliedAlpha:!1})||c.getContext("experimental-webgl"));if(!o)return{set(){},ok:!1};const p="attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}",x=`
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uSun; uniform float uElev; uniform float uNight;
uniform vec2 uMoon; uniform float uMoonVis; uniform float uScroll; uniform float uHorizon; uniform float uCover; uniform float uRain;
float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 r=mat2(.8,.6,-.6,.8);for(int i=0;i<5;i++){v+=a*n(p);p=r*p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
// c\xFAmulos de praia: base mais reta, topo em couve-flor
float nuvem(vec2 p,float alt,float cob){
  float w=fbm(p*.55+vec2(0.,uTime*.004));
  float d=fbm(p+vec2(w*1.4,w*.6));
  return smoothstep(.53-cob*.30,.70-cob*.20,d);
}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes; float asp=uRes.x/uRes.y;
  vec2 q=vec2(uv.x*asp,uv.y);
  float y=clamp((uv.y-uHorizon)/(1.-uHorizon),0.,1.);
  float e=uElev;
  // paleta tropical: azul profundo no alto, turquesa claro no horizonte; p\xF4r do sol rosa e lil\xE1s
  vec3 zDay=vec3(.10,.38,.80), mDay=vec3(.30,.62,.92), hDay=vec3(.74,.90,.97);
  vec3 zGold=vec3(.24,.40,.70), mGold=vec3(.62,.62,.74), hGold=vec3(1.,.76,.46);
  vec3 zSet=vec3(.16,.14,.38), mSet=vec3(.66,.34,.52), hSet=vec3(1.,.50,.30);
  vec3 zNight=vec3(.012,.020,.065), mNight=vec3(.03,.05,.13), hNight=vec3(.09,.12,.24);
  float tDay=smoothstep(.05,.45,e), tGold=smoothstep(-.08,.14,e), tSet=smoothstep(-.34,-.04,e);
  vec3 zen=mix(zNight,zSet,tSet); zen=mix(zen,zGold,tGold); zen=mix(zen,zDay,tDay);
  vec3 mid=mix(mNight,mSet,tSet); mid=mix(mid,mGold,tGold); mid=mix(mid,mDay,tDay);
  vec3 hor=mix(hNight,hSet,tSet); hor=mix(hor,hGold,tGold); hor=mix(hor,hDay,tDay);
  vec3 col=y<.35?mix(hor,mid,smoothstep(0.,.35,y)):mix(mid,zen,smoothstep(.35,1.,y));
  // sol: halo largo, coroa e brilho do lado do sol no horizonte
  vec2 sp=vec2(uSun.x*asp,uSun.y); float d=distance(q,sp);
  float sunVis=smoothstep(-.14,.04,e);
  vec3 sunCol=mix(vec3(1.,.50,.22),vec3(1.,.94,.80),smoothstep(0.,.5,e));
  col+=sunCol*(.45*exp(-d*2.6)+.35*exp(-d*10.)+.8*exp(-d*34.))*sunVis;
  float lado=exp(-abs(uv.x-uSun.x)*1.6);
  col+=vec3(1.,.42,.25)*lado*pow(1.-y,2.)*.55*(tSet-tDay*.85)*sunVis;
  // raios de luz no fim de tarde
  vec2 rd=q-sp; float ang=atan(rd.y,rd.x);
  float raios=(n(vec2(ang*9.,uTime*.05))*.6+.4)*exp(-length(rd)*2.2)*(tGold-tDay)*sunVis*smoothstep(.0,.2,y);
  col+=sunCol*raios*.22;
  // noite: estrelas de tamanhos diferentes, faixa leitosa e brilho quente da cidade no horizonte
  float st=0.;
  for(int k=0;k<2;k++){float sc=k==0?140.:300.; vec2 g=floor(q*sc); float r=h(g+float(k)*7.);
    float lim=k==0?.989:.982;
    if(r>lim){vec2 f=fract(q*sc)-.5-vec2(h(g+1.)-.5,h(g+2.)-.5)*.5; float br=k==0?1.:.5;
      st+=br*smoothstep(k==0?.16:.10,0.,length(f))*(.55+.45*sin(uTime*(1.5+r*3.)+r*90.));}}
  float via=fbm(vec2((q.x+q.y*.7)*2.2,(q.y-q.x*.35)*7.))*exp(-pow((q.y-.25*q.x-.55)*5.,2.));
  col+=vec3(.55,.6,.85)*via*.10*uNight*smoothstep(.1,.5,y);
  col+=vec3(1.,.97,.9)*st*uNight*smoothstep(.0,.2,y);
  col+=vec3(.95,.55,.25)*pow(1.-y,6.)*.10*uNight;
  // lua com halo
  vec2 mp=vec2(uMoon.x*asp,uMoon.y); float md=distance(q,mp);
  float disc=smoothstep(.034,.03,md); float lit=smoothstep(.0,.02,distance(q,mp+vec2(.016,.008))-.028);
  float crat=md<.04?n((q-mp)*120.)*.18:0.;
  col=mix(col,vec3(.95,.94,.88)-crat,disc*lit*uMoonVis);
  col+=vec3(.55,.68,.95)*(exp(-md*7.)*.20+exp(-md*22.)*.15)*uMoonVis;
  // nuvens: c\xFAmulos iluminados pelo sol (luz medida na dire\xE7\xE3o do sol) + v\xE9us altos
  vec2 cp=vec2(q.x*1.6+uScroll*.00016+uTime*.008,(uv.y-uHorizon)*5.2);
  float cob=uCover;
  float dn=nuvem(cp,0.,cob);
  vec2 dirSol=normalize(vec2(sp.x-q.x,sp.y-q.y)+1e-4)*.09;
  float dl=nuvem(cp+vec2(dirSol.x*1.6,dirSol.y*5.2),0.,cob);
  float luz=clamp(.55+(dn-dl)*2.2,0.,1.);
  float baseSombra=smoothstep(.0,.6,fbm(cp*1.7+3.));
  float massa=dn*smoothstep(.02,.22,y)*(1.-smoothstep(.9,1.,y)*.5);
  vec3 cSol=mix(vec3(1.,.70,.50),vec3(1.,.99,.97),tDay);
  cSol=mix(vec3(.20,.24,.36),cSol,tSet);
  vec3 cSombra=mix(vec3(.50,.32,.46),vec3(.70,.77,.87),tDay);
  cSombra=mix(vec3(.04,.06,.11),cSombra,tSet);
  vec3 cc=mix(cSombra,cSol,luz*(.6+.4*baseSombra));
  cc+=sunCol*exp(-d*4.)*.5*sunVis;                                  // bordas acesas perto do sol
  cc+=vec3(.5,.6,.8)*exp(-md*6.)*.25*uMoonVis;                       // luar nas nuvens
  cc=mix(cc,cc*vec3(.6,.64,.70),uRain);
  float veu=smoothstep(.55,.80,fbm(vec2(q.x*2.2+uScroll*.0001+uTime*.004,q.y*9.)))*.35*smoothstep(.3,.8,y);
  col=mix(col,mix(col,vec3(dot(col,vec3(.3,.59,.11))),uCover*.45)*(1.-uRain*.35),1.);
  col=mix(col,mix(col,cSol*.9+col*.2,.6),veu*(1.-massa));
  col=mix(col,cc,massa*mix(.45,.96,tSet));
  // n\xE9voa de maresia junto ao telhado
  col=mix(col,hor*1.04,pow(1.-y,5.)*.35);
  col+=(h(gl_FragCoord.xy+uTime)-.5)/255.;
  gl_FragColor=vec4(col,1.);
}`;function u(e,r){const l=o.createShader(e);if(o.shaderSource(l,r),o.compileShader(l),!o.getShaderParameter(l,o.COMPILE_STATUS))throw o.getShaderInfoLog(l);return l}let i;try{i=o.createProgram(),o.attachShader(i,u(o.VERTEX_SHADER,p)),o.attachShader(i,u(o.FRAGMENT_SHADER,x)),o.linkProgram(i),o.useProgram(i)}catch(e){return console.warn("c\xE9u sem WebGL",e),{set(){},ok:!1}}const g=o.createBuffer();o.bindBuffer(o.ARRAY_BUFFER,g),o.bufferData(o.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),o.STATIC_DRAW);const m=o.getAttribLocation(i,"p");o.enableVertexAttribArray(m),o.vertexAttribPointer(m,2,o.FLOAT,!1,0,0);const t={};["uRes","uTime","uSun","uElev","uNight","uMoon","uMoonVis","uScroll","uHorizon","uCover","uRain"].forEach(e=>t[e]=o.getUniformLocation(i,e));const a={sun:[.5,.7],elev:.8,night:0,moon:[.5,.7],moonVis:0,scroll:0,horizon:.6,cover:.25,rain:0};let n=matchMedia("(max-width:700px)").matches?.32:.36,f=66;function s(){const e=Math.round(innerWidth*n),r=Math.round(innerHeight*n);(c.width!==e||c.height!==r)&&(c.width=e,c.height=r,o.viewport(0,0,e,r))}addEventListener("resize",s),s();const S=matchMedia("(prefers-reduced-motion: reduce)").matches;let v=0,y=performance.now(),d=!1;function h(e){if(requestAnimationFrame(h),d||document.hidden||e-v<f)return;v=e;const r=S?0:(e-y)/1e3;o.uniform2f(t.uRes,c.width,c.height),o.uniform1f(t.uTime,r),o.uniform2f(t.uSun,a.sun[0],a.sun[1]),o.uniform1f(t.uElev,a.elev),o.uniform1f(t.uNight,a.night),o.uniform2f(t.uMoon,a.moon[0],a.moon[1]),o.uniform1f(t.uMoonVis,a.moonVis),o.uniform1f(t.uScroll,a.scroll),o.uniform1f(t.uHorizon,a.horizon),o.uniform1f(t.uCover,a.cover),o.uniform1f(t.uRain,a.rain),o.drawArrays(o.TRIANGLES,0,3)}return requestAnimationFrame(h),document.documentElement.classList.add("ceu-gl"),{ok:!0,set(e){Object.assign(a,e)},pausa(e){d=e},leve(){n=.28,f=80,s()}}})();
