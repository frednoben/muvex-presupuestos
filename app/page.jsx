"use client";
import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/presupuestos/new", { method: "POST" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Error");
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Muvex — Generar Presupuesto</h1>
      <p style={{ marginTop: 8, opacity: 0.8 }}>
        Secuencia consecutiva iniciando en <b>01154</b>.
      </p>

      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          marginTop: 16,
          padding: "10px 16px",
          borderRadius: 10,
          border: "1px solid #ddd",
          cursor: "pointer",
          fontWeight: 600
        }}
      >
        {loading ? "Generando..." : "Generar número de presupuesto"}
      </button>

      {result && (
        <div style={{ marginTop: 24, padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
          <div style={{ fontSize: 14, opacity: 0.7 }}>Número generado</div>
          <div style={{ fontSize: 36, fontWeight: 800 }}>{result.display}</div>
        </div>
      )}

      {error && (
        <div style={{ marginTop: 24, padding: 16, border: "1px solid #f5c2c7", background: "#f8d7da", borderRadius: 12 }}>
          <b>Error:</b> {error}
        </div>
      )}
    </main>
  );
}
