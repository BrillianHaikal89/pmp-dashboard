// app/layout.tsx — ganti layout utama dengan ini selama maintenance
import type { Metadata } from "next";
import MaintenancePage from "./page"; // import komponen halaman maintenance

export const metadata: Metadata = {
  title: "Maintenance — Dashboard PMP Jawa Barat",
  description: "Sistem sedang dalam pemeliharaan",
};

const MAINTENANCE_MODE = true;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  if (MAINTENANCE_MODE) {
    // Render halaman maintenance untuk SEMUA route, tanpa exception
    return (
      <html lang="id">
        <body>
          <MaintenancePage />
        </body>
      </html>
    );
  }

  // Normal layout (aktifkan kembali saat maintenance selesai)
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}