"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer, ComposedChart, LineChart, BarChart, PieChart,
  Bar, Line, Pie, Cell, ReferenceLine,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from "recharts";

const PRIMARY = "#d6006d";
const PRIMARY_DARK = "#942d5c";
const ACCENT = "#f88d2a";
const GREEN = "#16a34a";
const RED = "#dc2626";

const fmt = n => (typeof n === "number" ? n.toLocaleString("uk-UA", { maximumFractionDigits: 1 }) : n);

function getRecommendation(c, projected, threshold) {
  if (projected >= threshold) {
    const surplus = projected - threshold;
    return {
      category: "Прибутковий",
      action: surplus > 100 ? "VIP — пильнувати, утримувати, не дати конкурентам" : "OK — підтримувати, не втратити",
      priority: 4,
      targetMetric: null,
      tactics: surplus > 100
        ? ["Щотижневий контакт", "Запропонувати ексклюзивну ціну/умови", "Особистий менеджер"]
        : ["Контроль раз на 2 тижні", "Слідкувати за частотою заказів", "Тримати запас сировини"]
    };
  }
  const gap = threshold - projected;
  if (c.weeksObserved <= 1) {
    return {
      category: "Новий",
      action: `Перший заказ ${fmt(c.totalKg)} кг — ${c.totalKg >= 60 ? "хороший старт" : "слабкий старт"}. Спостерігати.`,
      priority: 3,
      targetMetric: `Через 4 тижні: ${threshold} кг/міс`,
      tactics: ["Дзвінок через 7-10 днів після першого заказу", "Спитати чи все добре з якістю", "Підтвердити готовність до 2-го заказу"]
    };
  }
  if (c.weeksSinceLast >= 2) {
    return {
      category: "Реактивація",
      action: `Не замовляв ${c.weeksSinceLast} тижні. Дзвінок + промо.`,
      priority: 1,
      targetMetric: `1 заказ/тиждень × ${Math.ceil(threshold/4.33)} кг`,
      tactics: ["Дзвінок сьогодні-завтра", "Зрозуміти причину тиші (брак сировини? проблема з продуктом?)", "Запропонувати спецумови для повернення"]
    };
  }
  if (c.flavorsCount === 1) {
    const potentialDouble = c.totalKg / c.weeksObserved * 4.33 * 1.8;
    return {
      category: "Cross-sell",
      action: `Купує тільки "${c.flavors[0]}". Запропонувати другий аромат.`,
      priority: 2,
      targetMetric: `${threshold} кг/міс через додавання 2-го SKU (потенційно ${fmt(potentialDouble)} кг)`,
      tactics: ["Безкоштовний пробник 2-го аромату", "Розповісти про "+ (c.flavors[0]==="Три молока" ? "Крем-пломбір" : "Три молока") +" — більш універсальний", "Пакетна знижка на обидва"]
    };
  }
  if (c.avgKgOrder < 30) {
    const targetAvgOrder = Math.ceil(threshold / 4.33);
    return {
      category: "Укрупнити партії",
      action: `Дрібні заказы (${fmt(c.avgKgOrder)} кг сер.). Запропонувати знижку за обʼєм.`,
      priority: 2,
      targetMetric: `Середній заказ ≥${targetAvgOrder} кг`,
      tactics: [`Знижка 5-10% від ${targetAvgOrder} кг`, "Безкоштовна доставка від певного порогу", "Морозильна камера в оренду для більшого запасу"]
    };
  }
  if (c.ordersCount <= 2 && c.weeksObserved >= 3) {
    const neededOrders = Math.ceil(threshold / c.avgKgOrder);
    return {
      category: "Частота",
      action: `Замовляє рідко (${c.ordersCount} разів за ${c.weeksObserved} тиж.). Підняти частоту.`,
      priority: 2,
      targetMetric: `${neededOrders} заказів/міс × ${fmt(c.avgKgOrder)} кг`,
      tactics: ["Регулярна доставка по графіку", "Нагадування за день до можливого заказу", "Меньший заказ — частіше"]
    };
  }
  return {
    category: "Контакт",
    action: `Не вистачає ${fmt(gap)} кг/міс. Зустрітися, оцінити потенціал точки.`,
    priority: 1,
    targetMetric: `+${fmt(gap)} кг/міс до ${threshold}`,
    tactics: ["Особистий візит на точку", "Оцінити продажі їхнього морозива (попит)", "Якщо немає попиту — відверта розмова про вихід"]
  };
}

const CATEGORY_COLOR = {
  "Прибутковий": "bg-green-100 text-green-800 border-green-300",
  "Cross-sell": "bg-blue-100 text-blue-800 border-blue-300",
  "Реактивація": "bg-red-100 text-red-800 border-red-300",
  "Частота": "bg-amber-100 text-amber-800 border-amber-300",
  "Укрупнити партії": "bg-purple-100 text-purple-800 border-purple-300",
  "Контакт": "bg-rose-100 text-rose-800 border-rose-300",
  "Новий": "bg-gray-100 text-gray-700 border-gray-300",
};

export default function CustomerDetail({ customer, benchmarks, weekly, weeklyForecastTemp }) {
  const [threshold, setThreshold] = useState(benchmarks.profitabilityThreshold || 150);
  const [growthPct, setGrowthPct] = useState(0);
  const [horizon, setHorizon] = useState(12);
  const [tactic, setTactic] = useState("steady"); // steady / addFlavor / boostFreq / bigOrder

  // Tactic multipliers
  const tacticMul = {
    steady: 1.0,
    addFlavor: customer.flavorsCount === 1 ? 1.7 : 1.0,
    boostFreq: 1.5,
    bigOrder: 1.4,
  }[tactic];

  const baseWeeklyRate = customer.kgPerMonth / 4.33;
  const adjustedWeeklyRate = baseWeeklyRate * (1 + growthPct/100) * tacticMul;
  const projectedKgMonth = adjustedWeeklyRate * 4.33;

  // Projection chart data
  const projection = useMemo(() => {
    const historyWeeks = weekly.labels.map((label, i) => ({
      period: label,
      "Факт": customer.weeklyKg[i] ?? null,
      "Прогноз": null,
    }));
    const lastHistKg = customer.weeklyKg[customer.weeklyKg.length - 1] || 0;
    const lastIdx = historyWeeks.length - 1;
    historyWeeks[lastIdx]["Прогноз"] = lastHistKg;
    const future = [];
    for (let i = 1; i <= horizon; i++) {
      future.push({
        period: `W+${i}`,
        "Факт": null,
        "Прогноз": Math.round(adjustedWeeklyRate * 10) / 10,
      });
    }
    return [...historyWeeks, ...future];
  }, [customer, weekly, adjustedWeeklyRate, horizon]);

  const weeklyThreshold = threshold / 4.33;
  const recommendation = getRecommendation(customer, projectedKgMonth, threshold);
  const gap = threshold - projectedKgMonth;
  const status = projectedKgMonth >= threshold ? "profitable"
              : projectedKgMonth >= threshold * 0.65 ? "borderline" : "unprofitable";

  const statusBg = status === "profitable" ? "bg-green-50 border-green-500 text-green-800"
                 : status === "borderline" ? "bg-amber-50 border-amber-500 text-amber-800"
                 : "bg-red-50 border-red-500 text-red-800";
  const statusLabel = status === "profitable" ? "Прибутковий" : status === "borderline" ? "Граничний" : "Збитковий";

  // Flavor pie data
  const flavorData = Object.entries(customer.flavorsKg).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <Link href="/customers" className="text-sm text-brand-600 hover:text-brand-700 mb-3 inline-flex items-center gap-1">
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
          До списку клієнтів
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-700">{customer.name}</h1>
            <div className="text-sm text-gray-500 mt-1">
              {customer.city} • Перший заказ: {customer.firstDate} ({customer.firstWeek}) • {customer.weeksObserved} тижнів спостереження
            </div>
            {customer.weeksSinceLast > 0 && (
              <div className="text-sm text-red-600 mt-1">⚠ Не замовляв {customer.weeksSinceLast} тижні</div>
            )}
          </div>
          <div className={`px-4 py-2 rounded-lg border-2 font-semibold ${statusBg}`}>
            {statusLabel}
          </div>
        </div>
      </div>

      {/* Snapshot KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Всього кг за період" value={fmt(customer.totalKg)} sub="кг сировини" />
        <StatCard label="Темп — кг/місяць" value={fmt(customer.kgPerMonth)} sub={`vs ${benchmarks.avgKgPerMonth} в середньому`} />
        <StatCard label="Заказів" value={customer.ordersCount} sub={`сер. ${fmt(customer.avgKgOrder)} кг/заказ`} />
        <StatCard label="Точок" value={customer.points.length} sub={`${customer.flavorsCount}/2 ароматів`} />
      </div>

      {/* Scenario controls */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-brand-600 mb-2">Сценарій для цього клієнта</h2>
        <p className="text-sm text-gray-500 mb-4">Зміни ползунки або тактику — графік прогнозу і статус перерахуються.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Slider label="Поріг прибутковості" value={threshold} min={50} max={300} step={10} onChange={setThreshold} suffix=" кг/міс" />
          <Slider label="Загальне зростання" value={growthPct} min={-50} max={150} step={5} onChange={setGrowthPct} suffix="%" />
          <Slider label="Горизонт" value={horizon} min={4} max={26} onChange={setHorizon} suffix=" тижнів" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2 block">Тактика розвитку</label>
          <div className="flex flex-wrap gap-2">
            <TacticBtn active={tactic === "steady"} onClick={() => setTactic("steady")}>Без змін (×1.0)</TacticBtn>
            <TacticBtn active={tactic === "addFlavor"} onClick={() => setTactic("addFlavor")} disabled={customer.flavorsCount === 2}>
              Cross-sell 2-го аромату {customer.flavorsCount === 2 ? "(вже куплено)" : "(×1.7)"}
            </TacticBtn>
            <TacticBtn active={tactic === "boostFreq"} onClick={() => setTactic("boostFreq")}>Підвищити частоту (×1.5)</TacticBtn>
            <TacticBtn active={tactic === "bigOrder"} onClick={() => setTactic("bigOrder")}>Укрупнити партії (×1.4)</TacticBtn>
          </div>
        </div>
      </div>

      {/* Projection chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-brand-600 mb-1">Прогноз кг на тиждень</h2>
        <p className="text-sm text-gray-500 mb-4">
          Червона лінія — поріг прибутковості ({fmt(weeklyThreshold)} кг/тиждень, що дорівнює {threshold} кг/міс).
          Якщо прогноз нижче — клієнт у мінусі.
        </p>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={projection}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="period" />
            <YAxis tickFormatter={fmt} label={{ value: "кг/тиждень", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "#525252" } }} />
            <Tooltip formatter={v => v != null ? fmt(v) + " кг" : "—"} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine y={weeklyThreshold} stroke={RED} strokeDasharray="6 3" label={{ value: `Поріг ${fmt(weeklyThreshold)} кг/тижд`, position: "right", fill: RED, fontSize: 11 }} />
            <Line dataKey="Факт" stroke={PRIMARY} strokeWidth={3} dot={{ r: 5 }} connectNulls />
            <Line dataKey="Прогноз" stroke={ACCENT} strokeWidth={2.5} strokeDasharray="6 4" dot={{ r: 4 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <ProjStat label="Темп зараз" value={fmt(customer.kgPerMonth) + " кг/міс"} />
          <ProjStat label="Прогноз" value={fmt(projectedKgMonth) + " кг/міс"} highlight />
          <ProjStat label={gap > 0 ? "Не вистачає" : "Перевищення"} value={gap > 0 ? fmt(gap) + " кг" : "+" + fmt(-gap) + " кг"} color={gap > 0 ? "red" : "green"} />
          <ProjStat label="Статус після сценарію" value={statusLabel} color={status === "profitable" ? "green" : status === "borderline" ? "amber" : "red"} />
        </div>
      </div>

      {/* Recommendation card */}
      <div className={`rounded-xl p-6 shadow-sm border-l-4 ${
        status === "profitable" ? "bg-green-50 border-green-500"
        : status === "borderline" ? "bg-amber-50 border-amber-500"
        : "bg-red-50 border-red-500"
      }`}>
        <div className="flex items-start gap-3 mb-3">
          <span className={`inline-block px-3 py-1 rounded text-sm font-semibold border ${CATEGORY_COLOR[recommendation.category] || "bg-gray-100 text-gray-700"}`}>
            {recommendation.category}
          </span>
          {recommendation.targetMetric && (
            <span className="text-sm font-medium text-brand-700">🎯 {recommendation.targetMetric}</span>
          )}
        </div>
        <div className="text-base font-medium text-gray-800 mb-3">{recommendation.action}</div>
        <div className="text-sm">
          <div className="font-semibold text-gray-700 mb-1">Конкретні тактики:</div>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            {recommendation.tactics.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
      </div>

      {/* Orders + flavors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-brand-600 mb-1">Аромати — розподіл кг</h2>
          <p className="text-sm text-gray-500 mb-4">Що саме купує цей клієнт.</p>
          {flavorData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={flavorData} dataKey="value" nameKey="name" outerRadius={90} innerRadius={50}
                     label={d => `${d.name}: ${fmt(d.value)} кг`}>
                  {flavorData.map((_, i) => <Cell key={i} fill={i === 0 ? PRIMARY : ACCENT} />)}
                </Pie>
                <Tooltip formatter={v => fmt(v) + " кг"} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="text-center text-gray-400 py-12">Немає даних</div>}
          {customer.flavorsCount === 1 && (
            <div className="mt-3 px-3 py-2 bg-blue-50 border-l-4 border-blue-400 rounded text-sm text-blue-800">
              💡 <b>Можливість cross-sell:</b> клієнт бере тільки {customer.flavors[0]}. Спробуйте продати другий аромат.
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-brand-600 mb-1">Точки доставки</h2>
          <p className="text-sm text-gray-500 mb-4">Адреси, куди їде сировина для цього клієнта.</p>
          <ul className="space-y-2">
            {customer.points.map((p, i) => (
              <li key={i} className="flex items-start justify-between gap-3 text-sm border-b border-gray-100 pb-2 last:border-0">
                <span className="text-gray-700">{p.address}</span>
                <span className="font-semibold text-brand-600 whitespace-nowrap">{fmt(p.kg)} кг</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-brand-600 mb-1">Історія заказів</h2>
        <p className="text-sm text-gray-500 mb-4">Усі заказы цього клієнта в порядку дати.</p>
        <div className="overflow-x-auto">
          <table className="text-sm w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left p-2 font-semibold text-gray-700">Дата</th>
                <th className="text-left p-2 font-semibold text-gray-700">Тиждень</th>
                <th className="text-left p-2 font-semibold text-gray-700">Адреса</th>
                <th className="text-right p-2 font-semibold text-gray-700">Крем-пломбір</th>
                <th className="text-right p-2 font-semibold text-gray-700">Три молока</th>
                <th className="text-right p-2 font-semibold text-gray-700">Всього</th>
              </tr>
            </thead>
            <tbody>
              {customer.orders.map((o, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="p-2 font-medium">{o.dateLabel}</td>
                  <td className="p-2 text-xs text-gray-500">{o.week}</td>
                  <td className="p-2 text-xs text-gray-600">{o.address || "—"}</td>
                  <td className="p-2 text-right">{o.byFlavor["Крем-пломбір"] ? fmt(o.byFlavor["Крем-пломбір"]) : "—"}</td>
                  <td className="p-2 text-right">{o.byFlavor["Три молока"] ? fmt(o.byFlavor["Три молока"]) : "—"}</td>
                  <td className="p-2 text-right font-bold text-brand-600">{fmt(o.totalKg)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-gray-200">
              <tr>
                <td colSpan={3} className="p-2 font-semibold text-gray-700">Всього</td>
                <td className="p-2 text-right font-semibold">{fmt(customer.flavorsKg["Крем-пломбір"] || 0)} кг</td>
                <td className="p-2 text-right font-semibold">{fmt(customer.flavorsKg["Три молока"] || 0)} кг</td>
                <td className="p-2 text-right font-bold text-brand-600">{fmt(customer.totalKg)} кг</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Benchmark comparison */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-brand-600 mb-1">Порівняння з базою (47 клієнтів)</h2>
        <p className="text-sm text-gray-500 mb-4">Як цей клієнт виглядає на тлі інших.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <BenchRow label="кг/міс" value={customer.kgPerMonth} avg={benchmarks.avgKgPerMonth} median={benchmarks.medianKgPerMonth} />
          <BenchRow label="кг/заказ" value={customer.avgKgOrder} avg={benchmarks.avgAvgKgOrder} />
          <BenchRow label="заказів за період" value={customer.ordersCount} avg={benchmarks.avgOrdersCount} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-brand-500">
      <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">{label}</div>
      <div className="text-2xl font-bold text-brand-600">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

function ProjStat({ label, value, highlight, color }) {
  const colorClass = color === "green" ? "text-green-700 bg-green-50"
                  : color === "red" ? "text-red-700 bg-red-50"
                  : color === "amber" ? "text-amber-700 bg-amber-50"
                  : highlight ? "text-brand-700 bg-brand-50" : "text-gray-700 bg-gray-50";
  return (
    <div className={`p-3 rounded ${colorClass}`}>
      <div className="text-xs uppercase tracking-wide font-semibold opacity-75 mb-1">{label}</div>
      <div className="text-base font-bold">{value}</div>
    </div>
  );
}

function BenchRow({ label, value, avg, median }) {
  const diff = ((value - avg) / Math.max(avg, 0.1) * 100);
  const better = diff > 0;
  return (
    <div className="bg-gray-50 rounded p-3">
      <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">{label}</div>
      <div className="text-xl font-bold text-brand-600">{fmt(value)}</div>
      <div className="text-xs mt-1">
        <span className="text-gray-500">сер. {fmt(avg)}{median !== undefined ? `, мед. ${fmt(median)}` : ""}</span>
        <span className={`ml-2 font-medium ${better ? "text-green-600" : "text-red-600"}`}>
          {better ? "+" : ""}{diff.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, onChange, suffix = "", step = 1 }) {
  return (
    <div className="bg-brand-50 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs uppercase tracking-wide text-gray-500 font-semibold">{label}</label>
        <input type="number" value={value} min={min} max={max} step={step}
               onChange={e => onChange(parseFloat(e.target.value) || 0)}
               className="w-20 text-right text-sm font-bold text-brand-600 bg-white border border-gray-300 rounded px-2 py-1" />
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
             onChange={e => onChange(parseFloat(e.target.value))}
             className="w-full accent-brand-500" />
      <div className="text-xs text-gray-400 mt-1">{min}{suffix} — {max}{suffix}</div>
    </div>
  );
}

function TacticBtn({ active, onClick, children, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
            className={`px-3 py-2 rounded-md text-sm font-medium border transition ${
              disabled ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              : active ? "bg-brand-500 text-white border-brand-500"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}>
      {children}
    </button>
  );
}
