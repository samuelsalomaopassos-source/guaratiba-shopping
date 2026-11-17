(() => {
"use strict";
const S = window.SHOPPING, LOJAS = window.LOJAS, GRUPOS = window.GRUPOS;
const $ = (s, el = document) => el.querySelector(s);
const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* cor do fundo de cada logo (amostrada das placas originais) */
const PLACA = { acaraje:"#9B0004", armazem:"#FFD703", beachpet:"#E9C99F", caldos:"#F3E7D3", crocanteiros:"#F2E4CB",
  divergente:"#FFFFFF", estruturar:"#FFFFFF", farmacia:"#FFFFFF", gbeach:"#FFFFFF", grupo:"#225A99", ipmoda:"#FEFEFE",
  klar:"#07259B", lampiao:"#000000", levalava:"#F5EFDD", lilu:"#FFFFFF", nutri:"#024600", pane:"#E00224", paradiso:"#FEAC24",
  pastelao:"#000000", peixaria:"#B4DAFF", saborgelado:"#EEF0F4", sander:"#F7DFC5", sorriso:"#FFFFFF", taverna:"#361400",
  tony:"#F5EFDD", wahid:"#000000" };
const REDONDA = new Set(["caldos"]);

/* ---------- desenhos ---------- */
function sol(g = "#FBF5E8", centro = true) {
  const cores = ["#F2C230", "#E8862A", "#2F7FB5", "#3FA7A0"]; // cima, direita, baixo, esquerda
  let raios = "";
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2 - Math.PI / 2;
    const q = Math.floor((((i / 28) * 360 + 45) % 360) / 90);
    const w = 0.055;
    const p = (r, d) => `${(Math.cos(a + d) * r).toFixed(2)},${(Math.sin(a + d) * r).toFixed(2)}`;
    raios += `<path d="M${p(26, -w)} L${p(47, -w * 0.7)} L${p(47, w * 0.7)} L${p(26, w)}Z" fill="${cores[q]}"/>`;
  }
  const fundo = centro === "sol" ? "#FFD45A" : g === "#FBF5E8" ? "#1E3A2F" : "transparent";
  const traco = centro === "sol" ? "#E8862A" : g;
  const G = `<circle r="21" fill="${fundo}"/>
    <path d="M12.5 -8.5 A14.5 14.5 0 1 0 14.5 2 L2 2" fill="none" stroke="${traco}" stroke-width="5.2" stroke-linecap="round" stroke-linejoin="round"/>`;
  return `<svg viewBox="-50 -50 100 100" aria-hidden="true">${raios}${G}</svg>`;
}
function rnd(seed) { let x = seed * 9301 + 49297; return () => (x = (x * 9301 + 49297) % 233280) / 233280; }
/* coqueiro procedural: tronco com anéis, folhas com folíolos caídos; copa balança */
function coqueiro(o = {}) {
  const r = rnd(o.seed || 1), cor = o.cor || "#17271f", cor2 = o.cor2 || cor, lean = (r() - .5) * 40;
  const cx = 100 + lean, cy = 92;
  let tronco = `<path d="M${96} 300 C ${98 + lean * .2} 220, ${cx - 6} 150, ${cx - 3} ${cy} L ${cx + 3} ${cy} C ${cx + 4} 150, ${104 + lean * .2} 220, ${106} 300 Z" fill="${o.tronco || cor}"/>`;
  let aneis = "";
  for (let y = 290; y > cy + 6; y -= 7) { const t = (300 - y) / (300 - cy); const x = 101 + (cx - 101) * Math.pow(t, 1.6); aneis += `M${x - 4} ${y} q4 2 8 0 `; }
  tronco += `<path d="${aneis}" stroke="rgba(0,0,0,.28)" stroke-width="1.1" fill="none"/>`;
  let folhas = "";
  const n = 11;
  for (let i = 0; i < n; i++) {
    const ang = -Math.PI + (i / (n - 1)) * Math.PI + (r() - .5) * .25;
    const len = 62 + r() * 34, droop = 26 + r() * 30;
    const ex = cx + Math.cos(ang) * len * 1.15, ey = cy + Math.sin(ang) * len * .55 + droop;
    const c1x = cx + Math.cos(ang) * len * .45, c1y = cy + Math.sin(ang) * len * .7 - 12;
    let d = `M${cx} ${cy} Q ${c1x} ${c1y} ${ex} ${ey}`, fol = "";
    for (let k = 3; k <= 26; k++) {
      const t = k / 27, u = 1 - t;
      const px = u * u * cx + 2 * u * t * c1x + t * t * ex, py = u * u * cy + 2 * u * t * c1y + t * t * ey;
      const tx = 2 * u * (c1x - cx) + 2 * t * (ex - c1x), ty = 2 * u * (c1y - cy) + 2 * t * (ey - c1y);
      const L = Math.hypot(tx, ty), nx = -ty / L, ny = tx / L;
      const fl = (1 - t * .75) * (14 + r() * 4);
      fol += `M${px.toFixed(1)} ${py.toFixed(1)} l${(nx * fl + tx / L * 3).toFixed(1)} ${(Math.abs(ny * fl) + 6).toFixed(1)} M${px.toFixed(1)} ${py.toFixed(1)} l${(-nx * fl + tx / L * 3).toFixed(1)} ${(Math.abs(ny * fl) + 6).toFixed(1)} `;
    }
    const c = i % 3 === 0 ? cor2 : cor;
    folhas += `<path d="${d}" stroke="${c}" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="${fol}" stroke="${c}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  }
  const cocos = `<g fill="${o.coco || cor}"><circle cx="${cx - 5}" cy="${cy + 6}" r="5"/><circle cx="${cx + 5}" cy="${cy + 7}" r="5"/><circle cx="${cx}" cy="${cy + 11}" r="4.6"/></g>`;
  return `<svg viewBox="0 0 200 300" preserveAspectRatio="xMidYMax meet" aria-hidden="true" style="transform:scaleX(${o.inv ? -1 : 1})">${tronco}<g class="copa" style="--d:${(5 + r() * 4).toFixed(1)}s">${folhas}${cocos}</g></svg>`;
}

/* ---------- horários ---------- */
function regras(l) {
  return l.h.map(r => {
    const [d, t] = r.split(" ");
    const dias = new Set();
    d.split(",").forEach(p => { const [a, b] = p.split("-").map(Number); for (let i = a; i <= (b ?? a); i++) dias.add(i); });
    const [ab, fe] = t.split("-").map(Number);
    return { dias, ab, fe };
  });
}
LOJAS.forEach(l => l._r = regras(l));
const aberta = (l, dia, h) => l._r.some(r => r.dias.has(dia) && h >= r.ab && h < r.fe);
const fmtH = h => { const H = Math.floor(h) % 24, M = Math.round((h % 1) * 60); return M ? `${H}h${String(M).padStart(2, "0")}` : `${H}h`; };
const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
function status(l, dia, h) {
  if (aberta(l, dia, h)) {
    const r = l._r.find(r => r.dias.has(dia) && h >= r.ab && h < r.fe);
    return { on: true, txt: r.fe >= 24 ? "Aberta · até meia-noite" : `Aberta · fecha às ${fmtH(r.fe)}` };
  }
  for (let k = 0; k < 8; k++) {
    const d = (dia + k) % 7;
    const hoje = l._r.filter(r => r.dias.has(d) && (k > 0 || r.ab > h)).sort((a, b) => a.ab - b.ab)[0];
    if (hoje) {
      const quando = k === 0 ? `abre às ${fmtH(hoje.ab)}` : k === 1 ? `abre amanhã às ${fmtH(hoje.ab)}` : `abre ${DIAS[d]} às ${fmtH(hoje.ab)}`;
      return { on: false, txt: `Fechada · ${quando}` };
    }
  }
  return { on: false, txt: "Fechada" };
}
function tabelaHorario(l, dia) {
  const ordem = [1, 2, 3, 4, 5, 6, 0];
  return ordem.map(d => {
    const rs = l._r.filter(r => r.dias.has(d));
    const t = rs.length ? rs.map(r => `${fmtH(r.ab)} – ${r.fe >= 24 ? "0h" : fmtH(r.fe)}`).join(", ") : "Fechada";
    return `<div class="${d === dia ? "hoje" : ""}"><span>${DIAS[d][0].toUpperCase() + DIAS[d].slice(1)}</span><span>${t}</span></div>`;
  }).join("");
}

/* ---------- monta a varanda ---------- */
const baysEl = $("#bays");
let html = "";
GRUPOS.forEach(g => {
  html += `<section class="bay bay-grupo" id="g-${g.id}" aria-labelledby="h-${g.id}">
    <div class="pilar"><span class="mao e"></span><span class="mao d"></span><i></i></div>
    <div class="grupo-tabua"><h2 id="h-${g.id}">${g.titulo}</h2><p>${g.linha}</p></div>
    <div class="vaso"><div class="palm">${coqueiro({ cor: "#2f5a35", cor2: "#3d6e3f", tronco: "#6b5640", coco: "#5a6b2e", seed: g.titulo.length })}</div></div>
    <p class="grupo-chao">${LOJAS.filter(l => l.grupo === g.id).length} lojas nesta parte</p>
  </section>`;
  LOJAS.filter(l => l.grupo === g.id).forEach(l => {
    html += `<a class="bay loja-baia" id="b-${l.slug}" href="#/${l.slug}" data-slug="${l.slug}"
      style="--placa:${PLACA[l.logo]};--interior:${l.cor};--tinta-loja:${l.tinta}">
      <div class="parede"></div><div class="rodape"></div>
      <div class="pilar"><span class="mao e"></span><span class="mao d"></span><i></i></div>
      <span class="luminaria"></span><span class="cone"></span>
      <div class="placa ${REDONDA.has(l.logo) ? "redonda" : ""}"><div class="placa-in"><img src="assets/logos/${l.logo}.webp" alt="" loading="lazy" decoding="async"></div></div>
      <div class="vitrine"><div class="interior"><span class="balcao"></span><span class="nome-vitrine">${l.cat}</span></div><span class="vidro"></span><span class="enrolar"></span></div>
      <span class="aviso">Aberto</span>
      ${l.num ? `<span class="numero" aria-hidden="true">${l.num}</span>` : ""}
      <span class="derrame"></span>
      <span class="legenda"><strong>${l.nome}</strong><span class="st">…</span></span>
    </a>`;
  });
});
baysEl.innerHTML = html;
$("#brandSun").innerHTML = sol();
$("#totemSun").innerHTML = sol("#F4F1EA");
$("#sun").innerHTML = sol("#FFF4D6", "sol");
$(".palm-front").innerHTML = `<div class="palm" style="inset:0">${coqueiro({ cor: "#2a5232", cor2: "#3b6a3c", tronco: "#6e5a44", coco: "#56662b", seed: 7 })}</div>`;
$("#lnkMaps").href = S.maps;
$("#lnkWa").href = `https://wa.me/${S.whatsapp}`;
$("#lnkIg").href = `https://instagram.com/${S.instagram}`;
$("#nLojas").textContent = LOJAS.length;


/* coqueiros distantes (silhueta contra o céu) e pássaros */
(() => {
  let p = "";
  for (let i = 0; i < 20; i++) {
    const x = i * 20 + ((i * 37) % 9), h = 70 + ((i * 53) % 30), far = i % 3 === 0;
    p += `<div class="palm" style="left:${x}vw;height:${far ? h * .8 : h}%;width:${(h * .14).toFixed(1)}svh;opacity:${far ? .78 : 1}">${coqueiro({ cor: far ? "#22312b" : "#121c17", seed: i + 3, inv: i % 2 })}</div>`;
  }
  $("#palms").innerHTML = p;
  let b = "";
  for (let i = 0; i < 5; i++) b += `<i style="top:${10 + i * 7 + (i % 2) * 4}%;--t:${24 + i * 3}s;--a:${-i * 2.6}s;transform:scale(${.7 + (i % 3) * .2})"></i>`;
  $("#passaros").innerHTML = b;
})();

/* ---------- tempo: céu, sol, lojas ---------- */
const CEU = [[0,"#121A30"],[4.5,"#1A2340"],[5.5,"#4A4466"],[6.2,"#E7A07A"],[7.2,"#9ED0E4"],[12,"#7CC3E2"],[16,"#86C5DE"],[17.2,"#EDB56E"],[18.1,"#D2705A"],[18.9,"#5A4A72"],[19.8,"#26294A"],[24,"#121A30"]];
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
function corCeu(h) {
  for (let i = 0; i < CEU.length - 1; i++) {
    const [a, ca] = CEU[i], [b, cb] = CEU[i + 1];
    if (h >= a && h <= b) { const t = (h - a) / (b - a); const A = hex(ca), B = hex(cb); return `rgb(${A.map((v, k) => Math.round(v + (B[k] - v) * t)).join(",")})`; }
  }
  return CEU[0][1];
}
const noite = h => h < 5 ? 1 : h < 7 ? 1 - (h - 5) / 2 : h < 17 ? 0 : h < 19.5 ? (h - 17) / 2.5 : 1;

const agora = new Date();
const diaHoje = agora.getDay();
const horaReal = () => { const d = new Date(); return d.getHours() + d.getMinutes() / 60; };
let hora = horaReal(), manual = false;
const hQ = parseFloat(new URLSearchParams(location.search).get("h")); if (hQ >= 6 && hQ <= 24) { hora = hQ; manual = true; }
const input = $("#hora");

function posAstro(h, ini, fim) {
  const t = (h - ini) / (fim - ini);
  const W = innerWidth, roof = parseFloat(getComputedStyle($(".roof")).top);
  const topo = Math.max(150, roof * 0.42), base = roof - 26;
  return { x: W * (0.08 + 0.84 * t), y: base - Math.sin(Math.PI * t) * (base - topo), vis: t >= 0 && t <= 1 };
}

const GRADE = [[0,"#3e4c7e"],[5,"#46548a"],[5.8,"#8f7fa6"],[6.4,"#f2c3a6"],[7.4,"#ffffff"],[16.2,"#ffffff"],[17.2,"#ffe6c8"],[18,"#f7b98e"],[18.7,"#b79ab6"],[19.5,"#59649a"],[20.5,"#3e4c7e"],[24,"#3e4c7e"]];
function interp(tab, h) {
  for (let i = 0; i < tab.length - 1; i++) { const [a, ca] = tab[i], [b, cb] = tab[i + 1];
    if (h >= a && h <= b) { const t = (h - a) / (b - a), A = hex(ca), B = hex(cb); return `rgb(${A.map((v, k) => Math.round(v + (B[k] - v) * t)).join(",")})`; } }
  return tab[0][1];
}
function elevacao(h) {
  if (h >= 6 && h <= 18.5) return Math.sin(Math.PI * (h - 6) / 12.5);
  const gap = h < 6 ? 6 - h : h - 18.5;
  return -Math.min(1, gap / 1.6);
}
function aplicarHora() {
  const n = noite(hora), dia = 1 - n;
  const root = document.documentElement.style;
  root.setProperty("--ceu", corCeu(hora));
  root.setProperty("--noite", n.toFixed(3));
  root.setProperty("--dia", dia.toFixed(3));
  root.setProperty("--dim", (1 - n * 0.58).toFixed(3));
  root.setProperty("--grade", interp(GRADE, hora));
  document.body.classList.toggle("escuro", n > 0.55);

  const W = innerWidth, H = innerHeight;
  const s = posAstro(hora, 6, 18.5), sunEl = $("#sun");
  sunEl.style.left = s.x + "px"; sunEl.style.top = s.y + "px";
  sunEl.style.opacity = s.vis ? 1 : 0; sunEl.style.pointerEvents = s.vis ? "auto" : "none";
  root.setProperty("--sx", Math.max(-1, Math.min(1, (s.x / W - .5) * 2)).toFixed(3));
  root.setProperty("--so", (0.38 * dia * (s.vis ? 1 : 0)).toFixed(3));
  const hm = hora < 12 ? hora + 24 : hora;
  const m = posAstro(hm, 18.5, 30);
  const roof = parseFloat(getComputedStyle($(".roof")).top);
  // sol abaixo do horizonte continua "existindo" para o brilho do poente
  const tSol = (hora - 6) / 12.5, solX = W * (0.08 + 0.84 * Math.min(1.08, Math.max(-.08, tSol)));
  Ceu.set({ sun: [solX / W, 1 - (s.vis ? s.y : roof + 30) / H], elev: elevacao(hora), night: n,
    moon: [m.x / W, 1 - m.y / H], moonVis: m.vis ? n : 0, horizon: 1 - roof / H });

  let abertas = 0;
  LOJAS.forEach(l => {
    const st = status(l, diaHoje, hora);
    l._st = st; if (st.on) abertas++;
    const b = document.getElementById("b-" + l.slug);
    b.classList.toggle("fechada", !st.on);
    $(".aviso", b).textContent = st.on ? "Aberto" : "Fechado";
    $(".st", b).textContent = st.txt;
    b.setAttribute("aria-label", `${l.nome}${l.num ? ", loja " + l.num : ""}. ${l.cat}. ${st.txt}. Abrir a loja`);
  });
  const ht = fmtH(hora === 24 ? 23.99 : hora);
  $("#horaTxt").textContent = hora >= 24 ? "0h" : ht;
  $("#horaQuando").textContent = manual ? `de ${DIAS[diaHoje]}` : "agora";
  $("#btnAgora").hidden = !manual;
  $("#abertasN").textContent = abertas;
  $("#abertasTxt").textContent = manual ? `de ${LOJAS.length} lojas abertas às ${hora >= 24 ? "0h" : ht}` : `de ${LOJAS.length} lojas abertas agora`;
  input.value = Math.min(24, Math.max(6, hora));
  input.setAttribute("aria-valuetext", `${hora >= 24 ? "meia-noite" : ht}, ${abertas} lojas abertas`);
  if (somLigado) Som.atualiza();
  if (dirAberto) listarDiretorio($("#busca").value);
}
input.addEventListener("input", () => { hora = parseFloat(input.value); manual = true; aplicarHora(); });
$("#btnAgora").addEventListener("click", () => { manual = false; hora = horaReal(); aplicarHora(); });
setInterval(() => { if (!manual) { hora = horaReal(); aplicarHora(); } }, 60000);

/* arrastar o próprio sol (mouse): o sol fica atrás da varanda, então o toque é detectado pela posição */
(() => {
  const el = $("#sun"), walkEl = $("#walk"); let drag = false;
  const noSol = e => { const r = el.getBoundingClientRect(); return el.style.opacity !== "0" && Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) < r.width * .55; };
  walkEl.addEventListener("pointermove", e => {
    if (drag) {
      const t = Math.min(1, Math.max(0, (e.clientX / innerWidth - 0.08) / 0.84));
      hora = Math.round((6 + t * 12.5) * 4) / 4; manual = true; aplicarHora(); return;
    }
    if (e.pointerType === "mouse") walkEl.style.cursor = noSol(e) && !e.target.closest("a,button") ? "grab" : "";
  });
  walkEl.addEventListener("pointerdown", e => {
    if (e.pointerType !== "mouse" || e.target.closest("a,button") || !noSol(e)) return;
    drag = true; walkEl.setPointerCapture(e.pointerId); walkEl.style.cursor = "grabbing"; e.preventDefault();
  });
  const fim = () => { drag = false; walkEl.style.cursor = ""; };
  walkEl.addEventListener("pointerup", fim); walkEl.addEventListener("pointercancel", fim);
})();

/* ---------- caminhar ---------- */
const walk = $("#walk");
/* roda do mouse vira caminhada lateral, com inércia suave */
let alvo = null, rafW = 0;
walk.addEventListener("wheel", e => {
  if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
  e.preventDefault();
  if (reduz) { walk.scrollLeft += e.deltaY; return; }
  const max = walk.scrollWidth - walk.clientWidth;
  alvo = Math.max(0, Math.min(max, (alvo ?? walk.scrollLeft) + e.deltaY * 1.1));
  if (!rafW) rafW = requestAnimationFrame(function passo() {
    const d = alvo - walk.scrollLeft;
    if (Math.abs(d) < .5) { walk.scrollLeft = alvo; alvo = null; rafW = 0; return; }
    walk.scrollLeft += d * .14; rafW = requestAnimationFrame(passo);
  });
}, { passive: false });
let rafP = 0;
function aoRolar() {
  rafP = 0;
  const x = walk.scrollLeft;
  document.documentElement.style.setProperty("--scroll", x.toFixed(1));
  if (!reduz) $("#palms").style.transform = `translate3d(${(-x * 0.22).toFixed(1)}px,0,0)`;
  Ceu.set({ scroll: x });
}
walk.addEventListener("scroll", () => { if (!rafP) rafP = requestAnimationFrame(aoRolar); }, { passive: true });
const passo = () => Math.min(innerWidth * 0.8, 680);
$("#arrNext").addEventListener("click", () => walk.scrollBy({ left: passo(), behavior: reduz ? "auto" : "smooth" }));
$("#arrPrev").addEventListener("click", () => walk.scrollBy({ left: -passo(), behavior: reduz ? "auto" : "smooth" }));
$("#btnCaminhar").addEventListener("click", () => irPara($("#g-manha")));
$("#btnVoltarInicio").addEventListener("click", () => irPara($("#inicio")));
document.addEventListener("keydown", e => {
  if (!$("#loja").hidden || dirAberto) return;
  if (e.target.matches("input")) return;
  if (e.key === "ArrowRight") { walk.scrollBy({ left: passo(), behavior: "smooth" }); e.preventDefault(); }
  if (e.key === "ArrowLeft") { walk.scrollBy({ left: -passo(), behavior: "smooth" }); e.preventDefault(); }
});
function irPara(el, suave = !reduz) {
  const left = el.offsetLeft + el.offsetWidth / 2 - innerWidth / 2;
  walk.scrollTo({ left: Math.max(0, left), behavior: suave ? "smooth" : "auto" });
}

/* ---------- loja aberta ---------- */
const lojaEl = $("#loja");
let atual = null, ultimoFoco = null;
const idx = slug => LOJAS.findIndex(l => l.slug === slug);

function corpoLoja(l) {
  const st = status(l, diaHoje, hora);
  const acoes = [];
  if (l.wa) acoes.push(`<a class="acao-1" href="https://wa.me/${l.wa}" target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>`);
  else if (l.walink) acoes.push(`<a class="acao-1" href="${l.walink}" target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>`);
  else if (l.tel) acoes.push(`<a class="acao-1" href="tel:+${l.tel}">Ligar ${l.telTexto}</a>`);
  else if (l.link) acoes.push(`<a class="acao-1" href="${l.link}" target="_blank" rel="noopener noreferrer">${l.linkRotulo || "Contato"}</a>`);
  if (l.extra) acoes.push(`<a class="${acoes.length ? "acao-2" : "acao-1"}" href="${l.extra.url}" target="_blank" rel="noopener noreferrer">${l.extra.rotulo}</a>`);
  if (l.ig) acoes.push(`<a class="${acoes.length ? "acao-2" : "acao-1"}" href="https://instagram.com/${l.ig}" target="_blank" rel="noopener noreferrer">Instagram @${l.ig}</a>`);
  if (l.tel && (l.wa || l.walink)) acoes.push(`<a class="acao-2" href="tel:+${l.tel}">Ligar</a>`);
  if (l.link && (l.wa || l.walink || l.tel)) acoes.push(`<a class="acao-2" href="${l.link}" target="_blank" rel="noopener noreferrer">Links da loja</a>`);
  acoes.push(`<button class="acao-2" type="button" data-share>Compartilhar</button>`);
  const i = idx(l.slug), ant = LOJAS[(i - 1 + LOJAS.length) % LOJAS.length], prox = LOJAS[(i + 1) % LOJAS.length];
  return `
    <div class="loja-placa ${REDONDA.has(l.logo) ? "redonda" : ""}" style="--placa:${PLACA[l.logo]}"><img src="assets/logos/${l.logo}.webp" alt="Logo ${l.nome}"></div>
    <div class="loja-info">
      <h2 id="lojaNome">${l.nome}</h2>
      <p class="loja-meta">${l.num ? `Loja ${l.num} · ` : ""}${l.cat}</p>
      <p class="loja-status ${st.on ? "" : "fechada"}">${st.txt}${manual ? ` <small>(às ${fmtH(Math.min(hora, 23.99))})</small>` : ""}</p>
      <blockquote class="loja-frase">“${l.frase}”</blockquote>
      <p class="loja-texto">${l.texto}</p>
      <div class="loja-acoes">${acoes.join("")}</div>
    </div>
    <div class="loja-cols">
      <div><h3>O que você encontra</h3><ul>${l.tem.map(t => `<li>${t}</li>`).join("")}</ul></div>
      <div><h3>Horário</h3><div class="horario">${tabelaHorario(l, diaHoje)}</div></div>
    </div>
    <div class="loja-vizinhas">
      <button type="button" data-ir="${ant.slug}"><span aria-hidden="true">←</span> Porta ao lado<strong>${ant.nome}</strong></button>
      <button type="button" class="prox" data-ir="${prox.slug}">Próxima porta <span aria-hidden="true">→</span><strong>${prox.nome}</strong></button>
    </div>`;
}

function abrirLoja(slug, { empurrar = true } = {}) {
  const l = LOJAS[idx(slug)]; if (!l) return;
  const trocando = !lojaEl.hidden;
  atual = l;
  if (!trocando) ultimoFoco = document.activeElement;
  lojaEl.style.setProperty("--cor", l.cor);
  lojaEl.style.setProperty("--tinta-loja", l.tinta);
  $("#lojaCorpo").innerHTML = corpoLoja(l);
  $("#lojaScroll").scrollTop = 0;
  document.title = `${l.nome} · Guaratiba Shopping`;
  if (empurrar) history.pushState({ loja: slug }, "", `#/${slug}`);
  irPara(document.getElementById("b-" + slug), false);
  lojaEl.classList.remove("fechando");
  lojaEl.classList.toggle("trocando", trocando);
  if (!trocando) { lojaEl.hidden = false; Som.porta(); Ceu.pausa && Ceu.pausa(true); }
  setTimeout(() => $("#lojaScroll").focus({ preventScroll: true }), trocando ? 0 : 420);
}
function fecharLoja({ voltar = true } = {}) {
  if (lojaEl.hidden) return;
  lojaEl.classList.add("fechando");
  Ceu.pausa && Ceu.pausa(false);
  const slug = atual?.slug;
  setTimeout(() => { lojaEl.hidden = true; lojaEl.classList.remove("fechando", "trocando"); }, reduz ? 0 : 420);
  document.title = "Guaratiba Shopping · Tudo em apenas um lugar · Praia de Guaratiba, Prado-BA";
  if (voltar) history.pushState({}, "", location.pathname + location.search);
  const b = slug && document.getElementById("b-" + slug);
  (b || ultimoFoco)?.focus({ preventScroll: true });
}
baysEl.addEventListener("click", e => {
  const a = e.target.closest(".loja-baia"); if (!a) return;
  e.preventDefault(); abrirLoja(a.dataset.slug);
});
$("#lojaFechar").addEventListener("click", () => fecharLoja());
$("#lojaAnt").addEventListener("click", () => abrirLoja(LOJAS[(idx(atual.slug) - 1 + LOJAS.length) % LOJAS.length].slug));
$("#lojaProx").addEventListener("click", () => abrirLoja(LOJAS[(idx(atual.slug) + 1) % LOJAS.length].slug));
lojaEl.addEventListener("click", async e => {
  const ir = e.target.closest("[data-ir]"); if (ir) { abrirLoja(ir.dataset.ir); return; }
  if (e.target.closest("[data-share]")) {
    const url = `${location.origin}${location.pathname}#/${atual.slug}`;
    try {
      if (navigator.share) await navigator.share({ title: `${atual.nome} · Guaratiba Shopping`, url });
      else { await navigator.clipboard.writeText(url); toast("Link da loja copiado"); }
    } catch (_) {}
  }
});
lojaEl.addEventListener("keydown", e => {
  if (e.key === "Escape") fecharLoja();
  if (e.key === "Tab") prender(e, lojaEl);
});
function prender(e, cont) {
  const f = [...cont.querySelectorAll("a[href],button:not([hidden]),input")].filter(x => x.offsetParent !== null);
  if (!f.length) return;
  const p = f[0], u = f[f.length - 1];
  if (e.shiftKey && document.activeElement === p) { u.focus(); e.preventDefault(); }
  else if (!e.shiftKey && document.activeElement === u) { p.focus(); e.preventDefault(); }
}
addEventListener("popstate", () => {
  const m = location.hash.match(/^#\/(.+)$/);
  if (m && idx(m[1]) >= 0) abrirLoja(m[1], { empurrar: false }); else fecharLoja({ voltar: false });
});

/* ---------- diretório ---------- */
const dirEl = $("#diretorio"); let dirAberto = false;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
function listarDiretorio(q = "") {
  const n = norm(q.trim());
  let out = "";
  GRUPOS.forEach(g => {
    const ls = LOJAS.filter(l => l.grupo === g.id && (!n || norm([l.nome, l.cat, l.frase, l.texto, ...l.tem].join(" ")).includes(n)));
    if (!ls.length) return;
    out += `<h3>${g.titulo}</h3>` + ls.map(l => `<button class="dir-item" type="button" data-slug="${l.slug}">
      <img src="assets/logos/${l.logo}.webp" alt="" style="--placa:${PLACA[l.logo]}">
      <span><strong>${l.nome}</strong><small>${l.num ? "Loja " + l.num + " · " : ""}${l.cat}</small></span>
      <span class="st ${l._st.on ? "" : "f"}">${l._st.on ? "Aberta" : "Fechada"}</span></button>`).join("");
  });
  $("#diretorio-lista").innerHTML = out || `<p class="dir-vazio">Nenhuma loja com “${esc(q)}”. Tente outra palavra, como “café” ou “moda”.</p>`;
}
function abrirDir() {
  dirAberto = true; listarDiretorio($("#busca").value); dirEl.hidden = false;
  setTimeout(() => dirEl.classList.add("on"), 20);
  setTimeout(() => $("#busca").focus(), 200);
}
function fecharDir() {
  dirAberto = false; dirEl.classList.remove("on");
  setTimeout(() => dirEl.hidden = true, reduz ? 0 : 450); $("#btnLojas").focus();
}
$("#btnLojas").addEventListener("click", abrirDir);
$("#dirFechar").addEventListener("click", fecharDir);
dirEl.addEventListener("click", e => {
  if (e.target === dirEl) return fecharDir();
  const it = e.target.closest(".dir-item"); if (!it) return;
  dirAberto = false; dirEl.classList.remove("on"); dirEl.hidden = true;
  abrirLoja(it.dataset.slug);
});
dirEl.addEventListener("keydown", e => { if (e.key === "Escape") fecharDir(); if (e.key === "Tab") prender(e, dirEl); });
$("#busca").addEventListener("input", e => listarDiretorio(e.target.value));

/* ---------- toast ---------- */
let tt;
function toast(msg, ms = 3200) { const t = $("#toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("on"), ms); }

/* ---------- som ambiente (gerado no navegador) ---------- */
let somLigado = false;
const Som = (() => {
  let ctx, mar, marGain, master, violaoT, passaroT;
  function iniciar() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    const len = ctx.sampleRate * 4, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    let last = 0; for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.2; }
    mar = ctx.createBufferSource(); mar.buffer = buf; mar.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 700;
    marGain = ctx.createGain(); marGain.gain.value = 0.5;
    const lfo = ctx.createOscillator(), lfoG = ctx.createGain(); lfo.frequency.value = 0.11; lfoG.gain.value = 0.35;
    lfo.connect(lfoG); lfoG.connect(marGain.gain); lfo.start();
    mar.connect(lp); lp.connect(marGain); marGain.connect(master); mar.start();
  }
  function corda(freq, t, vol = 0.18) {
    const sr = ctx.sampleRate, N = Math.round(sr / freq), len = sr * 2.2, buf = ctx.createBuffer(1, len, sr), d = buf.getChannelData(0);
    for (let i = 0; i < N; i++) d[i] = Math.random() * 2 - 1;
    for (let i = N; i < len; i++) d[i] = (d[i - N] + d[i - N + 1]) * 0.497;
    const s = ctx.createBufferSource(), g = ctx.createGain(); s.buffer = buf; g.gain.value = vol;
    s.connect(g); g.connect(master); s.start(t);
  }
  const ACORDES = [[146.8, 220, 293.7, 370], [164.8, 246.9, 329.6, 392], [130.8, 196, 261.6, 329.6], [146.8, 220, 277.2, 370]];
  let ac = 0;
  function violao() {
    if (!somLigado || noite(hora) < 0.5) return;
    const t = ctx.currentTime + 0.05, a = ACORDES[ac++ % ACORDES.length];
    a.forEach((f, i) => corda(f, t + i * 0.11));
    corda(a[2] * 2, t + 0.9, 0.08); corda(a[1] * 2, t + 1.25, 0.08);
  }
  function passaro() {
    if (!somLigado || noite(hora) > 0.3) return;
    const t = ctx.currentTime + 0.02;
    for (let k = 0; k < 2 + Math.floor(Math.random() * 3); k++) {
      const o = ctx.createOscillator(), g = ctx.createGain(), t0 = t + k * 0.13, f = 2600 + Math.random() * 1400;
      o.frequency.setValueAtTime(f, t0); o.frequency.exponentialRampToValueAtTime(f * 1.4, t0 + 0.08);
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.025, t0 + 0.02); g.gain.linearRampToValueAtTime(0, t0 + 0.1);
      o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + 0.12);
    }
  }
  return {
    liga() {
      if (!ctx) iniciar(); ctx.resume();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 1.2);
      clearInterval(violaoT); clearInterval(passaroT);
      violaoT = setInterval(violao, 2600); passaroT = setInterval(passaro, 4200);
      this.atualiza();
    },
    desliga() { if (!ctx) return; master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6); clearInterval(violaoT); clearInterval(passaroT); },
    atualiza() { if (ctx) marGain.gain.value = 0.5 - noite(hora) * 0.18; },
    porta() {
      if (!somLigado || !ctx) return;
      const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "triangle"; o.frequency.setValueAtTime(1320, t); o.frequency.setValueAtTime(1760, t + 0.12);
      g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.65);
    }
  };
})();
$("#btnSom").addEventListener("click", e => {
  somLigado = !somLigado;
  e.currentTarget.setAttribute("aria-pressed", somLigado);
  e.currentTarget.setAttribute("aria-label", somLigado ? "Desligar o som ambiente" : "Ligar o som ambiente");
  $("#somIco").setAttribute("d", somLigado ? "M4 9h4l5-4v14l-5-4H4z M16.5 8.5a5 5 0 0 1 0 7 M19 6a8.5 8.5 0 0 1 0 12" : "M4 9h4l5-4v14l-5-4H4z M16 9l5 6 M21 9l-5 6");
  somLigado ? Som.liga() : Som.desliga();
  toast(somLigado ? (noite(hora) > 0.5 ? "Som da varanda: mar e violão" : "Som da varanda: mar e passarinhos") : "Som desligado", 2000);
});

/* placas balançam quando entram na tela */
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("vista"); io.unobserve(e.target); } }), { root: walk, threshold: 0.35 });
  document.querySelectorAll(".loja-baia,.bay-grupo,.bay-praca").forEach(b => io.observe(b));
} else document.querySelectorAll(".loja-baia").forEach(b => b.classList.add("vista"));

/* ---------- início ---------- */
aplicarHora();
addEventListener("resize", aplicarHora);
const params = new URLSearchParams(location.search);
const porta = params.get("porta");
const m = location.hash.match(/^#\/(.+)$/);
if (porta && idx(porta) >= 0) {
  const b = document.getElementById("b-" + porta);
  b.insertAdjacentHTML("beforeend", `<span class="voce-aqui">Você está aqui</span>`);
  history.replaceState({}, "", location.pathname + location.search);
  abrirLoja(porta);
  toast(`Bem-vindo à porta da ${LOJAS[idx(porta)].nome}`);
} else if (m && idx(m[1]) >= 0) {
  abrirLoja(m[1], { empurrar: false });
} else if (params.get("em")) {
  const b = document.getElementById(params.get("em")) || document.getElementById("b-" + params.get("em"));
  if (b) irPara(b, false);
} else if (porta === "entrada") {
  toast("Bem-vindo ao Guaratiba Shopping");
}
})();
