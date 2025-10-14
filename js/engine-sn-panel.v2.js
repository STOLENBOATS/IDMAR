// UI do cartão 3 (bonita). Depende de window.EngineSNRange.check e dos ranges do Family Picker.
(function(w,d){
  const $ = s => d.querySelector(s);
  const input = $('#engine-sn-raw');
  const win   = $('#engine-sn-window');
  const hints = $('#engine-sn-hints');
  const out   = $('#engine-sn-result');

  if(!input || !out) return;

  function renderVerdict(v){
    out.innerHTML = '';
    const box = d.createElement('div');
    box.style.padding = '.5rem .6rem';
    box.style.border  = '1px solid var(--border)';
    box.style.borderRadius = '10px';
    if(v && v.ok){ box.style.background = '#10b98120'; box.style.borderColor = '#10b98180'; }
    else if(v){ box.style.background = '#ef444420'; box.style.borderColor = '#ef444480'; }
    else { box.style.background = '#f59e0b20'; box.style.borderColor = '#f59e0b80'; }

    const h = d.createElement('div');
    h.style.fontWeight = '700';
    h.textContent = v ? (v.ok ? '✓ Dentro do intervalo' : '✗ Fora do intervalo') : 'Sem validação ativa';
    box.appendChild(h);

    const p = d.createElement('div');
    p.style.marginTop = '.25rem';
    if(v && v.ok && v.match){
      p.textContent = `Intervalo: ${v.match.from} → ${v.match.to}` + (v.match.note ? ` (${v.match.note})` : '');
    }else if(v && !v.ok){
      p.textContent = 'Este nº não encaixa em nenhum intervalo conhecido.';
    }else{
      p.textContent = 'Escolha versão/potência para ativar os intervalos.';
    }
    box.appendChild(p);
    out.appendChild(box);
  }

  function currentRanges(){
    // o family picker deve expor os ranges no estado global
    return (w.EngineFamilyState && Array.isArray(w.EngineFamilyState.ranges)) ? w.EngineFamilyState.ranges : [];
  }

  function update(){
    const raw = input.value;
    const ranges = currentRanges();
    let verdict = null;
    if(raw && w.EngineSNRange && typeof w.EngineSNRange.check === 'function'){
      verdict = w.EngineSNRange.check(raw, ranges);
    }
    renderVerdict(verdict);
    hints.textContent = ranges.length ? `${ranges.length} intervalo(s) ativo(s).` : 'Sem intervalos ativos.';
  }

  input.addEventListener('input', update);
  d.addEventListener('change', update, true);
  d.addEventListener('input',  update, true);
  update();
})(window,document);
