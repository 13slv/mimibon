import data from "@/data/sales.json";
import { ProfitabilityDashboard } from "@/components/Profitability";

export default function CustomersPage() {
  return (
    <div className="space-y-4">
      <div className="bg-brand-50 border-l-4 border-brand-500 rounded p-4 text-sm text-gray-700">
        <div className="font-semibold text-brand-700 mb-1">Поріг прибутковості клієнта = 150 кг сировини/міс</div>
        <div>Нижче цього порогу клієнт стає економічно невигідним. На цій сторінці видно, хто де знаходиться зараз,
        куди веде сценарій, і що робити з кожним.</div>
      </div>

      <details className="bg-white rounded-xl p-5 shadow-sm" open>
        <summary className="cursor-pointer text-sm font-semibold text-brand-600 select-none">
          🧭 Як працювати з цією сторінкою (розгорнути / згорнути)
        </summary>
        <div className="mt-4 text-sm text-gray-700 space-y-3">
          <div>
            <b>1. Постав сценарій (зверху, 3 ползунки):</b>
            <ul className="list-disc pl-6 mt-1 space-y-1">
              <li><b>Поріг прибутковості</b> — від якого кг/міс клієнт стає рентабельним.</li>
              <li><b>Зростання заказів</b> — на скільки відсотків середньо виростуть продажі клієнта (від -50% до +100%).</li>
              <li><b>Покращення retention</b> — якщо плануєш активно повертати тих, хто заказує рідко.</li>
            </ul>
          </div>
          <div>
            <b>2. Подивись KPI-картки:</b> скільки клієнтів зелених/жовтих/червоних, сумарний gap у кг.
          </div>
          <div>
            <b>3. Натисни групу дій</b> (Cross-sell, Реактивація, Частота, Укрупнити партії, Контакт, Новий) — фільтруєш таблицю по типу проблеми.
          </div>
          <div>
            <b>4. У таблиці</b> кожен клієнт має:
            <ul className="list-disc pl-6 mt-1 space-y-1">
              <li><b>Статус</b> (зелений/жовтий/червоний) — рентабельність зараз із урахуванням сценарію.</li>
              <li><b>Категорія дії</b> — що саме робити з клієнтом.</li>
              <li><b>Текст дії</b> — конкретна тактика.</li>
              <li><b>🎯 Цільова метрика</b> — куди вивести клієнта, щоб став прибутковим.</li>
            </ul>
          </div>
          <div className="text-amber-700 bg-amber-50 px-3 py-2 rounded">
            <b>Підказка:</b> для тижневої роботи sales команди — сортуй за "пріоритетом дії". Червоні з категорією "Реактивація" — це найшвидші втрати, до них звертайся першими.
          </div>
        </div>
      </details>

      <ProfitabilityDashboard customers={data.customers} />
    </div>
  );
}
