export default function HomePage() {
  return (
    <main className="space-y-4">
      <h1 className="text-3xl font-semibold">UGC Campaign</h1>
      <p className="text-slate-700">
        Starter skeleton. Add pages under <code className="font-mono">/creator</code> and{' '}
        <code className="font-mono">/admin</code>.
      </p>
      <ul className="list-disc pl-6 text-slate-700">
        <li>/creator/dashboard</li>
        <li>/creator/links</li>
        <li>/creator/rewards</li>
        <li>/admin/dashboard</li>
        <li>/admin/analytics</li>
      </ul>
    </main>
  );
}
