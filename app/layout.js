import "./globals.css";
import Nav from "@/components/Nav";

export const metadata = {
  title: "Дашборд продажів морозива КСТ",
  description: "Інтерактивний дашборд та прогнози"
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk">
      <body>
        <Nav />
        <main className="max-w-7xl mx-auto p-4 md:p-8">{children}</main>
        <footer className="text-center text-gray-400 text-sm py-6">
          Дашборд згенеровано з вивантаження "Продажі морозива КСТ 07-26.05.xlsx"
        </footer>
      </body>
    </html>
  );
}
