
// IDMAR - Motor Quick Card
(function(w,d){
  function g(id){return d.getElementById(id)}
  function v(x){return (x||"").trim()}
  function heur(brand, model, serial){
    var ok=true, msg=[];
    if(!serial || serial.length<5){ok=false; msg.push("nº série curto");}
    if(/[^\w\-\/\.]/.test(serial)){ok=false; msg.push("caracteres inválidos");}
    if(!brand) msg.push("sem marca");
    return {ok:ok, msg: msg.join("; ")||"Formato plausível."};
  }
  function save(rec){
    try{ var a=JSON.parse(localStorage.getItem("hist_motor")||"[]"); a.unshift(rec); localStorage.setItem("hist_motor", JSON.stringify(a)); }catch(e){}
  }
  function run(){
    var brand=v(g("mq-brand").value), model=v(g("mq-model").value), variant=v(g("mq-variant").value), serial=v(g("mq-serial").value);
    var h=heur(brand,model,serial);
    var rec={date:new Date().toISOString(), brand, model, variant, motor:serial, result:(h.ok?"Válido (sintaxe plausível)":"A verificar"), reason:h.msg, photo:""};
    save(rec);
    var fb=g("mq-feedback"); if(fb){ fb.textContent = "Registado: " + [brand, model, variant, serial].filter(Boolean).join(" / "); }
  }
  var btn=g("mq-validate"); if(btn) btn.addEventListener("click", run);
})(window, document);
