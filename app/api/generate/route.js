// app/api/generate/route.js
import { NextResponse } from "next/server";
import path from "path";
import os from "os";
import fs from "fs/promises";
import { uploadToDropbox } from "../../lib/dropbox"; // <--- aquí el cambio

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const data = await req.json();

    const fileSlug = data.fileSlug || `presupuesto_${Date.now()}`;
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "muvex-"));
    const tmpDocx = path.join(tmpDir, `${fileSlug}.docx`);
    const tmpPdf  = path.join(tmpDir, `${fileSlug}.pdf`);

    // TODO: Genera de verdad tus buffers DOCX/PDF con tu plantilla.
    // Por ahora, buffers de prueba:
    const docxBuffer = Buffer.from("DOCX generado...");
    const pdfBuffer  = Buffer.from("PDF generado...");

    await fs.writeFile(tmpDocx, docxBuffer);
    await fs.writeFile(tmpPdf,  pdfBuffer);

    const uploadedDocx = await uploadToDropbox(tmpDocx, `${fileSlug}.docx`);
    const uploadedPdf  = await uploadToDropbox(tmpPdf,  `${fileSlug}.pdf`);

    return NextResponse.json({
      ok: true,
      message: "Archivos generados y guardados en Dropbox",
      docx: uploadedDocx,
      pdf: uploadedPdf,
    });
  } catch (err) {
    console.error("Error en /api/generate:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
