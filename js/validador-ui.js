/*! IDMAR UI renderers r3 — WIN & Motor */
(function () {
  function el(tag, cls){ const e=document.createElement(tag); if(cls) e.className=cls; return e; }
  function badge(status){
    const b = el('span','badge '+(status==='válido'?'ok':'nok'));
    b.textContent = status || '';
    return b;
  }
  function table(fields){
    const t = el('table','tbl');
    t.innerHTML = `<thead>
      <tr>
        <th data-i18n="field">Campo</th>
        <th data-i18n="value">Valor</th>
        <th data-i18n="meaning">Interpretação</th>
      </tr>
    </thead><tbody></tbody>`;
    const tb = t.querySelector('tbody');
    (fields||[]).forEach(r=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.label||''}</td><td>${r.value||''}</td><td>${r.meaning||''}</td>`;
      tb.appendChild(tr);
    });
    return t;
  }
  function rulesBlock(rules){
    if(!Array.isArray(rules) || !rules.length) return null;
    const d = el('div','panel');
    d.innerHTML = `<h3 data-i18n="rules">Regras aplicadas</h3>
      <ul class="rules">${rules.map(r=>`<li>${r}</li>`).join('')}</ul>`;
    return d;
  }

  window.renderWinResult = function(res){
    const box = document.getElementById('winResult'); if(!box) return;
    box.innerHTML = '';
    const head = el('div','result-header'); head.appendChild(badge(res.status||'')); box.appendChild(head);
    box.appendChild(table(res.fields||[]));
    const rb = rulesBlock(res.rules); if(rb) box.appendChild(rb);
    if (typeof window.showWinForense === 'function'){
      const btn = el('button','btn ghost'); btn.textContent = 'Forense / Forensics';
      btn.onclick = ()=>window.showWinForense(res); box.appendChild(btn);
    }
  };

  window.renderMotorResult = function(res){
    const box = document.getElementById('motorResult'); if(!box) return;
    box.innerHTML = '';
    const head = el('div','result-header'); head.appendChild(badge(res.status||'')); box.appendChild(head);
    box.appendChild(table(res.fields||[]));
    const rb = rulesBlock(res.rules); if(rb) box.appendChild(rb);
    if (typeof window.showMotorForense === 'function'){
      const btn = el('button','btn ghost'); btn.textContent = 'Forense / Forensics';
      btn.onclick = ()=>window.showMotorForense(res); box.appendChild(btn);
    }
  };
})();
