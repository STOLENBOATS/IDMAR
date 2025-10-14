// js/engine-sn-panel.v2.js (uses CurrentBrandPolicy)
(function(w,d){
  const $ = s => d.querySelector(s);
  const input = '#engine-sn-raw';
  const hints = '#engine-sn-hints';
  const out   = '#engine-sn-result';

  function Q(sel){ return d.querySelector(sel); }
  if(!Q(input) || !Q(out)) return;

  function li(t){ const x=d.createElement('li'); x.textContent=t; return x; }

  function renderVerdict(v){
    const outEl = Q(out), hintsEl = Q(hints);
    outEl.innerHTML = '';
    const box = d.createElement('div');
    box.style.padding = '.5rem .6rem';
    box.style.border  = '1px solid var(--border)';
    box.style.borderRadius = '10px';

    if(v && v.ok){ box.style.background = '#10b98120'; box.style.borderColor = '#10b98180'; }
    else if(v){ box.style.background = '#ef444420'; box.style.borderColor = '#ef444480'; }
    else { box.style.background = '#f59e0b20'; box.style.borderColor = '#f59e0b80'; }

    const title = d.createElement('div');
    title.style.fontWeight = '700';
    title.textContent = v ? (v.ok ? '✓ Dentro do intervalo' : '✗ Fora do intervalo') : 'Sem validação ativa';
    const detail = d.createElement('div');
    detail.style.marginTop = '.25rem';

    const list = d.createElement('ul'); list.style.marginTop='.25rem';

    if(v && v.ok && v.matches?.length){
      detail.textContent = 'Intervalos:';
      v.matches.forEach(m=>{
        const pretty = (m.prefix||'') + (m.from||'') + ' … ' + (m.prefix||'') + (m.to||'');
        list.appendChild(li(pretty + (m.note?` (${m.note})`:'')));
      });
    } else if(v && v.reason === 'sem_intervalos') {
      detail.textContent = 'Validação estrutural (sem intervalos).';
    } else if(v && !v.ok){
      detail.textContent = 'Este nº não encaixa em nenhum intervalo conhecido.';
    } else {
      detail.textContent = 'Escolha versão/potência para ativar os intervalos.';
    }

    box.appendChild(title);
    box.appendChild(detail);
    if(list.childNodes.length) box.appendChild(list);
    outEl.appendChild(box);

    if (hintsEl) hintsEl.textContent = (v && v.matches) ? `${v.matches.length} intervalo(s) ativo(s).` : 'Sem intervalos ativos.';
  }

  function currentRanges(){
    if (w.EngineFamilyState && Array.isArray(w.EngineFamilyState.ranges)) return w.EngineFamilyState.ranges;
    return [];
  }

  function update(){
    const raw = Q(input).value || '';
    const ranges = currentRanges();
    const policy = w.CurrentBrandPolicy || null;
    let verdict = null;
    if(raw && w.EngineSNRange && typeof w.EngineSNRange.check === 'function'){
      verdict = w.EngineSNRange.check(raw, ranges, policy);
    }
    renderVerdict(verdict);
  }

  d.addEventListener('change', update, true);
  d.addEventListener('input',  update, true);
  update();
})(window,document);
