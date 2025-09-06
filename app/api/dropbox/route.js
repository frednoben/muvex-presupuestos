// app/api/dropbox/route.js
// ------------------------------------------------------------
// Requisitos de entorno (.env.local):
//   DROPBOX_ACCESS_TOKEN            (opcional si usas refresh token)
//   DROPBOX_REFRESH_TOKEN           (recomendado)
//   DROPBOX_CLIENT_ID               (requerido si usas refresh token)
//   DROPBOX_CLIENT_SECRET           (requerido si usas refresh token)
//   DROPBOX_FOLDER_PATH             ("/" para raíz de la app; o "/subcarpeta")
// Nota: En apps "App folder", el root de la API YA es
//       /Aplicaciones/<nombre-de-tu-app> en tu Dropbox.
//       NO incluyas "/Aplicaciones/..." en DROPBOX_FOLDER_PATH.
// ------------------------------------------------------------

export const runtime = "nodejs";

import { Dropbox } from "dropbox";
import fs from "fs";

/**
 * Normaliza el folder configurado en el .env:
 *  - "/"  => raíz del App Folder
 *  - "/algo/" => "/algo" (sin barra final)
 *  - "" o no definido => raíz (string vacío)
 */
function normalizeFolderPath(envPath) {
  let folder = (envPath ?? "/").trim();
  if (folder === "/") return "";       // raíz de la app
  folder = folder.replace(/\/+$/, ""); // quita barras al final
  if (folder.startsWith("/")) return folder.slice(1); // sin barra inicial
  return folder;
}

/**
 * Sube un archivo a Dropbox.
 * @param {string|Buffer|Uint8Array} filePathOrBuffer - Ruta local del archivo o buffer.
 * @param {string} fileName - Nombre final en Dropbox (p.ej. "presupuesto_01162.pdf")
 * @returns {Promise<{success: boolean, path?: string, id?: string, error?: string}>}
 */
export async function uploadToDropbox(filePathOrBuffer, fileName) {
  // 1) Validación de credenciales
  const hasRefresh =
    !!process.env.DROPBOX_REFRESH_TOKEN &&
    !!process.env.DROPBOX_CLIENT_ID &&
    !!process.env.DROPBOX_CLIENT_SECRET;

  const hasAccess = !!process.env.DROPBOX_ACCESS_TOKEN;

  if (!hasRefresh && !hasAccess) {
    throw new Error(
      "Faltan credenciales de Dropbox. Provee REFRESH_TOKEN + CLIENT_ID + CLIENT_SECRET, o un ACCESS_TOKEN."
    );
  }

  // 2) Instancia del SDK (preferimos refresh token si está)
  const dbx = new Dropbox({
    accessToken: hasRefresh ? undefined : process.env.DROPBOX_ACCESS_TOKEN,
    refreshToken: hasRefresh ? process.env.DROPBOX_REFRESH_TOKEN : undefined,
    clientId: hasRefresh ? process.env.DROPBOX_CLIENT_ID : undefined,
    clientSecret: hasRefresh ? process.env.DROPBOX_CLIENT_SECRET : undefined,
    fetch: globalThis.fetch, // Node 18+ ya trae fetch
  });

  // 3) Contenido a subir
  let contents;
  if (typeof filePathOrBuffer === "string") {
    // Ruta local
    contents = fs.readFileSync(filePathOrBuffer);
  } else {
    // Buffer/Uint8Array
    contents = filePathOrBuffer;
  }

  // 4) Armado del path destino en Dropbox
  const normalizedFolder = normalizeFolderPath(process.env.DROPBOX_FOLDER_PATH);
  // si normalizedFolder está vacío => raíz; si no, forma "carpeta/archivo"
  const targetPath = `/${normalizedFolder ? `${normalizedFolder}/` : ""}${fileName}`;

  // 5) Subida
  console.log("[DROPBOX] Subiendo a:", targetPath);
  try {
    const resp = await dbx.filesUpload({
      path: targetPath,
      contents,
      mode: { ".tag": "overwrite" },
    });
    const saved = resp.result ?? resp; // compat SDK
    const savedPath = saved?.path_display || saved?.path_lower || targetPath;
    console.log("[DROPBOX] OK:", savedPath);
    return { success: true, path: savedPath, id: saved?.id };
  } catch (err) {
    console.error("[DROPBOX] ERROR:", err);
    return { success: false, error: String(err) };
  }
}

/**
 * Handler POST (opcional) para pruebas rápidas:
 * curl -X POST http://localhost:3000/api/dropbox \
 *   -H "Content-Type: application/json" \
 *   -d '{"tmpPath":"C:/ruta/local/archivo.pdf","fileName":"test.pdf"}'
 */
export async function POST(req) {
  try {
    const { tmpPath, fileName } = await req.json();
    if (!tmpPath || !fileName) {
      return Response.json(
        { ok: false, error: "Falta tmpPath o fileName" },
        { status: 400 }
      );
    }

    const res = await uploadToDropbox(tmpPath, fileName);
    if (!res.success) {
      return Response.json({ ok: false, error: res.error }, { status: 500 });
    }
    return Response.json({ ok: true, path: res.path, id: res.id });
  } catch (err) {
    console.error("[DROPBOX][POST] ERROR:", err);
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
