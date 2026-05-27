export default function Card({ title, sub, children, insight, howToRead }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      {title && <h2 className="text-lg font-semibold text-brand-600 mb-1">{title}</h2>}
      {sub && <p className="text-sm text-gray-500 mb-4">{sub}</p>}
      {children}
      {howToRead && (
        <details className="mt-4 group">
          <summary className="cursor-pointer text-sm font-semibold text-brand-500 hover:text-brand-700 select-none flex items-center gap-2">
            <svg className="w-4 h-4 transition-transform group-open:rotate-90" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            Як читати цей графік
          </summary>
          <div className="mt-3 px-4 py-3 bg-gray-50 border-l-4 border-gray-300 rounded text-sm text-gray-700 space-y-2">
            {howToRead}
          </div>
        </details>
      )}
      {insight && (
        <div className="mt-4 px-4 py-3 bg-brand-50 border-l-4 border-brand-500 rounded text-sm text-gray-700">
          <span className="font-semibold text-brand-700 mr-1">💡 Інсайт:</span>
          {insight}
        </div>
      )}
    </div>
  );
}
