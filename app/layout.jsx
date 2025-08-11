export const metadata = { title: "Muvex Presupuestos", description: "Generación de presupuestos" };
export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial" }}>
        <div style={{ maxWidth: 980, margin: "24px auto", padding: 16 }}>{children}</div>
      </body>
    </html>
  );
}
