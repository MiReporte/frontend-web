import "@/app/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import BootstrapClient from "@/components/BootstrapClient";
import { AuthProvider } from "@/lib/authContext";
import { NotificationsProvider } from "@/lib/notificationsContext";

export const metadata = {
  title: "Administración MiReporte",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="overflow-hidden">
        <AuthProvider>
          <NotificationsProvider>
            <div className="d-flex min-vh-100 flex-column flex-md-row overflow-hidden">
              {children}
            </div>
          </NotificationsProvider>
        </AuthProvider>
        <BootstrapClient />
      </body>
    </html>
  );
}
