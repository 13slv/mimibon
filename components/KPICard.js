export default function KPICard({ label, value, sub }) {
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-brand-500">
      <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">{label}</div>
      <div className="text-2xl font-bold text-brand-600">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}
