// Forensic rules rendering per brand (skeleton; to be enriched with your domain notes)
(function(){
  const q = new URLSearchParams(location.search);
  const initial = q.get('brand') || '';
  const rulesDiv = document.getElementById('rules');
  const pick = document.getElementById('brandPick');
  if(initial){ pick.value = initial; }
  pick.addEventListener('change', render);
  render();

  function render(){
    const b = pick.value;
    rulesDiv.innerHTML = '';
    if(!b){ return; }
    const frag = document.createDocumentFragment();
    frag.appendChild(card('Identificação principal / Primary identification', primary(b)));
    frag.appendChild(card('Padrões & códigos / Patterns & codes', patterns(b)));
    frag.appendChild(card('Observações periciais / Forensic notes', notes(b)));
    frag.appendChild(card('Red flags / Inconsistências', redflags(b)));
    rulesDiv.appendChild(frag);
  }

  function card(title, bodyHtml){
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `<h3>${title}</h3>${bodyHtml}`;
    return el;
  }

  function primary(brand){
    switch(brand){
      case 'Yamaha':
        return `<ul>
          <li><b>Placa lateral do motor</b> — Modelo, Código (ex.: <span class="mono">6D0</span>), Letra, Nº Série.<span class="sub-en">(Side tag — Model, Code, Letter, S/N.)</span></li>
          <li><b>Bloco</b> — carimbos em zonas críticas.<span class="sub-en">(Stamped areas on block.)</span></li>
        </ul>`;
      case 'Honda':
        return `<ul>
          <li><b>Placa</b> — Modelo (ex.: <span class="mono">BF90D</span>), Frame/Código, Nº Série.<span class="sub-en">(Tag — Model, Frame/Code, S/N.)</span></li>
        </ul>`;
      case 'Mercury':
        return `<ul>
          <li><b>Etiqueta</b> — Nº Série (ex.: <span class="mono">1B123456</span>), Modelo.<span class="sub-en">(Sticker — Serial, Model.)</span></li>
        </ul>`;
      case 'Suzuki':
        return `<ul>
          <li><b>Placa</b> — Modelo (ex.: <span class="mono">DF90A</span>), Nº Série.<span class="sub-en">(Tag — Model, S/N.)</span></li>
        </ul>`;
      case 'Volvo Penta':
        return `<ul>
          <li><b>Plate</b> — Modelo, <b>N.º Produto (P/N)</b>, Nº Série.<span class="sub-en">(Model, Product No, Serial)</span></li>
          <li><b>Localização</b>: placa lateral/bloco; alguns modelos têm etiqueta extra no corpo de borboleta.<span class="sub-en">(Plate on side/block; some models have extra label on throttle body.)</span></li>
        </ul>`;
      case 'Evinrude':
        return `<ul>
          <li><b>Placa</b> — Modelo (ex.: <span class="mono">E90DPXSUR</span>), Tipo/BOM, Nº Série.<span class="sub-en">(Model, Type/BOM, Serial)</span></li>
        </ul>`;
      case 'Selva':
        return `<ul><li><b>Placa</b> — Modelo, Nº Série.</li></ul>`;
      case 'Tohatsu':
        return `<ul><li><b>Placa</b> — Modelo, Nº Série.</li></ul>`;
    }
    return '';
  }

  function patterns(brand){
    switch(brand){
      case 'Mercury':
        return `<p>Prefixos de série comuns: <span class="mono">0C, 0D, 0G, 0T, 1A, 1B, 1C, 1D, 2B</span> — sugerem faixa de anos.<span class="sub-en">(Common serial prefixes — suggest year ranges.)</span></p>`;
      case 'Suzuki':
        return `<p>Modelos típicos: <span class="mono">DF/DT</span> + potência (ex.: <span class="mono">DF90A</span>).<span class="sub-en">(Model pattern: DF/DT + power.)</span></p>`;
      case 'Volvo Penta':
        return `<p>Diesel: <span class="mono">D4, D6, TAMD, TMD, AD, AQD, KAD…</span><br>Gasolina: <span class="mono">4.3GL/GXi, 5.0GXi, 5.7GXi, V6-240/V8-280…</span><span class="sub-en">(Common model families)</span></p>`;
      default:
        return `<p class="muted">A definir.<span class="sub-en">(To be defined.)</span></p>`;
    }
  }

  function notes(brand){
    return `<p class="muted">Notas periciais por marca a preencher.<span class="sub-en">(Brand-specific forensic notes to fill.)</span></p>`;
  }

  function redflags(brand){
    return `<ul>
      <li>Remarcações, desalinhamentos, corrosão seletiva.<span class="sub-en">(Re-stamping, misalignment, selective corrosion.)</span></li>
      <li>Incoerência entre <b>Modelo</b> e <b>N.º Série</b> / ano.<span class="sub-en">(Model vs Serial/year inconsistency.)</span></li>
    </ul>`;
  }

  // If brand passed in URL, render immediately
  if(initial){ render(); }
})();