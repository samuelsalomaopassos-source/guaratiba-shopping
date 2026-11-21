window.Ceu=(()=>{const i=document.getElementById("ceu"),e=i&&(i.getContext("webgl",{antialias:!1,alpha:!1,premultipliedAlpha:!1})||i.getContext("experimental-webgl"));if(!e)return{set(){},ok:!1};const p="attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}",x=`
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uSun; uniform float uElev; uniform float uNight;
uniform vec2 uMoon; uniform float uMoonVis; uniform float uScroll; uniform float uHorizon; uniform float uCover; uniform float uRain;
float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 r=mat2(.8,.6,-.6,.8);for(int i=0;i<4;i++){v+=a*n(p);p=r*p*2.02+vec2(1.7,9.2);a*=.5;}return v;}
vec3 mix3(vec3 a,vec3 b,vec3 c,float t){return t<.5?mix(a,b,t*2.):mix(b,c,t*2.-1.);}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes; float asp=uRes.x/uRes.y;
  vec2 q=vec2(uv.x*asp,uv.y);
  // altura relativa ao horizonte (linha do telhado)
  float y=clamp((uv.y-uHorizon)/(1.-uHorizon),0.,1.);
  float e=uElev; // -1 noite funda .. 1 meio-dia
  // cores do z\xEAnite e do horizonte por fase do dia
  vec3 zDay=vec3(.16,.42,.78), hDay=vec3(.62,.80,.93);
  vec3 zGold=vec3(.28,.42,.66), hGold=vec3(.98,.70,.42);
  vec3 zSet=vec3(.13,.16,.36), hSet=vec3(.95,.42,.26);
  vec3 zNight=vec3(.01,.02,.06), hNight=vec3(.05,.08,.17);
  float tDay=smoothstep(.05,.45,e), tGold=smoothstep(-.08,.12,e), tSet=smoothstep(-.32,-.04,e);
  vec3 zen=mix(zNight,zSet,tSet); zen=mix(zen,zGold,tGold); zen=mix(zen,zDay,tDay);
  vec3 hor=mix(hNight,hSet,tSet); hor=mix(hor,hGold,tGold); hor=mix(hor,hDay,tDay);
  vec3 col=mix(hor,zen,pow(y,.55));
  // halo do sol (Mie) e brilho largo
  vec2 sp=vec2(uSun.x*asp,uSun.y); float d=distance(q,sp);
  float sunVis=smoothstep(-.12,.05,e);
  vec3 sunCol=mix(vec3(1.,.55,.25),vec3(1.,.93,.78),smoothstep(0.,.5,e));
  col+=sunCol*(.55*exp(-d*3.2)+.35*exp(-d*12.)+.9*exp(-d*38.))*sunVis;
  // avermelhado do horizonte na dire\xE7\xE3o do sol
  col+=vec3(1.,.45,.2)*exp(-abs(uv.x-uSun.x)*2.2)*(1.-y)*.35*(tSet-tDay*.8)*sunVis;
  // estrelas
  float st=0.; vec2 g=floor(q*180.); float r=h(g);
  if(r>.995){vec2 f=fract(q*180.)-.5; st=smoothstep(.12,0.,length(f))*(.5+.5*sin(uTime*2.+r*90.));}
  col+=vec3(1.,.97,.9)*st*uNight*smoothstep(.0,.25,y);
  // lua
  vec2 mp=vec2(uMoon.x*asp,uMoon.y); float md=distance(q,mp);
  float disc=smoothstep(.034,.03,md); float lit=smoothstep(.0,.02,distance(q,mp+vec2(.016,.008))-.028);
  float crat=md<.04?n((q-mp)*120.)*.18:0.;
  col=mix(col,vec3(.93,.92,.86)-crat,disc*lit*uMoonVis);
  col+=vec3(.6,.7,.9)*exp(-md*9.)*.18*uMoonVis;
  // nuvens: duas camadas com deriva e paralaxe
  vec2 cp=vec2(q.x+uScroll*.00012+uTime*.006,q.y*2.4);
  float wq=fbm(cp*1.3+uTime*.01);
  float c1=fbm(cp*2.1+vec2(wq,wq*.7)*1.6);
  float cover=smoothstep(.52-uCover*.32,.80-uCover*.22,c1)*smoothstep(.0,.25,y)*(1.-smoothstep(.85,1.,y)*.4);
  float c2=n(vec2(q.x*3.+uScroll*.0001+uTime*.006,q.y*10.)+3.)*.5+n(vec2(q.x*7.,q.y*22.)+9.)*.3;
  float wisp=smoothstep(.55,.78,c2)*.45*smoothstep(.1,.5,y);
  // luz nas nuvens: lado do sol mais claro, base mais escura
  float lightness=clamp(.35+(c1-.5)*2.4+(1.-smoothstep(0.,1.2,d))*.35,0.,1.2);
  vec3 cDay=mix(vec3(.72,.76,.82),vec3(1.),lightness);
  vec3 cSet=mix(vec3(.45,.30,.38),vec3(1.,.66,.45),lightness);
  vec3 cNight=mix(vec3(.05,.07,.12),vec3(.16,.19,.27),lightness);
  vec3 cc=mix(cNight,cSet,tSet); cc=mix(cc,cDay,tDay);
  cc+=sunCol*exp(-d*5.)*.45*sunVis;
  cc=mix(cc,cc*vec3(.62,.66,.72),uRain);
  col=mix(col,mix(col,vec3(dot(col,vec3(.3,.59,.11))),uCover*.5)*(1.-uRain*.35),1.);
  col=mix(col,cc,cover*.92);
  col=mix(col,cc,wisp*(1.-cover));
  // gr\xE3o fino para n\xE3o ter banding
  col+=(h(gl_FragCoord.xy+uTime)-.5)/255.;
  gl_FragColor=vec4(col,1.);
}`;function l(o,r){const n=e.createShader(o);if(e.shaderSource(n,r),e.compileShader(n),!e.getShaderParameter(n,e.COMPILE_STATUS))throw e.getShaderInfoLog(n);return n}let a;try{a=e.createProgram(),e.attachShader(a,l(e.VERTEX_SHADER,p)),e.attachShader(a,l(e.FRAGMENT_SHADER,x)),e.linkProgram(a),e.useProgram(a)}catch(o){return console.warn("c\xE9u sem WebGL",o),{set(){},ok:!1}}const g=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,g),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);const m=e.getAttribLocation(a,"p");e.enableVertexAttribArray(m),e.vertexAttribPointer(m,2,e.FLOAT,!1,0,0);const t={};["uRes","uTime","uSun","uElev","uNight","uMoon","uMoonVis","uScroll","uHorizon","uCover","uRain"].forEach(o=>t[o]=e.getUniformLocation(a,o));const c={sun:[.5,.7],elev:.8,night:0,moon:[.5,.7],moonVis:0,scroll:0,horizon:.6,cover:.25,rain:0};let u=matchMedia("(max-width:700px)").matches?.3:.32,f=66;function s(){const o=Math.round(innerWidth*u),r=Math.round(innerHeight*u);(i.width!==o||i.height!==r)&&(i.width=o,i.height=r,e.viewport(0,0,o,r))}addEventListener("resize",s),s();const y=matchMedia("(prefers-reduced-motion: reduce)").matches;let v=0,S=performance.now(),h=!1;function d(o){if(requestAnimationFrame(d),h||document.hidden||o-v<f)return;v=o;const r=y?0:(o-S)/1e3;e.uniform2f(t.uRes,i.width,i.height),e.uniform1f(t.uTime,r),e.uniform2f(t.uSun,c.sun[0],c.sun[1]),e.uniform1f(t.uElev,c.elev),e.uniform1f(t.uNight,c.night),e.uniform2f(t.uMoon,c.moon[0],c.moon[1]),e.uniform1f(t.uMoonVis,c.moonVis),e.uniform1f(t.uScroll,c.scroll),e.uniform1f(t.uHorizon,c.horizon),e.uniform1f(t.uCover,c.cover),e.uniform1f(t.uRain,c.rain),e.drawArrays(e.TRIANGLES,0,3)}return requestAnimationFrame(d),document.documentElement.classList.add("ceu-gl"),{ok:!0,set(o){Object.assign(c,o)},pausa(o){h=o},leve(){u=.22,f=110,s()}}})();
