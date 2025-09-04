# Muvex — Presupuestos (Fase 3 completa)

- Numeración consecutiva (Neon + @vercel/postgres)
- Formulario con campos acordados
- DOCX templating (docx-templates)
- Subida a OneDrive + conversión a PDF (Microsoft Graph)

## Variables de entorno
### Base de datos
POSTGRES_URL=
POSTGRES_URL_NON_POOLING=
COUNTER_NAME=presupuesto
COUNTER_START=1154
COUNTER_PADDING=5

### Microsoft Graph / OneDrive
GRAPH_TENANT_ID=
GRAPH_CLIENT_ID=
GRAPH_CLIENT_SECRET=
GRAPH_REFRESH_TOKEN=
ONEDRIVE_FOLDER_PATH=/Presupuestos/2025

## Plantilla
Coloca `templates/presupuesto.docx` con los placeholders indicados en `templates/README.txt`.
