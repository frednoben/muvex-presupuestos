"use client";
import { useState } from "react";

/**
 * Convierte enteros (0–999,999,999) a letras en castellano, con mayúscula inicial.
 * (Suficiente para presupuestos habituales; si necesitás billones, lo ampliamos.)
 */
function numeroALetras(n) {
  n = Number(n);
  if (!Number.isFinite(n) || n < 0 || n > 999999999) return "";
  if (n === 0) return "Cero";

  const u = [
    "", "uno", "dos", "tres", "cuatro", "cinco", "seis",
    "siete", "ocho", "nueve", "diez", "once", "doce",
    "trece", "catorce", "quince", "dieciséis", "diecisiete",
    "dieciocho", "diecinueve"
  ];
  const d = [
    "", "", "veinte", "treinta", "cuarenta", "cincuenta",
    "sesenta", "setenta", "ochenta", "noventa"
  ];
  const c = [
    "", "cien", "doscientos", "trescientos", "cuatrocientos",
    "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"
  ];

  function decenasYUnidades(x) {
    if (x < 20) return u[x];
    if (x < 30) return x === 20 ? "veinte" : "veinti" + u[x - 20];
    const dd = Math.floor(x / 10);
    const uu = x % 10;
    return d[dd] + (uu ? " y " + u[uu] : "");
  }

  function centenas(x) {
    if (x < 100) return decenasYUnidades(x);
    const cc = Math.floor(x / 100);
    const rest = x % 100;
    if (cc === 1) return rest === 0 ? "cien" : "ciento " + decenasYUnidades(rest);
    return c[cc] + (rest ? " " + decenasYUnidades(rest) : "");
  }

  function miles(x) {
    if (x < 1000) return centenas(x);
    const mm = Math.floor(x / 1000);
    const rest = x % 1000;
    const pref = mm === 1 ? "mil" : centenas(mm) + " mil";
    return pref + (rest ? " " + centenas(rest) : "");
  }

  function millones(x) {
    if (x < 1000000) return miles(x);
    const M = Math.floor(x / 1000000);
    const rest = x % 1000000;
    const pref = M === 1 ? "un millón" : miles(M) + " millones";
    return pref + (rest ? " " + miles(rest) : "");
  }

  const texto = millones(n);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default function Page() {
  const [loading, setLoading] = useState(false);

  // Vista previa en vivo de los montos en letras
  const [montoLetras, setMontoLetras] = useState("");
  const [ajusteLetras, setAjusteLetras] = useState("");

  function onChangeMonto(e) {
    const val = e.target.value.replace(/\D/g, ""); // solo dígitos
    e.target.value = val;
    setMontoLetras(val ? numeroALetras(parseInt(val, 10)) : "");
  }

  function onChangeAjuste(e) {
    const val = e.target.value.replace(/\D/g, ""); // solo dígitos
    e.target.value = val;
    setAjusteLetras(val ? numeroALetras(parseInt(val, 10)) : "");
  }

  async function handleGenerate() {
    try {
      setLoading(true);

      // 1) Tomar todos los campos del form
      const raw = new FormData(document.getElementById("presuForm"));
      const data = Object.fromEntries(raw.entries());

      // 2) Calcular y asegurar campos en letras (con mayúscula inicial)
      if (data.monto_total) {
        const n = parseInt(data.monto_total, 10);
        if (!Number.isNaN(n)) data.monto_total_letras = numeroALetras(n);
      }
      if (data.ajuste_adicional) {
        const n = parseInt(data.ajuste_adicional, 10);
        if (!Number.isNaN(n)) data.ajuste_adicional_letras = numeroALetras(n);
      }

      // 3) Llamar a tu backend /api/generate
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      console.log("Respuesta backend:", result);

      if (result.ok) {
        alert("✅ Presupuesto generado y guardado en Dropbox");
      } else {
        alert("❌ Error: " + (result.error || "desconocido"));
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error inesperado: " + String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 900 }}>
      <h1 style={{ marginBottom: 16 }}>Formulario de Presupuesto MUVEX</h1>

      <form
        id="presuForm"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          alignItems: "center",
        }}
      >
        {/* 1–8: datos generales */}
        <input type="text" name="cliente" placeholder="Cliente" required />
        <input type="text" name="empresa" placeholder="Empresa" />
        <input type="tel" name="telefono" placeholder="Teléfono" />
        <input type="email" name="email" placeholder="Email" />
        <input type="text" name="direccion_origen" placeholder="Dirección ORIGEN" />
        <input type="text" name="direccion_destino" placeholder="Dirección DESTINO" />
        <input type="text" name="ciudad" placeholder="Ciudad" />
        <input type="text" name="pais" placeholder="País" />

        {/* 2) “Mudanza de … a …” (campos libres) */}
        <input type="text" name="mudanza_de" placeholder="Mudanza de (Casa/Edificio…)" />
        <input type="text" name="mudanza_a" placeholder="Mudanza a (Casa/Edificio…)" />

        {/* Campo 13: Estimado previo (hasta 3 dígitos) */}
        <input
          type="text"
          name="estimado_previo"
          placeholder="Estimado previo (0–999)"
          maxLength={3}
          onInput={(e) => (e.target.value = e.target.value.replace(/\D/g, "").slice(0, 3))}
        />

        {/* “2 días de trabajo” → campo libre */}
        <input type="text" name="duracion_trabajo" placeholder="Duración de trabajo (p. ej.: 2 días de trabajo)" />

        {/* 14: Fecha sugerida (texto libre) */}
        <input type="text" name="fecha_sugerida" placeholder="Fecha sugerida (p. ej.: Quincena de Agosto)" />

        {/* 15 y 16 fijos (si hay textos fijos, podés ocultarlos o ponerlos como hidden) */}
        <input type="hidden" name="termino_fijo_15" value="Texto fijo 15" />
        <input type="hidden" name="termino_fijo_16" value="Texto fijo 16" />

        {/* 9 y 10: Monto → Monto en letras (auto) */}
        <div style={{ gridColumn: "1 / span 2", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ display: "block", marginBottom: 4 }}>Monto total (solo números)</label>
            <input type="text" name="monto_total" placeholder="Ej.: 1500000" onInput={onChangeMonto} />
            <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
              {montoLetras ? `En letras: ${montoLetras}` : "En letras: —"}
            </div>
            {/* Campo oculto que viaja al backend */}
            <input type="hidden" name="monto_total_letras" value={montoLetras} readOnly />
          </div>

          {/* 11 y 12: Ajuste adicional → en letras (auto) */}
          <div>
            <label style={{ display: "block", marginBottom: 4 }}>Ajuste adicional (solo números)</label>
            <input type="text" name="ajuste_adicional" placeholder="Ej.: 200000" onInput={onChangeAjuste} />
            <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
              {ajusteLetras ? `En letras: ${ajusteLetras}` : "En letras: —"}
            </div>
            {/* Campo oculto que viaja al backend */}
            <input type="hidden" name="ajuste_adicional_letras" value={ajusteLetras} readOnly />
          </div>
        </div>

        {/* Observaciones */}
        <textarea
          name="observaciones"
          placeholder="Observaciones / Detalles del servicio"
          style={{ gridColumn: "1 / span 2", minHeight: 80 }}
        />
      </form>

      <div style={{ marginTop: 16 }}>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          style={{ padding: "0.8rem 1.2rem", fontWeight: "bold" }}
        >
          {loading ? "Generando..." : "Generar DOCX—PDF y guardar en Dropbox"}
        </button>
      </div>
    </main>
  );
}
