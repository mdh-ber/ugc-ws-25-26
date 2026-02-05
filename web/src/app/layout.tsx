import './globals.css';

export const metadata = {
  title: 'UGC Campaign',
  description: 'UGC tracking platform (JamSocial simplified)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900">
        <div className="mx-auto max-w-6xl p-6">{children}</div>
      </body>
    </html>
  );
}
