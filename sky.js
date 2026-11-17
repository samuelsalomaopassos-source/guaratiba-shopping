/* Céu em WebGL: gradiente atmosférico pela altura do sol, halo, nuvens volumétricas (fbm),
   estrelas e lua. Fallback: cor CSS do .sky. */
window.Ceu = (() => {
  const cv = document.getElementById("ceu");
  const gl = cv && (cv.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false }) || cv.getContext("experimental-webgl"));
  if (!gl) return { set() {}, ok: false };

  const vs = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
  const fs = `
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
  // cores do zênite e do horizonte por fase do dia
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
  // avermelhado do horizonte na direção do sol
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
  // grão fino para não ter banding
  col+=(h(gl_FragCoord.xy+uTime)-.5)/255.;
  gl_FragColor=vec4(col,1.);
}`;
  function sh(t, s) { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(o); return o; }
  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog); gl.useProgram(prog);
  } catch (e) { console.warn("céu sem WebGL", e); return { set() {}, ok: false }; }
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {}; ["uRes", "uTime", "uSun", "uElev", "uNight", "uMoon", "uMoonVis", "uScroll", "uHorizon", "uCover", "uRain"].forEach(k => U[k] = gl.getUniformLocation(prog, k));
  const st = { sun: [.5, .7], elev: .8, night: 0, moon: [.5, .7], moonVis: 0, scroll: 0, horizon: .6, cover: .25, rain: 0 };
  let escala = matchMedia("(max-width:700px)").matches ? .3 : .32, intervalo = 66;
  function tam() {
    const w = Math.round(innerWidth * escala), h = Math.round(innerHeight * escala);
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
  }
  addEventListener("resize", tam); tam();
  const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let last = 0, t0 = performance.now(), parado = false;
  function frame(now) {
    requestAnimationFrame(frame);
    if (parado || document.hidden) return;
    if (now - last < intervalo) return; last = now; // ~15 fps: as nuvens andam devagar
    const t = reduz ? 0 : (now - t0) / 1000;
    gl.uniform2f(U.uRes, cv.width, cv.height); gl.uniform1f(U.uTime, t);
    gl.uniform2f(U.uSun, st.sun[0], st.sun[1]); gl.uniform1f(U.uElev, st.elev); gl.uniform1f(U.uNight, st.night);
    gl.uniform2f(U.uMoon, st.moon[0], st.moon[1]); gl.uniform1f(U.uMoonVis, st.moonVis);
    gl.uniform1f(U.uScroll, st.scroll); gl.uniform1f(U.uHorizon, st.horizon);
    gl.uniform1f(U.uCover, st.cover); gl.uniform1f(U.uRain, st.rain);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  requestAnimationFrame(frame);
  document.documentElement.classList.add("ceu-gl");
  return { ok: true, set(o) { Object.assign(st, o); }, pausa(v) { parado = v; },
    leve() { escala = .22; intervalo = 110; tam(); } };
})();
