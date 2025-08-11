"use client";
import { useState } from "react";
import { aGuaranies, formateaMiles } from "./utils/num2words";

export default function Home(){
  const [num, setNum] = useState(null);
  const [loadingNum, setLoadingNum] = useState(false);
  const [f, setF] = useState({
    fecha:"", cliente:"", empresa:"", ruc:"", telefono:"",
    desde:"", hasta:"",
    srvDesde:"", srvHasta:"",
    stdMonto:"", intMonto:"",
    estM3:"", estTiempo:"",
    fechaSugerida:""
  });
  const stdLetras = f.stdMonto ? aGuaranies(String(f.stdMonto).replace(/\D/g,"")) : "";
  const intLetras = f.intMonto ? aGuaranies(String(f.intMonto).replace(/\D/g,"")) : "";
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

  return (<main>
    <h1 style={{fontSize:28,fontWeight:800}}>Muvex — Generar Presupuesto</h1>
    <p style={{opacity:.8}}>Secuencia consecutiva iniciando en <b>01154</b>.</p>

    <button onClick={reservarNumero} disabled={loadingNum} style={btn()}>
      {loadingNum?"Reservando...":(num?"Reservar otro número":"Reservar número de presupuesto")}
    </button>
    {num && <span style={{marginLeft:12,fontWeight:700}}>Nro. reservado: {num}</span>}

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
        <Field label="Costo mudanza local standard (numérico)" value={f.stdMonto}
          onChange={v=>setField("stdMonto",v.replace(/\D/g,""))} placeholder="2950000" />
        <ReadOnly label="En letras (auto)" value={f.stdMonto?stdLetras:""} />
      </div>
      <div style={grid(2)}>
        <Field label="Costo mudanza local integral (numérico)" value={f.intMonto}
          onChange={v=>setField("intMonto",v.replace(/\D/g,""))} placeholder="5650000" />
        <ReadOnly label="En letras (auto)" value={f.intMonto?intLetras:""} />
      </div>
    </section>

    <section style={card()}>
      <h2 style={h2()}>Estimado previo</h2>
      <div style={grid(2)}>
        <Field label="m³ (0–999)" value={f.estM3}
          onChange={v=>setField("estM3", v.replace(/\D/g,"").slice(0,3))} placeholder="100"/>
        <Field label="Tiempo de trabajo (texto)" value={f.estTiempo} onChange={v=>setField("estTiempo",v)} placeholder="2 días de trabajo"/>
      </div>
    </section>

    <section style={card()}>
      <h2 style={h2()}>Fecha sugerida</h2>
      <Field label="Texto libre" value={f.fechaSugerida} onChange={v=>setField("fechaSugerida",v)} placeholder="Quincena de Agosto / A definir de 2025"/>
    </section>

    <section style={card()}>
      <h2 style={h2()}>Previsualización</h2>
      <div style={{lineHeight:1.7}}>
        <div><b>Presupuesto Nro.:</b> {num||"—"} &nbsp; <b>Fecha:</b> {f.fecha||"—"}</div>
        <div><b>CLIENTE:</b> {f.cliente||"—"}</div>
        <div><b>EMPRESA:</b> {f.empresa||"—"}</div>
        <div><b>RUC:</b> {f.ruc||"—"}</div>
        <div><b>TELÉFONO:</b> {f.telefono||"—"}</div>
        <div><b>DESDE:</b> {f.desde||"—"}</div>
        <div><b>HASTA:</b> {f.hasta||"—"}</div>
        <h3 style={{marginTop:12,textDecoration:"underline"}}>SERVICIOS A REALIZAR</h3>
        <ol>
          <li>Provisión de personales especializados en el manipuleo de artículos varios.</li>
          <li>Mudanza de <b>{f.srvDesde||"…"}</b> a <b>{f.srvHasta||"…"}</b>.</li>
          <li>Protección de los ítems a ser transportados dentro del camión con mantas acolchadas.</li>
          <li>Confección de lista de empaque de los ítems a ser transportados.</li>
          <li>Carga y estiba dentro del camión furgón diseñado para el efecto.</li>
          <li>Acomodo sólo de muebles en destino según indicaciones.</li>
        </ol>
        <p><b>Costo de mudanza local standard</b> — Gs. {f.stdMonto?formateaMiles(f.stdMonto):"—"} - IVA incluido.<br/>(Guaraníes:) {stdLetras||"—"}</p>
        <p><b>Costo de mudanza local integral</b> — Gs. {f.intMonto?formateaMiles(f.intMonto):"—"} - IVA incluido.<br/>(Guaraníes:) {intLetras||"—"}</p>
        <p><b>Estimado previo:</b> {f.estM3||"—"} m³ aprox. – {f.estTiempo||"—"}.</p>
        <p><b>Fecha sugerida:</b> {f.fechaSugerida||"—"}.</p>
        <p><b>Reserva:</b> Según disponibilidad e ingreso de seña del 50%.</p>
        <p><b>Forma de pago:</b> Efectivo, transferencia, TC**.</p>
      </div>
    </section>
    <p style={{opacity:.7,fontSize:12,marginTop:12}}>PDF idéntico + OneDrive: siguiente fase.</p>
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
