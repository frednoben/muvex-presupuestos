import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import createReport from "docx-templates";

const TENANT = process.env.GRAPH_TENANT_ID;
const CLIENT_ID = process.env.GRAPH_CLIENT_ID;
const CLIENT_SECRET = process.env.GRAPH_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GRAPH_REFRESH_TOKEN;
const FOLDER_PATH = process.env.ONEDRIVE_FOLDER_PATH || "/Presupuestos";

async function getAccessToken(){
  const params = new URLSearchParams();
  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET);
  params.append("refresh_token", REFRESH_TOKEN);
  params.append("grant_type", "refresh_token");
  params.append("scope", "https://graph.microsoft.com/.default offline_access");
  const url = `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`;
  const res = await fetch(url, { method:"POST", headers:{ "content-type":"application/x-www-form-urlencoded" }, body: params });
  const data = await res.json();
  if(!res.ok) throw new Error(data.error_description || data.error || "No se obtuvo access_token");
  return data.access_token;
}

async function uploadByPath(accessToken, folderPath, fileName, buffer, contentType){
  const pathFull = `${folderPath}/${fileName}`.replace(/\/+/, "/");
  const enc = encodeURIComponent(pathFull).replace(/%2F/g, "/");
  const url = `https://graph.microsoft.com/v1.0/me/drive/root:/${enc}:/content`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}`, "content-type": contentType },
    body: buffer
  });
  const data = await res.json();
  if(!res.ok) throw new Error(data.error?.message || "Error subiendo archivo");
  return data; // driveItem
}

async function getItemContentAsPdf(accessToken, itemId){
  const url = `https://graph.microsoft.com/v1.0/me/drive/items/${itemId}/content?format=pdf`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if(!res.ok) {
    const t = await res.text();
    throw new Error("Error convirtiendo a PDF: " + t);
  }
  const arr = await res.arrayBuffer();
  return Buffer.from(arr);
}

export async function POST(req){
  try{
    const body = await req.json();
    // 1) Cargar plantilla
    const templatePath = path.join(process.cwd(), "templates", "presupuesto.docx");
    const template = await fs.readFile(templatePath);

    // 2) Rellenar DOCX
    const docxBuffer = await createReport({
      template,
      data: body,
      cmdDelimiter: ["{{", "}}"],
    });

    // 3) Autenticación Graph
    const token = await getAccessToken();

    // 4) Subir DOCX por path
    const folderRel = (process.env.ONEDRIVE_FOLDER_PATH || "/Presupuestos").replace(/^\/+/, "").replace(/\/+$/, "");
    const safeClient = (body.cliente || "").toString().replace(/[/\\:*?"<>|]/g, "-").trim() || "Cliente";
    const safeFecha = (body.fecha || "").toString().replace(/[/\\:*?"<>|]/g, "-").trim() || "fecha";
    const baseName = `Presupuesto ${body.nro} - ${safeClient} - ${safeFecha}`;

    const docxItem = await uploadByPath(token, folderRel, baseName + ".docx", docxBuffer, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

    // 5) Descargar PDF derivado y subirlo por path (misma carpeta)
    const pdfBuffer = await getItemContentAsPdf(token, docxItem.id);
    const pdfItem = await uploadByPath(token, folderRel, baseName + ".pdf", pdfBuffer, "application/pdf");

    return NextResponse.json({ ok: true, fileName: pdfItem.name, webUrl: pdfItem.webUrl });
  }catch(err){
    return NextResponse.json({ ok:false, error: err.message });
  }
}
