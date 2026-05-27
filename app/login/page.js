export const dynamic = "force-dynamic";

export default function LoginPage({ searchParams }) {
  const error = searchParams?.error === "1";
  const from = searchParams?.from || "/";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-black text-xl shadow">М</div>
          <div>
            <h1 className="text-xl font-bold text-brand-700">MimiBon</h1>
            <p className="text-xs text-gray-500">Аналітика продажів</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">Вхід</h2>
        <p className="text-sm text-gray-500 mb-6">Введіть пароль доступу до демо-дашборду.</p>

        <form method="POST" action="/api/login" className="space-y-4">
          <input type="hidden" name="from" value={from} />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">
              Пароль
            </label>
            <input
              type="password"
              name="password"
              required
              autoFocus
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-base"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-50 border-l-4 border-red-500 text-sm text-red-700 rounded">
              Невірний пароль. Спробуй ще раз.
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold py-3 rounded-md transition shadow-md hover:shadow-lg"
          >
            Увійти
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          Демо-версія • MimiBon Analytics
        </p>
      </div>
    </div>
  );
}
