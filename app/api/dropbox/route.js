// app/api/generate/route.js
import { NextResponse } from "next/server";
import path from "path";
import os from "os";
import fs from "fs/promises";
import { uploadToDropbox } from "../dropbox/route"; // <- tu helper creado

// Si vas a usar docx-templates / pdf-lib o lo que ya tenías,
// importa aquí tus helpers reales de generación:
// import { buildDocxBuffer, buildPdfBuffer } from "@/lib/generacion";

export const runtime = "nodejs";

export async function POST(req) {
  // 1) Leer la data (ajusta según cómo la envías desde el form)
  //    - Si envías JSON:        const data = await req.json();
  //    - Si envías form-data:   const form = await req.formData(); ...leer campos...
  const data = await req.json().catch(() => ({}));

  try {
    // 2) Generar los buffers DOCX/PDF
    //    Reemplaza este bloque por tu lógica real de generación.
    //    Aquí solo simulo buffers para mostrar el flujo.
    //
    //    Por ejemplo, si ya tenías algo como:
    //       const docxBuffer = await buildDocxBuffer(data);
    //       const pdfBuffer  = await buildPdfBuffer(data);
    //
    const docxBuffer = Buffer.from("DOCX_DE_EJEMPLO"); // <- reemplaza
    const pdfBuffer = Buffer.from("PDF_DE_EJEMPLO");   // <- reemplaza

    // Identificador de archivo
    const fileSlug =
      data?.fileSlug ||
      `presupuesto_${new Date().toISOString().replace(/[:.]/g, "-")}`;

    // 3) Escribir a archivos temporales
    const tmpRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "muvex-") // p.ej. /tmp/muvex-XYZ
    );
    const tmpDocx = path.join(tmpRoot, `${fileSlug}.docx`);
    const tmpPdf = path.join(tmpRoot, `${fileSlug}.pdf`);

    await fs.writeFile(tmpDocx, docxBuffer);
    await fs.writeFile(tmpPdf, pdfBuffer);

    // 4) Subir a Dropbox (usa tu helper)
    const upPdf = await uploadToDropbox(tmpPdf, `${fileSlug}.pdf`);
    const upDocx = await uploadToDropbox(tmpDocx, `${fileSlug}.docx`);

    // 5) Limpieza temporal (opcional, segura)
    //    No hacemos throw si falla el unlink; lo registramos nomás.
    await fs.unlink(tmpPdf).catch(() => {});
    await fs.unlink(tmpDocx).catch(() => {});
    await fs.rmdir(tmpRoot).catch(() => {});

    // 6) Respuesta
    if (!upPdf.success || !upDocx.success) {
      return NextResponse.json(
        {
          ok: false,
          message: "Alguna subida falló",
          pdf: upPdf,
          docx: upDocx,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Archivos generados y guardados en Dropbox",
      pdf: upPdf,   // { success: true, path: "/carpeta/archivo.pdf" }
      docx: upDocx, // { success: true, path: "/carpeta/archivo.docx" }
    });
  } catch (err) {
    console.error("error en generación:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
