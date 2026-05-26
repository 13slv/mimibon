export default function Card({ title, sub, children, insight }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      {title && <h2 className="text-lg font-semibold text-brand-600 mb-1">{title}</h2>}
      {sub && <p className="text-sm text-gray-500 mb-4">{sub}</p>}
      {children}
      {insight && (
        <div className="mt-4 px-4 py-3 bg-brand-50 border-l-4 border-brand-500 rounded text-sm text-gray-700">
          {insight}
        </div>
      )}
    </div>
  );
}
