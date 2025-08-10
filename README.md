# Muvex — Presupuestos (Starter)

Next.js + Vercel Postgres. Genera números consecutivos (inicia en **01154**) y expone un endpoint para crear presupuestos.
> PDF y OneDrive se integrarán en la siguiente fase.

## Requisitos
- Vercel account
- Vercel Postgres (plan free)
- Node 18+ (local opcional)

## Setup rápido (Vercel)
1. Crea un repo en GitHub y sube estos archivos.
2. En Vercel: **New Project** → importa el repo.
3. En **Storage → Vercel Postgres** crea una DB y copia la `DATABASE_URL`.
4. En **Settings → Environment Variables** agrega:
   - `DATABASE_URL` = (tu URL)
   - `COUNTER_NAME` = `presupuesto`
   - `COUNTER_START` = `1154`
   - `COUNTER_PADDING` = `5`
5. Deploy.

## API
- `POST /api/presupuestos/new` → crea y devuelve un número consecutivo.
  ```json
  {
    "ok": true,
    "number": 1154,
    "display": "01154",
    "id": "01154" // alias de display
  }
  ```

## UI
- `/` tiene un botón "Generar presupuesto" que llama al endpoint y muestra el número.

## SQL
La tabla se crea automáticamente si no existe:
```sql
CREATE TABLE IF NOT EXISTS counters (
  name text PRIMARY KEY,
  value integer NOT NULL
);
```

## Dominio
- Agrega `presupuestos.muvexsa.com` en Vercel → Domains.
- En tu DNS, crea un CNAME `presupuestos` → el valor que indique Vercel (generalmente `cname.vercel-dns.com`).

## Siguientes pasos (próxima fase)
- Plantilla DOCX → PDF idéntico al original.
- Guardado en OneDrive via Microsoft Graph.
- Formulario de datos y registro en tabla `quotes`.
