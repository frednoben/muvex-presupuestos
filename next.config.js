// app/api/dropbox/route.js
import { Dropbox } from "dropbox";
import fs from "fs";

export async function uploadToDropbox(filePath, fileName) {
  if (!process.env.DROPBOX_ACCESS_TOKEN) {
    throw new Error("Falta DROPBOX_ACCESS_TOKEN en .env.local");
  }
  if (!process.env.DROPBOX_FOLDER_PATH) {
    throw new Error("Falta DROPBOX_FOLDER_PATH en .env.local");
  }

  const dbx = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN });
  const fileContent = fs.readFileSync(filePath);

  const dropboxPathRoot = process.env.DROPBOX_FOLDER_PATH.replace(/\/$/, "");
  const targetPath = `${dropboxPathRoot}/${fileName}`;

  try {
    await dbx.filesUpload({
      path: targetPath,
      contents: fileContent,
      mode: { ".tag": "overwrite" }, // sobreescribe si ya existe
    });

    return { success: true, path: targetPath };
  } catch (error) {
    console.error("Error subiendo a Dropbox:", error);
    return { success: false, error: String(error) };
  }
}
