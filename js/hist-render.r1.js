// IDMAR - History Renderer r1
(function(w,d){
  function byId(id){ return d.getElementById(id); }
  function loadKey(k){ try{ return JSON.parse(localStorage.getItem(k) || "[]"); }catch(e){ return []; } }
  function unique(arr){ var m={}, out=[]; arr.forEach(function(x){ var h=JSON.stringify(x); if(!m[h]){m[h]=1; out.push(x);} }); return out; }
  function normalize(arr){
    return (arr||[]).map(function(x){
      // normalize known fields; accept both PT/EN keys if exist
      var o = {};
      if (typeof x !== 'object' || !x) return {raw:x};
      o.date = x.date || x.data || x.timestamp || x.when || "";
      o.win  = x.win || x.hin || x.cin || x.numero || x.number || "";
      o.motor= x.motor || x.sn || x.engine || x.engine_sn || "";
      o.result = x.result || x.resultado || x.valid || x.status || "";
      o.reason = x.reason || x.justificacao || x.details || x.motivo || "";
      o.photo = x.photo || x.foto || x.image || x.img || x.photoUrl || "";
      o.meta  = x.meta || x;
      return o;
    });
  }
  function pickHistory(){
    // Decide by page: WIN vs Motor
    var id = (d.body && d.body.id) || "";
    var isMotor = /motor/i.test(id) || /historico_motor\.html$/i.test(location.pathname);
    var keysWin = ["hist_win","history_win","IDMAR_WIN_HISTORY","NAV_WIN_HISTORY"];
    var keysMotor = ["hist_motor","history_motor","IDMAR_MOTOR_HISTORY","NAV_MOTOR_HISTORY"];
    var keys = isMotor ? keysMotor : keysWin;
    var rows = [];
    keys.forEach(function(k){ rows = rows.concat(loadKey(k)); });
    return normalize(unique(rows));
  }
  function render(){
    var table = d.getElementById("history-table");
    if(!table) return;
    var tbody = table.querySelector("tbody") || table.appendChild(d.createElement("tbody"));
    // If already has rows (other script rendered), do nothing
    if (tbody.querySelector("tr:not([data-template])")) return;
    var data = pickHistory();
    if (!data.length) return;
    data.forEach(function(r){
      var tr = d.createElement("tr");
      function td(v){ var c=d.createElement("td"); c.textContent = (v==null?"":String(v)); return c; }
      // Detect columns by header labels
      var headers = Array.from(table.querySelectorAll("thead th")).map(function(th){ return th.textContent.trim().toLowerCase(); });
      function headerIndex(name){
        var i = headers.indexOf(name.toLowerCase());
        if(i<0 && name.toLowerCase()==='foto'){ i = headers.indexOf('photo'); }
        return i;
      }
      // Build cells in order of headers, fallback to sensible order
      if (headers.length){
        headers.forEach(function(h){
          if (/data|date|quando|hora/.test(h)) tr.appendChild(td(r.date));
          else if (/win|hin|cin|n[ºo]\s*casco|casco|hull/.test(h)) tr.appendChild(td(r.win));
          else if (/motor|engine|sn/.test(h)) tr.appendChild(td(r.motor));
          else if (/resultado|result|status|válido/.test(h)) tr.appendChild(td(r.result));
          else if (/just|reason|motivo|detalh/.test(h)) tr.appendChild(td(r.reason));
          else if (/foto|photo|imagem/.test(h)){
            var c = d.createElement("td");
            if (r.photo){
              var img = d.createElement("img");
              img.src = r.photo;
              img.alt = "Foto";
              img.style.maxWidth = "120px"; img.style.maxHeight = "80px";
              img.loading = "lazy";
              c.appendChild(img);
            }
            tr.appendChild(c);
          } else {
            tr.appendChild(td(""));
          }
        });
      } else {
        tr.appendChild(td(r.date));
        tr.appendChild(td(r.win || r.motor));
        tr.appendChild(td(r.result));
        tr.appendChild(td(r.reason));
        var c = d.createElement("td");
        if (r.photo){ var img = d.createElement("img"); img.src=r.photo; img.style.maxWidth="120px"; img.style.maxHeight="80px"; img.loading="lazy"; c.appendChild(img); }
        tr.appendChild(c);
      }
      tbody.appendChild(tr);
    });
  }
  if(d.readyState!=="loading") render(); else d.addEventListener("DOMContentLoaded", render);
})(window, document);