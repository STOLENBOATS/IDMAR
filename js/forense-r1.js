/* IDMAR • Forense r1a (fix coords + A/B UX) • 2025-09-18 */
(() => {
  const $ = (s) => document.querySelector(s);
  const els = {
    inputFiles:  $('#evPhotos'),
    selContext:  $('#evContext'),
    btnAttach:   $('#evAttach'),
    meta:        $('#evMeta'),
    thumbs:      $('#evThumbs'),
    btnLbOpen:   $('#lbOpen'),
    cmpRange:    $('#cmpRange'),
    btnAddRect:  $('#addRect'),
    btnClrRect:  $('#clearRects'),
    btnExport:   $('#exportPNG'),
    btnSave:     $('#saveBundle'),
    inputLoad:   $('#loadBundle'),
    notes:       $('#notes'),
    canvas:      $('#evCanvas'),
    lb:          $('#lightbox'),
    lbImg:       $('#lbImg'),
  };

  const state = {
    images: [],              // [{blob,url,name,w,h,size,type}]
    activeIdx: 0,            // imagem A
    compareIdx: 1,           // imagem B
    ctx: null,
    dpr: 1,
    zoom: 1,
    pan: {x:0,y:0},
    drawMode: false,
    rects: [],               // em coordenadas **da imagem A**
    drawing: null,           // {x,y,w,h} em coords da imagem A
    render: {dx:0,dy:0,scale:1,viewW:0,viewH:0}, // cache do último draw
  };

  // ---------- utils ----------
  const isImg = (f)=>/^image\//.test(f?.type||'');
  const fmtSize = (n)=>{const kb=n/1024,mb=kb/1024;return mb>=1?`${mb.toFixed(2)} MB`:`${kb.toFixed(0)} kB`;};
  function bomDownload(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();}
  function loadImage(url){return new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src=url;});}
  function fitContain(dstW,dstH,srcW,srcH){return !srcW||!srcH?1:Math.min(dstW/srcW,dstH/srcH);}

  // ---------- inputs ----------
  async function onFilesChange(files){
    state.images.length=0;
    els.thumbs && (els.thumbs.innerHTML='');
    els.meta && (els.meta.innerHTML='');
    const arr = Array.from(files||[]).filter(isImg);
    for (const f of arr){
      const url = URL.createObjectURL(f);
      const {w,h} = await getDim(url);
      state.images.push({ blob:f,url,name:f.name,w,h,size:f.size||0,type:f.type });
      addThumb(state.images.length-1);
      addMeta(f.name,f.type,w,h,f.size);
    }
    state.activeIdx = 0;
    state.compareIdx = Math.min(1, state.images.length-1);
    refreshThumbBadges();
    drawCompare();
  }
  function getDim(url){return new Promise(r=>{const im=new Image();im.onload=()=>r({w:im.naturalWidth,h:im.naturalHeight});im.onerror=()=>r({w:0,h:0});im.src=url;});}

  function addThumb(idx){
    if (!els.thumbs) return;
    const it = state.images[idx];
    const wrap = document.createElement('div');
    wrap.style.position='relative';
    wrap.style.display='inline-block';
    wrap.style.margin='0 .25rem .25rem 0';

    const btn = document.createElement('button');
    btn.type='button';
    Object.assign(btn.style,{border:'1px solid #e5e7eb',borderRadius:'10px',padding:0,background:'#fff',overflow:'hidden',cursor:'pointer'});
    const img = document.createElement('img'); img.src=it.url; img.alt=it.name; img.style.height='72px'; img.style.display='block';
    btn.appendChild(img);

    // etiqueta A/B
    const badge = document.createElement('span');
    Object.assign(badge.style,{position:'absolute',top:'4px',left:'6px',background:'rgba(0,0,0,.6)',color:'#fff',borderRadius:'6px',padding:'0 .35rem',fontSize:'.75rem'});
    badge.textContent='';
    wrap.append(btn,badge);

    // clique normal → A ; Shift-clique ou botão direito → B
    btn.addEventListener('click',(e)=>{
      if (e.shiftKey){ state.compareIdx = idx; }
      else { state.activeIdx = idx; }
      if (state.compareIdx===state.activeIdx && state.images.length>1){
        state.compareIdx = (state.activeIdx+1)%state.images.length;
      }
      refreshThumbBadges(); drawCompare();
    });
    btn.addEventListener('contextmenu',(e)=>{
      e.preventDefault();
      state.compareIdx = idx;
      if (state.compareIdx===state.activeIdx && state.images.length>1){
        state.activeIdx = (state.compareIdx+1)%state.images.length;
      }
      refreshThumbBadges(); drawCompare();
    });

    wrap.dataset.idx = idx;
    wrap.dataset.badge = '';
    els.thumbs.appendChild(wrap);
  }

  function refreshThumbBadges(){
    if (!els.thumbs) return;
    els.thumbs.querySelectorAll('[data-idx]').forEach(el=>{}); // noop old
    els.thumbs.querySelectorAll('div[data-idx]').forEach(el=>{}); // noop old
    // actualizar badges
    els.thumbs.querySelectorAll('div').forEach(div=>{
      if (!('idx' in div.dataset)) { try{div.dataset.idx = Array.prototype.indexOf.call(els.thumbs.children, div); }catch(_){} }
    });
    [...els.thumbs.children].forEach((wrap,i)=>{
      const b = wrap.querySelector('span');
      b.textContent = (i===state.activeIdx?'A':(i===state.compareIdx?'B':''));
      b.style.display = b.textContent ? 'inline-block' : 'none';
      wrap.style.outline = (i===state.activeIdx||i===state.compareIdx)?'2px solid #60a5fa':'none';
    });
  }

  function addMeta(name,type,w,h,size){
    if (!els.meta) return;
    const card = document.createElement('div');
    Object.assign(card.style,{border:'1px solid #e5e7eb',borderRadius:'10px',padding:'.5rem'});
    const t = document.createElement('div'); t.style.fontWeight='700'; t.textContent = name;
    const s = document.createElement('div'); s.className='small'; s.textContent = `${type||'image'} • ${w}×${h}px • ${fmtSize(size)}`;
    card.append(t,s); els.meta.appendChild(card);
  }

  // ---------- lightbox ----------
  function openLightbox(i=0){ if(!els.lb||!els.lbImg||!state.images.length) return; state.activeIdx=Math.max(0,Math.min(i,state.images.length-1)); els.lbImg.src=state.images[state.activeIdx].url; els.lb.style.display='flex'; }
  function closeLightbox(){ if(els.lb) els.lb.style.display='none'; }
  function lbNext(){ if(!state.images.length) return; state.activeIdx=(state.activeIdx+1)%state.images.length; els.lbImg&&(els.lbImg.src=state.images[state.activeIdx].url); }
  function lbPrev(){ if(!state.images.length) return; state.activeIdx=(state.activeIdx-1+state.images.length)%state.images.length; els.lbImg&&(els.lbImg.src=state.images[state.activeIdx].url); }
  if (els.lbImg){
    let scale=1;
    els.lbImg.style.transition='transform .1s';
    els.lbImg.addEventListener('wheel',(e)=>{e.preventDefault(); const d=Math.sign(e.deltaY); scale=Math.min(5,Math.max(1,scale-d*0.1)); els.lbImg.style.transform=`scale(${scale})`;},{passive:false});
    els.lb&&els.lb.addEventListener('click',(e)=>{if(e.target===els.lb){scale=1;els.lbImg.style.transform='scale(1)';closeLightbox();}});
    document.addEventListener('keydown',(e)=>{ if(els.lb&&els.lb.style.display==='flex'){ if(e.key==='Escape') closeLightbox(); if(e.key==='ArrowRight') lbNext(); if(e.key==='ArrowLeft') lbPrev(); }});
  }

  // ---------- canvas & coords fix ----------
  function setupCanvas(){
    if (!els.canvas) return;
    const c = els.canvas; const ctx = c.getContext('2d');
    state.ctx = ctx; state.dpr = window.devicePixelRatio || 1;
    resizeCanvas(); window.addEventListener('resize', resizeCanvas);

    // Pan com botão do meio ou Shift+arrastar
    c.addEventListener('mousedown',(e)=>{
      if (!state.drawMode && (e.button===1 || e.shiftKey)){
        state._panStart = {x:e.clientX, y:e.clientY}; state._panning=true; e.preventDefault();
      } else if (state.drawMode && e.button===0){
        const p = mouseToImage(e);
        if (!p) return;
        state.drawing = {x:p.x, y:p.y, w:0, h:0};
      }
    });
    window.addEventListener('mouseup',()=>{
      if (state._panning) state._panning=false;
      if (state.drawing){
        const r = normalizeRect(state.drawing);
        state.rects.push(r);
        state.drawing=null; drawCompare();
      }
    });
    c.addEventListener('mousemove',(e)=>{
      if (state._panning && state._panStart){
        state.pan.x += (e.clientX - state._panStart.x) * state.dpr;
        state.pan.y += (e.clientY - state._panStart.y) * state.dpr;
        state._panStart = {x:e.clientX, y:e.clientY};
        drawCompare();
      } else if (state.drawMode && state.drawing){
        const p = mouseToImage(e);
        if (!p) return;
        state.drawing.w = p.x - state.drawing.x;
        state.drawing.h = p.y - state.drawing.y;
        drawCompare();
      }
    });
    // Zoom com Ctrl+roda
    c.addEventListener('wheel',(e)=>{
      if (!e.ctrlKey) return;
      e.preventDefault();
      const d = Math.sign(e.deltaY);
      const before = mouseToImage(e);
      state.zoom = Math.min(6, Math.max(0.2, state.zoom - d*0.1));
      const after = mouseToImage(e);
      if (before && after){
        // manter o ponto sob o rato
        state.pan.x += (after.cx - before.cx);
        state.pan.y += (after.cy - before.cy);
      }
      drawCompare();
    }, {passive:false});
  }

  function resizeCanvas(){
    const c = els.canvas; if (!c) return;
    const parent = c.parentElement || document.body;
    const rect = parent.getBoundingClientRect();
    const dpr = state.dpr;
    c.width = Math.max(320, Math.floor(rect.width * dpr));
    c.height= Math.max(240, Math.floor(rect.height* dpr));
    c.style.width = `${Math.floor(c.width/dpr)}px`;
    c.style.height= `${Math.floor(c.height/dpr)}px`;
    drawCompare();
  }

  // converter posição do rato → coordenadas na imagem A
  function mouseToImage(e){
    if (!state.images[state.activeIdx]) return null;
    const c = els.canvas; const r = c.getBoundingClientRect();
    const px = (e.clientX - r.left) * state.dpr;
    const py = (e.clientY - r.top)  * state.dpr;
    const {dx,dy,scale} = state.render;
    // coords no canvas após pan/zoom e antes de dx/dy/scale
    const cx = (px - state.pan.x) / state.zoom;
    const cy = (py - state.pan.y) / state.zoom;
    // remover as margens dx/dy e voltar ao espaço da imagem (antes do fit)
    const x = (cx - dx) / (scale || 1);
    const y = (cy - dy) / (scale || 1);
    return { x, y, cx: px, cy: py };
  }

  function normalizeRect(r){
    const x = r.w<0 ? r.x + r.w : r.x;
    const y = r.h<0 ? r.y + r.h : r.y;
    const w = Math.abs(r.w), h = Math.abs(r.h);
    return { x, y, w, h };
  }

  async function drawCompare(){
    const c = els.canvas, ctx = state.ctx; if (!c||!ctx) return;
    ctx.clearRect(0,0,c.width,c.height);
    ctx.save();
    ctx.translate(state.pan.x, state.pan.y);
    ctx.scale(state.zoom, state.zoom);

    const A = state.images[state.activeIdx]; if (!A){ ctx.restore(); return; }
    const B = state.images[state.compareIdx];
    const imgA = await loadImage(A.url);

    const viewW = c.width / state.dpr, viewH = c.height / state.dpr;
    const scale = fitContain(viewW, viewH, A.w, A.h);
    const dx = (viewW - A.w*scale)/2;
    const dy = (viewH - A.h*scale)/2;
    state.render = {dx,dy,scale,viewW,viewH};

    // base A
    ctx.drawImage(imgA, 0,0,A.w,A.h, dx,dy, A.w*scale, A.h*scale);

    // overlay B (wipe)
    const pct = Math.max(0, Math.min(100, Number(els.cmpRange?.value || 50)));
    if (B && pct>0){
      const imgB = await loadImage(B.url);
      const sw = (pct/100) * (A.w*scale);
      ctx.save();
      ctx.beginPath();
      ctx.rect(dx, dy, sw, A.h*scale);
      ctx.clip();
      ctx.drawImage(imgB, 0,0,B.w,B.h, dx,dy, A.w*scale, A.h*scale);
      ctx.restore();
    }

    // anotações (em coords da imagem A → para canvas com dx/dy/scale)
    ctx.lineWidth = 2/state.zoom;
    ctx.strokeStyle = '#ef4444';
    ctx.fillStyle = 'rgba(239,68,68,.14)';
    for (const r of state.rects){
      ctx.fillRect(dx + r.x*scale, dy + r.y*scale, r.w*scale, r.h*scale);
      ctx.strokeRect(dx + r.x*scale, dy + r.y*scale, r.w*scale, r.h*scale);
    }
    if (state.drawMode && state.drawing){
      const r = normalizeRect(state.drawing);
      ctx.fillRect(dx + r.x*scale, dy + r.y*scale, r.w*scale, r.h*scale);
      ctx.strokeRect(dx + r.x*scale, dy + r.y*scale, r.w*scale, r.h*scale);
    }

    ctx.restore();
  }

  // ---------- export/bundle ----------
  function exportPNG(){
    if (!els.canvas) return;
    els.canvas.toBlob((blob)=>{ if(!blob) return; bomDownload(blob, `forense-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.png`); }, 'image/png');
  }
  function saveBundle(){
    const meta = state.images.map(i=>({name:i.name,size:i.size,type:i.type}));
    const data = { ts:new Date().toISOString(), images:meta, rects:state.rects, notes:els.notes?.value||'', compare:{activeIdx:state.activeIdx, compareIdx:state.compareIdx, pct:Number(els.cmpRange?.value||50)} };
    const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
    bomDownload(blob, `forense-bundle-${Date.now()}.json`);
  }
  function loadBundle(file){
    if(!file) return;
    file.text().then(txt=>{ try{ const d=JSON.parse(txt); state.rects=Array.isArray(d.rects)?d.rects:[]; if(els.notes) els.notes.value=d.notes||''; if(els.cmpRange&&d.compare&&typeof d.compare.pct==='number') els.cmpRange.value=String(d.compare.pct); drawCompare(); }catch(e){ console.warn('Bundle inválido',e); } });
  }

  // ---------- hash + anexar ----------
  async function hashBlobSHA256(blob){ const buf=await blob.arrayBuffer(); const dig=await crypto.subtle.digest('SHA-256',buf); return [...new Uint8Array(dig)].map(b=>b.toString(16).padStart(2,'0')).join(''); }
  function readHistory(keys){ for (const k of keys){ try{ const raw=localStorage.getItem(k); if(raw) return {key:k,arr:JSON.parse(raw)||[]}; }catch(_){}} return {key:keys[0],arr:[]}; }
  function writeHistory(key,arr){ try{ localStorage.setItem(key, JSON.stringify(arr)); }catch(_){ } }
  async function attachEvidence(){
    const ctx = (els.selContext?.value || 'win').toLowerCase();
    const keys = ctx==='motor' ? ['history_motor','historyMotor'] : ['history_win','historyWin'];
    const { key, arr } = readHistory(keys);
    if (!arr.length) { alert('Histórico vazio — faça uma validação primeiro.'); return; }
    const files = state.images.map(i=>i.blob).filter(Boolean);
    const hashes = [];
    for (const f of files){ hashes.push({ name:f.name, sha256:await hashBlobSHA256(f), size:f.size, type:f.type }); }
    const evidence = { ts:new Date().toISOString(), context:ctx, hashes, notes:els.notes?.value||'', rects:state.rects };
    arr[0].evidence = arr[0].evidence || []; arr[0].evidence.push(evidence);
    writeHistory(key, arr);
    alert('Evidências anexadas ao último registo.');
  }

  // ---------- bindings ----------
  function bindUI(){
    els.inputFiles && els.inputFiles.addEventListener('change', (e)=> onFilesChange(e.target.files));
    els.btnLbOpen  && els.btnLbOpen.addEventListener('click', ()=> openLightbox(0));
    els.cmpRange   && els.cmpRange.addEventListener('input', drawCompare);
    els.btnAddRect && els.btnAddRect.addEventListener('click', ()=>{ state.drawMode=!state.drawMode; els.btnAddRect.setAttribute('aria-pressed', state.drawMode?'true':'false'); });
    els.btnClrRect && els.btnClrRect.addEventListener('click', ()=>{ state.rects=[]; state.drawing=null; drawCompare(); });
    els.btnExport  && els.btnExport.addEventListener('click', exportPNG);
    els.btnSave    && els.btnSave.addEventListener('click', saveBundle);
    els.inputLoad  && els.inputLoad.addEventListener('change', (e)=> loadBundle(e.target.files?.[0]));
    els.btnAttach  && els.btnAttach.addEventListener('click', attachEvidence);
  }

  function init(){ setupCanvas(); bindUI(); }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
