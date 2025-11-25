import "@/app/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import BootstrapClient from "@/components/BootstrapClient";
import { AuthProvider } from "@/lib/authContext";

export const metadata = {
  title: "Administración MiReporte",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="overflow-hidden">
        <AuthProvider>
          <div className="d-flex min-vh-100 flex-column flex-md-row overflow-hidden">
            {children}
          </div>
        </AuthProvider>
        <BootstrapClient />
      </body>
    </html>
  );
}
