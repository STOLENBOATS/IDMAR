
// IDMAR - Motor Simple Validator (no external fetch)
(function(w,d){
  function $(id){ return d.getElementById(id); }
  function val(v){ return (v||"").trim(); }
  function on(el,ev,fn){ el && el.addEventListener(ev,fn); }
  function b64(file){ 
    return new Promise(function(res,rej){
      if(!file) return res("");
      var r=new FileReader(); r.onload=function(){res(r.result)}; r.onerror=rej; r.readAsDataURL(file);
    });
  }
  function makeIdentifier(brand, model, serial){
    var b = brand.replace(/\s+/g,'').slice(0,3).toUpperCase();
    var m = model.replace(/\s+/g,'').slice(0,4).toUpperCase();
    var s = serial.replace(/\W+/g,'').slice(-6).toUpperCase();
    return [b,m,s].filter(Boolean).join("-");
  }
  function basicHeuristics(brand, model, serial){
    // minimal, deterministic, and explainable heuristics by brand
    var ok = true, notes = [];
    if(!serial || serial.length < 5){ ok=false; notes.push("Número de série muito curto."); }
    if(/[^\w\-\/\.]/.test(serial)){ ok=false; notes.push("Caracteres inesperados no nº de série."); }
    if(/yamaha/i.test(brand) && !/\d{6,}/.test(serial)) notes.push("Yamaha costuma incluir sequência numérica longa (>6).");
    if(/mercury/i.test(brand) && !/[A-Z]{1,3}\d{5,}/i.test(serial)) notes.push("Mercury frequentemente tem prefixo alfabético seguido de números.");
    if(/honda/i.test(brand) && !/^\w{2,5}-?\d{5,}/.test(serial)) notes.push("Honda comum: prefixo (2–5) + numeração.");
    return { ok: ok, details: notes.join(" ") || "Formato plausível." };
  }
  function chooseLocation(){
    var r = d.querySelector('input[name="loc"]:checked');
    return r ? r.value : "auto";
  }
  async function run(){
    var brand = val($("brand").value);
    var model = val($("model").value);
    var variant = val($("variant").value);
    var serial = val($("serial").value);
    var notes  = val($("notes").value);
    var file = $("photo").files && $("photo").files[0];
    var photo = await b64(file);
    var id = makeIdentifier(brand, model, serial);
    var heur = basicHeuristics(brand, model, serial);
    var status = heur.ok ? "Válido (sintaxe plausível)" : "A verificar";
    var meaning = heur.details + (variant? " Variante: "+variant+".":"");

    $("identifier").textContent = id || "—";
    $("status").textContent = status;
    $("status").className = "result " + (heur.ok?"ok":"bad");
    $("meaning").textContent = meaning;

    // record to localStorage
    var rec = {
      date: new Date().toISOString(),
      brand: brand, model: model, variant: variant, motor: serial,
      result: status, reason: meaning, photo: photo, loc: chooseLocation(), notes: notes
    };
    try{
      var arr = JSON.parse(localStorage.getItem("hist_motor")||"[]");
      arr.unshift(rec);
      localStorage.setItem("hist_motor", JSON.stringify(arr));
    }catch(e){ console.warn("history save failed", e); }

    return rec;
  }

  on($("photo"), "change", async function(ev){
    var f = ev.target.files && ev.target.files[0];
    if(!f){ $("preview").src=""; return; }
    var reader = new FileReader(); reader.onload = function(){ $("preview").src = reader.result; };
    reader.readAsDataURL(f);
  });

  on($("btn-validate"), "click", function(){ run(); });
  on($("btn-clear"), "click", function(){
    ["brand","model","variant","serial","notes"].forEach(function(id){ var el=$(id); if(el) el.value=""; });
    $("preview").src="";
    $("identifier").textContent="Aguardando..."; $("status").textContent=""; $("meaning").textContent="";
  });
})(window, document);
