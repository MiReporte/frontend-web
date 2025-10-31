import "@/app/globals.css";
import { AuthProvider } from "@/lib/authContext";

export const metadata = {
  title: "Panel de Roles",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
