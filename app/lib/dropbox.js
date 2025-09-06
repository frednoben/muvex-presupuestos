// app/lib/dropbox.js
// Helper para subir archivos a Dropbox usando refresh_token
// Compatible con Node 18+ (usa globalThis.fetch)

import { Dropbox } from "dropbox";
import fs from "fs";

export async function uploadToDropbox(filePath, fileName) {
  if (!process.env.DROPBOX_APP_KEY) {
    throw new Error("Falta DROPBOX_APP_KEY en .env.local");
  }
  if (!process.env.DROPBOX_APP_SECRET) {
    throw new Error("Falta DROPBOX_APP_SECRET en .env.local");
  }
  if (!process.env.DROPBOX_REFRESH_TOKEN) {
    throw new Error("Falta DROPBOX_REFRESH_TOKEN en .env.local");
  }
  if (!process.env.DROPBOX_FOLDER_PATH) {
    throw new Error("Falta DROPBOX_FOLDER_PATH en .env.local");
  }

  // Inicializar Dropbox con refresh_token
  const dbx = new Dropbox({
    clientId: process.env.DROPBOX_APP_KEY,
    clientSecret: process.env.DROPBOX_APP_SECRET,
    refreshToken: process.env.DROPBOX_REFRESH_TOKEN,
    fetch: globalThis.fetch, // Node 18+ ya lo tiene integrado
  });

  // Leer archivo desde disco
  const fileContent = fs.readFileSync(filePath);

  // Normalizar carpeta raíz en Dropbox
  const dropboxPathRoot = process.env.DROPBOX_FOLDER_PATH.replace(/\/$/, "");
  const targetPath = `${dropboxPathRoot}/${fileName}`;

  try {
    const result = await dbx.filesUpload({
      path: targetPath,
      contents: fileContent,
      mode: { ".tag": "overwrite" }, // sobreescribe si ya existe
    });

    return { success: true, path: result.result.path_display };
  } catch (error) {
    console.error("Error subiendo a Dropbox:", error);
    return { success: false, error: String(error) };
  }
}
