"use client";
import { useState } from "react";
import { aGuaranies, miles, onlyDigits } from "./utils/num2words";

export default function Home(){
  const [num, setNum] = useState(null);
  const [loadingNum, setLoadingNum] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [msg, setMsg] = useState("");

  const [f, setF] = useState({
    fecha:"", cliente:"", empresa:"", ruc:"", telefono:"",
    desde:"", hasta:"",
    srvDesde:"", srvHasta:"",
    stdMonto:"", intMonto:"",
    estM3:"", estTiempo:"",
    fechaSugerida:""
  });
  const stdLetras = f.stdMonto ? aGuaranies(onlyDigits(f.stdMonto)) : "";
  const intLetras = f.intMonto ? aGuaranies(onlyDigits(f.intMonto)) : "";
  const setField=(k,v)=>setF(p=>({...p,[k]:v}));

  async function reservarNumero(){
    setLoadingNum(true);
    try{
      const res = await fetch("/api/presupuestos/new", { method: "POST" });
      const data = await res.json();
      if(!data.ok) throw new Error(data.error||"No se pudo reservar número");
      setNum(data.display);
    }catch(e){ alert(e.message); } finally{ setLoadingNum(false); }
  }

  async function generarPDF(){
    if(!num){ alert("Primero reservá el número de presupuesto."); return; }
    setGenerating(true); setMsg("");
    try{
      const body = {
        nro: num,
        fecha: f.fecha, cliente: f.cliente, empresa: f.empresa, ruc: f.ruc, telefono: f.telefono,
        desde_cabecera: f.desde, hasta_cabecera: f.hasta,
        srv_desde: f.srvDesde, srv_hasta: f.srvHasta,
        std_num: onlyDigits(f.stdMonto), std_letras: stdLetras,
        int_num: onlyDigits(f.intMonto), int_letras: intLetras,
        est_m3: onlyDigits(f.estM3), est_tiempo: f.estTiempo,
        fecha_sugerida: f.fechaSugerida
      };
      const res = await fetch("/api/pdf", { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if(!data.ok) throw new Error(data.error||"No se pudo generar PDF");
      setMsg(`Listo: ${data.fileName} — Abrir en OneDrive: ${data.webUrl}`);
    }catch(e){ setMsg("Error: "+e.message); }
    finally{ setGenerating(false); }
  }

  return (<main>
    <h1 style={{fontSize:28,fontWeight:800}}>Muvex — Presupuesto</h1>
    <p style={{opacity:.8}}>Consecutivo iniciando en <b>01154</b>. Luego genera DOCX→PDF y guarda en OneDrive.</p>

    <div style={{display:"flex",gap:12,alignItems:"center"}}>
      <button onClick={reservarNumero} disabled={loadingNum} style={btn()}>
        {loadingNum?"Reservando...":(num?"Reservar otro número":"Reservar número")}
      </button>
      {num && <span style={{fontWeight:700}}>Nro.: {num}</span>}
    </div>

    <hr style={{margin:"18px 0"}}/>

    <section style={card()}>
      <h2 style={h2()}>Datos principales</h2>
      <div style={grid()}>
        <Field label="Fecha" value={f.fecha} onChange={v=>setField("fecha",v)} placeholder="08 de Agosto de 2025"/>
        <Field label="Cliente" value={f.cliente} onChange={v=>setField("cliente",v)} />
        <Field label="Empresa" value={f.empresa} onChange={v=>setField("empresa",v)} />
        <Field label="RUC" value={f.ruc} onChange={v=>setField("ruc",v)} />
        <Field label="Teléfono" value={f.telefono} onChange={v=>setField("telefono",v)} />
        <Field label="Desde (cabecera)" value={f.desde} onChange={v=>setField("desde",v)} placeholder="Bo. Mburucuya – Asunción." />
        <Field label="Hasta (cabecera)" value={f.hasta} onChange={v=>setField("hasta",v)} placeholder="Bo. Madame Lynch – Asunción." />
      </div>
    </section>

    <section style={card()}>
      <h2 style={h2()}>Servicios a realizar</h2>
      <div style={grid(2)}>
        <Field label="Mudanza de (texto libre)" value={f.srvDesde} onChange={v=>setField("srvDesde",v)} placeholder="Edificio" />
        <Field label="a (texto libre)" value={f.srvHasta} onChange={v=>setField("srvHasta",v)} placeholder="Casa" />
      </div>
      <div style={{marginTop:8,fontSize:14,opacity:.7}}>Se insertará como: <b>Mudanza de {f.srvDesde||"…"} a {f.srvHasta||"…"}</b></div>
    </section>

    <section style={card()}>
      <h2 style={h2()}>Montos</h2>
      <div style={grid(2)}>
        <Field label="Costo mudanza local standard (numérico)" value={f.stdMonto} onChange={v=>setField("stdMonto",onlyDigits(v))} placeholder="2950000" />
        <ReadOnly label="En letras (auto)" value={f.stdMonto?stdLetras:""} />
      </div>
      <div style={grid(2)}>
        <Field label="Costo mudanza local integral (numérico)" value={f.intMonto} onChange={v=>setField("intMonto",onlyDigits(v))} placeholder="5650000" />
        <ReadOnly label="En letras (auto)" value={f.intMonto?intLetras:""} />
      </div>
    </section>

    <section style={card()}>
      <h2 style={h2()}>Estimado previo</h2>
      <div style={grid(2)}>
        <Field label="m³ (0–999)" value={f.estM3} onChange={v=>setField("estM3",onlyDigits(v).slice(0,3))} placeholder="100"/>
        <Field label="Tiempo de trabajo (texto)" value={f.estTiempo} onChange={v=>setField("estTiempo",v)} placeholder="2 días de trabajo"/>
      </div>
    </section>

    <section style={card()}>
      <h2 style={h2()}>Fecha sugerida</h2>
      <Field label="Texto libre" value={f.fechaSugerida} onChange={v=>setField("fechaSugerida",v)} placeholder="Quincena de Agosto / A definir de 2025"/>
    </section>

    <div style={{display:"flex",gap:12, alignItems:"center", marginTop:12}}>
      <button onClick={generarPDF} disabled={generating} style={btn()}>
        {generating ? "Generando PDF..." : "Generar DOCX→PDF y guardar en OneDrive"}
      </button>
      {msg && <span style={{fontSize:12}}>{msg}</span>}
    </div>
  </main>);
}

function Field({label, value, onChange, placeholder}){
  return (<label style={{display:"flex",flexDirection:"column",gap:6}}>
    <span style={{fontSize:12,fontWeight:600,opacity:.8}}>{label}</span>
    <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{padding:"10px 12px",border:"1px solid #ddd",borderRadius:10,outline:"none"}}/>
  </label>);
}
function ReadOnly({label,value}){
  return (<div style={{display:"flex",flexDirection:"column",gap:6}}>
    <span style={{fontSize:12,fontWeight:600,opacity:.8}}>{label}</span>
    <div style={{padding:"10px 12px",border:"1px solid #eee",borderRadius:10,background:"#fafafa",minHeight:42}}>
      {value || <span style={{opacity:.5}}>—</span>}
    </div>
  </div>);
}
function card(){return {border:"1px solid #eee",borderRadius:16,padding:16,marginTop:14,background:"white"};}
function h2(){return {fontSize:18,fontWeight:800,marginBottom:12};}
function grid(cols=3){return {display:"grid",gridTemplateColumns:`repeat(${cols}, minmax(0, 1fr))`,gap:12};}
function btn(){return {padding:"10px 16px",borderRadius:10,border:"1px solid #ddd",cursor:"pointer",fontWeight:700};}
