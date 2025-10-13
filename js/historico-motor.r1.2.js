/* IDMAR — Histórico Motor r1.2 (foto via meta.forense + “Ver anexos”) */
(()=>{
// modal partilhado (só cria uma vez)
if(!window.IDMAR_openAttachmentsModal){
  window.IDMAR_openAttachmentsModal = function(record, typeLabel){
    let modal=document.getElementById('idmar-att-modal');
    if(!modal){
      modal=document.createElement('div'); modal.id='idmar-att-modal';
      modal.innerHTML='<div class="idmar-att-backdrop"></div><div class="idmar-att-dialog"><div class="idmar-att-head"><strong id="idmar-att-title">Anexos</strong><button id="idmar-att-close" title="Fechar">×</button></div><div class="idmar-att-body"></div></div>';
      const css=document.createElement('style'); css.textContent=
      '#idmar-att-modal{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:9999}' +
      '.idmar-att-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.35)}' +
      '.idmar-att-dialog{position:relative;max-width:820px;width:calc(100% - 2rem);background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 12px 38px rgba(0,0,0,.25)}' +
      '.idmar-att-head{display:flex;align-items:center;justify-content:space-between;gap:.5rem;padding:.75rem 1rem;border-bottom:1px solid #e5e7eb}' +
      '.idmar-att-body{max-height:70vh;overflow:auto;padding:1rem;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.75rem}' +
      '.idmar-att-card{border:1px solid #e5e7eb;border-radius:10px;padding:.5rem;background:#fafafa}' +
      '.idmar-att-thumb{width:100%;height:140px;object-fit:contain;background:#fff;border:1px solid #e5e7eb;border-radius:8px}' +
      '.idmar-att-meta{font-size:.85rem;margin-top:.4rem}';
      modal.appendChild(css); document.body.appendChild(modal);
      modal.querySelector('#idmar-att-close').onclick=()=>modal.remove();
      modal.querySelector('.idmar-att-backdrop').onclick=()=>modal.remove();
    }else{ modal.querySelector('.idmar-att-body').innerHTML=''; }
    modal.querySelector('#idmar-att-title').textContent='Anexos — '+(typeLabel||'');
    const body=modal.querySelector('.idmar-att-body');
    const list=(record&&record.meta&&Array.isArray(record.meta.forense))?record.meta.forense:[];
    if(!list.length){ const p=document.createElement('p'); p.style.padding='1rem'; p.textContent='Sem anexos.'; body.appendChild(p); }
    else list.forEach((att,i)=>{ const card=document.createElement('div'); card.className='idmar-att-card';
      const img=document.createElement('img'); img.className='idmar-att-thumb'; if(att.thumb_dataurl) img.src=att.thumb_dataurl; img.alt=att.file||('Anexo '+(i+1));
      const meta=document.createElement('div'); meta.className='idmar-att-meta';
      meta.innerHTML='<div><strong>Ficheiro:</strong> '+(att.file||'')+'</div>'+(att.hash_sha256?('<div><strong>SHA-256:</strong> '+att.hash_sha256+'</div>'):'')+'<div><strong>Data:</strong> '+(att.ts||'')+'</div>';
      card.append(img,meta); body.appendChild(card);
    });
  };
}
const $tbody=document.getElementById('histMotorBody')||document.querySelector('tbody');
const $q=document.getElementById('q')||document.querySelector('input[type="search"]');
const $fEst=document.getElementById('fEstado')||document.querySelector('[data-filter="estado"]');
const $from=document.getElementById('fromDate')||document.querySelector('[data-filter="from"]');
const $to=document.getElementById('toDate')||document.querySelector('[data-filter="to"]');
const $btnCSV=document.getElementById('btnExport')||document.querySelector('[data-export="csv"]');

function readKey(k){ try{ const r=localStorage.getItem(k); if(!r) return []; const a=JSON.parse(r); return Array.isArray(a)?a:[] }catch{ return [] } }
function deriveFoto(r){ if(r.foto) return r.foto; const fx=(r.meta&&Array.isArray(r.meta.forense))?r.meta.forense:[]; if(!fx.length) return ''; const f=fx[0]?.file||''; return f ? (f+' (+'+Math.max(0,fx.length-1)+')') : (fx.length+' anexo(s)'); }
function sanitize(x){ const o={...x}; o.ts=o.ts||x.timestamp||''; o.sn=o.sn||x.serial||'';
 