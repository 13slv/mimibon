"use client";
import { useMemo, useState } from "react";
import Link from "next/link";

const fmt = n => (typeof n === "number" ? n.toLocaleString("uk-UA", { maximumFractionDigits: 1 }) : n);

function getRecommendation(c, projected, threshold) {
  if (projected >= threshold) {
    const surplus = projected - threshold;
    return {
      category: "Прибутковий",
      action: surplus > 100 ? "VIP — пильнувати, утримувати" : "OK — підтримувати, не втратити",
      priority: 4,
      targetMetric: null
    };
  }
  const gap = threshold - projected;
  if (c.weeksObserved <= 1) {
    return {
      category: "Новий",
      action: `Спостерігати ще 3-4 тижні. Перший заказ ${fmt(c.totalKg)} кг — це ${c.totalKg >= 60 ? "хороший старт" : "слабкий старт"}.`,
      priority: 3,
      targetMetric: `Через 4 тижні: ${threshold} кг/міс`
    };
  }
  if (c.weeksSinceLast >= 2) {
    return {
      category: "Реактивація",
      action: `Не замовляв ${c.weeksSinceLast} тижні. Дзвінок + промо. Останній заказ був ${c.lastDate}.`,
      priority: 1,
      targetMetric: `Перевести в активного: 1 заказ/тиждень × ${Math.ceil(threshold/4.33)} кг`
    };
  }
  if (c.flavorsCount === 1) {
    const potentialDouble = c.totalKg / c.weeksObserved * 4.33 * 1.8;
    return {
      category: "Cross-sell",
      action: `Купує тільки "${c.flavors[0]}". Запропонувати другий аромат → потенційно ${fmt(potentialDouble)} кг/міс.`,
      priority: 2,
      targetMetric: `${threshold} кг/міс через додавання 2-го SKU`
    };
  }
  if (c.avgKgOrder < 30) {
    const targetAvgOrder = Math.ceil(threshold / 4.33);
    return {
      category: "Укрупнити партії",
      action: `Дрібні заказы (${fmt(c.avgKgOrder)} кг сер.). Запропонувати знижку за обʼєм від ${targetAvgOrder} кг.`,
      priority: 2,
      targetMetric: `Середній заказ ≥${targetAvgOrder} кг`
    };
  }
  if (c.ordersCount <= 2 && c.weeksObserved >= 3) {
    const neededOrders = Math.ceil(threshold / c.avgKgOrder);
    return {
      category: "Частота",
      action: `Замовляє рідко (${c.ordersCount} разів за ${c.weeksObserved} тиж.). Підняти до 1 разу/тиждень.`,
      priority: 2,
      targetMetric: `${neededOrders} заказів/міс × ${fmt(c.avgKgOrder)} кг`
    };
  }
  return {
    category: "Контакт",
    action: `Не вистачає ${fmt(gap)} кг/міс. Зустрітися, оцінити потенціал точки. Або розвиток, або вихід.`,
    priority: 1,
    targetMetric: `+${fmt(gap)} кг/міс до 150`
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

export function ProfitabilityDashboard({ customers, points }) {
  const [mode, setMode] = useState("points"); // "points" or "customers"
  const [threshold, setThreshold] = useState(150);
  const [growthPct, setGrowthPct] = useState(0);
  const [retentionBoost, setRetentionBoost] = useState(0);
  const [filter, setFilter] = useState("all");
  const [filterCategory, setFilterCategory] = useState(null);
  const [sortBy, setSortBy] = useState("projected_desc");

  const source = mode === "points" ? points : customers;
  const entityLabel = mode === "points" ? "точка" : "клієнт";
  const entityLabelPlural = mode === "points" ? "точок" : "клієнтів";
  const detailUrlBase = mode === "points" ? "/points" : "/customers";

  const enriched = useMemo(() => {
    const growth = 1 + growthPct / 100;
    const retentionMul = 1 + retentionBoost / 100;
    return source.map(c => {
      let projected = c.kgPerMonth * growth;
      if (c.ordersCount < c.weeksObserved) {
        projected *= retentionMul;
      }
      const reco = getRecommendation(c, projected, threshold);
      return {
        ...c,
        projectedKgMonth: Math.round(projected * 10) / 10,
        gap: Math.round((threshold - projected) * 10) / 10,
        status: projected >= threshold ? "profitable" : projected >= threshold * 0.65 ? "borderline" : "unprofitable",
        recommendation: reco,
      };
    });
  }, [source, threshold, growthPct, retentionBoost]);

  const filtered = useMemo(() => {
    let f = enriched;
    if (filter === "profitable") f = f.filter(c => c.status === "profitable");
    if (filter === "borderline") f = f.filter(c => c.status === "borderline");
    if (filter === "unprofitable") f = f.filter(c => c.status === "unprofitable");
    if (filterCategory) f = f.filter(c => c.recommendation.category === filterCategory);
    return f;
  }, [enriched, filter, filterCategory]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sortBy === "projected_desc") arr.sort((a, b) => b.projectedKgMonth - a.projectedKgMonth);
    if (sortBy === "projected_asc")  arr.sort((a, b) => a.projectedKgMonth - b.projectedKgMonth);
    if (sortBy === "gap_desc")       arr.sort((a, b) => b.gap - a.gap);
    if (sortBy === "priority")       arr.sort((a, b) => a.recommendation.priority - b.recommendation.priority);
    if (sortBy === "name")           arr.sort((a, b) => a.name.localeCompare(b.name, "uk"));
    return arr;
  }, [filtered, sortBy]);

  const counts = useMemo(() => ({
    profitable: enriched.filter(c => c.status === "profitable").length,
    borderline: enriched.filter(c => c.status === "borderline").length,
    unprofitable: enriched.filter(c => c.status === "unprofitable").length,
  }), [enriched]);

  const categoryCounts = useMemo(() => {
    const cnt = {};
    enriched.forEach(c => {
      if (c.status === "profitable") return;
      cnt[c.recommendation.category] = (cnt[c.recommendation.category] || 0) + 1;
    });
    return cnt;
  }, [enriched]);

  const totalGapKg = useMemo(() => {
    return enriched.filter(c => c.status !== "profitable").reduce((sum, c) => sum + Math.max(0, c.gap), 0);
  }, [enriched]);

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 flex-wrap">
        <span className="text-sm text-gray-500 font-medium">Аналізувати по:</span>
        <div className="inline-flex rounded-md shadow-sm">
          <button onClick={() => setMode("points")}
                  className={`px-4 py-2 text-sm font-semibold rounded-l-md border ${
                    mode === "points" ? "bg-brand-500 text-white border-brand-500" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}>
            Точкам ({points.length})
          </button>
          <button onClick={() => setMode("customers")}
                  className={`px-4 py-2 text-sm font-semibold rounded-r-md border -ml-px ${
                    mode === "customers" ? "bg-brand-500 text-white border-brand-500" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}>
            Клієнтам ({customers.length})
          </button>
        </div>
        <span className="text-xs text-gray-400 ml-auto">
          {mode === "points"
            ? "Кожна адреса — окремий рядок. Краще для операційних рішень (де знизити обʼєм, де додати)."
            : "Один клієнт = один рядок (всі точки сумовані). Краще для рішень про договір/комерцію."}
        </span>
      </div>

      {/* Scenario builder */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-brand-600 mb-2">Сценарій</h2>
        <p className="text-sm text-gray-500 mb-4">Рухай ползунки — таблиця і колірне маркування перерахуються миттєво.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SliderInput label="Поріг прибутковості" value={threshold} min={50} max={300} step={10} onChange={setThreshold} suffix=" кг/міс" />
          <SliderInput label="Зростання заказів" value={growthPct} min={-50} max={100} step={5} onChange={setGrowthPct} suffix="%" />
          <SliderInput label="Покращення retention" value={retentionBoost} min={0} max={50} step={5} onChange={setRetentionBoost} suffix="%" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatusCard label="Прибуткові" count={counts.profitable} total={enriched.length} color="green" entityLabelPlural={entityLabelPlural} />
        <StatusCard label="Граничні" count={counts.borderline} total={enriched.length} color="amber" entityLabelPlural={entityLabelPlural} />
        <StatusCard label="Збиткові" count={counts.unprofitable} total={enriched.length} color="red" entityLabelPlural={entityLabelPlural} />
        <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-brand-500">
          <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">Сумарний gap</div>
          <div className="text-2xl font-bold text-brand-600">{fmt(totalGapKg)}</div>
          <div className="text-xs text-gray-400 mt-1">кг/міс не вистачає сумарно</div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-brand-600 mb-1">Пріоритетні дії — групи</h2>
        <p className="text-sm text-gray-500 mb-4">Клікни на групу — таблиця фільтрується.</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setFilter("all"); setFilterCategory(null); }}
                  className={`px-3 py-2 rounded-md text-sm font-medium border ${
                    filter === "all" && !filterCategory
                      ? "bg-brand-600 text-white border-brand-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}>
            Всі ({enriched.length})
          </button>
          {Object.entries(categoryCounts).map(([cat, count]) => {
            const isActive = filterCategory === cat;
            return (
              <button key={cat} onClick={() => { setFilterCategory(isActive ? null : cat); setFilter("all"); }}
                      className={`px-3 py-2 rounded-md text-sm font-medium border ${
                        isActive
                          ? "bg-brand-600 text-white border-brand-600"
                          : CATEGORY_COLOR[cat] || "bg-white border-gray-300"
                      }`}>
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm flex flex-wrap gap-3 items-center text-sm">
        <span className="text-gray-500 font-medium">Сортування:</span>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1.5">
          <option value="projected_desc">Прогноз кг/міс ↓</option>
          <option value="projected_asc">Прогноз кг/міс ↑</option>
          <option value="gap_desc">Найбільший gap</option>
          <option value="priority">За пріоритетом дії</option>
          <option value="name">За назвою</option>
        </select>
        <span className="text-gray-500 font-medium ml-4">Статус:</span>
        <select value={filter} onChange={e => setFilter(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1.5">
          <option value="all">Всі</option>
          <option value="profitable">Тільки прибуткові</option>
          <option value="borderline">Тільки граничні</option>
          <option value="unprofitable">Тільки збиткові</option>
        </select>
        <span className="text-gray-500 ml-auto">Показано: <b>{sorted.length}</b> з {enriched.length} {entityLabelPlural}</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="text-sm w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-semibold text-gray-700">{mode === "points" ? "Точка (адреса)" : "Клієнт"}</th>
                {mode === "points" && <th className="text-left p-3 font-semibold text-gray-700">Клієнт</th>}
                <th className="text-left p-3 font-semibold text-gray-700">Місто</th>
                <th className="text-right p-3 font-semibold text-gray-700">Спост. кг/міс</th>
                <th className="text-right p-3 font-semibold text-gray-700">Прогноз кг/міс</th>
                <th className="text-right p-3 font-semibold text-gray-700">Gap до {threshold}</th>
                <th className="text-center p-3 font-semibold text-gray-700">Статус</th>
                <th className="text-left p-3 font-semibold text-gray-700">Дія</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(c => <EntityRow key={c.slug} item={c} mode={mode} detailUrlBase={detailUrlBase} threshold={threshold} />)}
            </tbody>
          </table>
        </div>
        {sorted.length === 0 && (
          <div className="text-center text-gray-500 py-12">Немає у цьому фільтрі.</div>
        )}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm text-sm text-gray-700 space-y-3">
        <h3 className="text-lg font-semibold text-brand-600">Як рахується</h3>
        <div><b>Спостережене кг/міс</b> = (загальні кг {entityLabel}а) / (тижнів від першого заказу) × 4,33</div>
        <div><b>Прогноз</b> = спостережене × (1 + зростання%). Для тих із низькою частотою додається retention-бонус.</div>
        <div><b>Чому варто дивитись і по точках, і по клієнтах:</b></div>
        <ul className="list-disc pl-6 space-y-1">
          <li><b>По точках</b> — операційні рішення: "ця точка не тягне, закрити доставку" або "тут потенціал, додати точку поруч".</li>
          <li><b>По клієнтах</b> — комерційні рішення: "цей клієнт є важливим в цілому, навіть якщо деякі його точки слабкі".</li>
        </ul>
      </div>
    </div>
  );
}

function EntityRow({ item, mode, detailUrlBase, threshold }) {
  const c = item;
  const statusColor = c.status === "profitable" ? "bg-green-100 text-green-800"
                    : c.status === "borderline" ? "bg-amber-100 text-amber-800"
                    : "bg-red-100 text-red-800";
  const statusLabel = c.status === "profitable" ? "Прибутковий"
                    : c.status === "borderline" ? "Граничний" : "Збитковий";
  const catColor = CATEGORY_COLOR[c.recommendation.category] || "bg-gray-100 text-gray-700";
  const displayName = mode === "points" ? (c.address || c.name) : c.name;
  const cityClean = (c.city || "").replace(/^м\.\s|^с\.\s|^смт\s/, '');

  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50">
      <td className="p-3 font-medium text-gray-800 max-w-xs">
        <Link href={`${detailUrlBase}/${c.slug}`} className="text-brand-600 hover:text-brand-700 hover:underline inline-flex items-start gap-1">
          <span>{displayName}</span>
          <svg className="w-3 h-3 opacity-60 mt-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" /></svg>
        </Link>
        <div className="text-xs text-gray-400 mt-0.5">
          {c.weeksObserved}тиж спост., {c.ordersCount} заказів, {c.flavorsCount}/2 ароматів
          {c.weeksSinceLast > 0 && <span className="text-red-500 ml-2">• мовчить {c.weeksSinceLast}тиж</span>}
        </div>
      </td>
      {mode === "points" && (
        <td className="p-3 text-xs text-gray-600">
          {c.parentSlug ? (
            <Link href={`/customers/${c.parentSlug}`} className="text-brand-500 hover:underline">{c.parentCustomer}</Link>
          ) : c.parentCustomer}
        </td>
      )}
      <td className="p-3 text-gray-600 text-xs">{cityClean}</td>
      <td className="p-3 text-right text-gray-600">{fmt(c.kgPerMonth)}</td>
      <td className="p-3 text-right font-semibold">{fmt(c.projectedKgMonth)}</td>
      <td className="p-3 text-right">
        {c.gap > 0
          ? <span className="text-red-600 font-medium">−{fmt(c.gap)}</span>
          : <span className="text-green-600 font-medium">+{fmt(-c.gap)}</span>}
      </td>
      <td className="p-3 text-center">
        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${statusColor}`}>{statusLabel}</span>
      </td>
      <td className="p-3 max-w-md">
        <div className="flex flex-col gap-1">
          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${catColor} w-fit`}>
            {c.recommendation.category}
          </span>
          <span className="text-xs text-gray-700">{c.recommendation.action}</span>
          {c.recommendation.targetMetric && (
            <span className="text-xs text-brand-600 font-medium">🎯 {c.recommendation.targetMetric}</span>
          )}
        </div>
      </td>
    </tr>
  );
}

function SliderInput({ label, value, min, max, step = 1, onChange, suffix = "" }) {
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

function StatusCard({ label, count, total, color, entityLabelPlural }) {
  const colors = {
    green: "border-green-500 text-green-700",
    amber: "border-amber-500 text-amber-700",
    red: "border-red-500 text-red-700",
  };
  const pct = total ? Math.round(count / total * 100) : 0;
  return (
    <div className={`bg-white p-5 rounded-lg shadow-sm border-l-4 ${colors[color]}`}>
      <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">{label}</div>
      <div className="text-2xl font-bold">{count}</div>
      <div className="text-xs text-gray-400 mt-1">{pct}% від бази ({total} {entityLabelPlural})</div>
    </div>
  );
}
