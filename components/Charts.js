"use client";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, ResponsiveContainer, LineChart, Line,
  ComposedChart, Area
} from "recharts";

// MimiBon palette
const PALETTE = ["#d6006d", "#f97fb5", "#942d5c", "#f88d2a", "#ffc493", "#fed9ea"];
const PRIMARY = "#d6006d";
const PRIMARY_DARK = "#942d5c";
const ACCENT = "#f88d2a";
const ACCENT_LIGHT = "#ffc493";
const GREEN = "#16a34a";
const RED = "#dc2626";

const fmt = n => (typeof n === "number" ? n.toLocaleString("uk-UA", { maximumFractionDigits: 1 }) : n);

// ---------- Pie (flavor split) ----------
export function ProductPie({ labels, values }) {
  const data = labels.map((l, i) => ({ name: l, value: values[i] }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" outerRadius={100} innerRadius={50}
             label={d => `${d.name}: ${fmt(d.value)} кг`}>
          {data.map((_, i) => <Cell key={i} fill={i === 0 ? PRIMARY : ACCENT} />)}
        </Pie>
        <Tooltip formatter={v => fmt(v) + " кг"} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ---------- Weekday Bar (kg) ----------
export function WeekdayBar({ labels, values }) {
  const data = labels.map((l, i) => ({
    day: l, value: values[i],
    fill: i === 5 ? ACCENT : values[i] === 0 ? "#E5E7EB" : PRIMARY
  }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="day" />
        <YAxis tickFormatter={fmt} />
        <Tooltip formatter={v => fmt(v) + " кг"} />
        <Bar dataKey="value">
          {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ---------- Weekly Combo ----------
export function WeeklyCombo({ labels, kg, customers, newCustomers }) {
  const data = labels.map((l, i) => ({
    week: l, kg: kg[i], customers: customers[i], newCustomers: newCustomers[i]
  }));
  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="week" />
        <YAxis yAxisId="left" tickFormatter={fmt} label={{ value: "кг сировини", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "#525252" } }} />
        <YAxis yAxisId="right" orientation="right" tickFormatter={fmt} label={{ value: "клієнтів", angle: 90, position: "insideRight", style: { fontSize: 11, fill: "#525252" } }} />
        <Tooltip formatter={(v, name) => [name === "Сировина (кг)" ? fmt(v) + " кг" : v, name]} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar yAxisId="left" dataKey="kg" name="Сировина (кг)" fill={PRIMARY} />
        <Line yAxisId="right" type="monotone" dataKey="customers" name="Активних клієнтів" stroke={ACCENT} strokeWidth={2.5} dot={{ r: 4 }} />
        <Line yAxisId="right" type="monotone" dataKey="newCustomers" name="Нових клієнтів" stroke={GREEN} strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 4 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ---------- Horizontal Bar ----------
export function HorizontalBar({ labels, values, color = PRIMARY, height = 400, unit = "кг" }) {
  const data = labels.map((l, i) => ({ name: l, value: values[i] }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis type="number" tickFormatter={fmt} />
        <YAxis type="category" dataKey="name" width={170} />
        <Tooltip formatter={v => fmt(v) + " " + unit} />
        <Bar dataKey="value" fill={color} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ---------- Cohort Grouped Bar ----------
export function CohortBars({ chartData }) {
  const COHORT_COLORS = [PRIMARY, "#f97fb5", "#f3b2d4"];
  const flatData = chartData.labels.map((label, i) => {
    const row = { period: label };
    chartData.datasets.forEach(ds => { row[ds.label] = ds.data[i] ?? 0; });
    return row;
  });
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={flatData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="period" />
        <YAxis tickFormatter={fmt} label={{ value: "кг сировини", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "#525252" } }} />
        <Tooltip formatter={v => fmt(v) + " кг"} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {chartData.datasets.map((ds, i) => (
          <Bar key={ds.label} dataKey={ds.label} fill={COHORT_COLORS[i % COHORT_COLORS.length]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

// ---------- Multi-Line ----------
export function MultiLine({ chartData, yLabel, yFormatter = fmt, domain }) {
  const COHORT_COLORS = [PRIMARY, "#f97fb5", "#f3b2d4"];
  const flatData = chartData.labels.map((label, i) => {
    const row = { period: label };
    chartData.datasets.forEach(ds => { row[ds.label] = ds.data[i] ?? null; });
    return row;
  });
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={flatData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="period" />
        <YAxis domain={domain} tickFormatter={yFormatter} label={yLabel ? { value: yLabel, angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "#525252" } } : undefined} />
        <Tooltip formatter={yFormatter} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {chartData.datasets.map((ds, i) => (
          <Line key={ds.label} type="monotone" dataKey={ds.label}
                stroke={COHORT_COLORS[i % COHORT_COLORS.length]} strokeWidth={2.5}
                dot={{ r: 4 }} connectNulls />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// ---------- Retention Dual ----------
export function RetentionDual({ retentionData, avgKgData }) {
  const COHORT_COLORS = [PRIMARY, "#f97fb5", "#f3b2d4"];
  const data = retentionData.labels.map((label, i) => {
    const row = { period: label };
    retentionData.datasets.forEach(ds => { row[`ret_${ds.label}`] = ds.data[i] ?? null; });
    avgKgData.datasets.forEach(ds => { row[`kg_${ds.label}`] = ds.data[i] ?? null; });
    return row;
  });
  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="period" />
        <YAxis yAxisId="left" domain={[0, 100]} tickFormatter={v => v + "%"} label={{ value: "Retention %", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "#525252" } }} />
        <YAxis yAxisId="right" orientation="right" tickFormatter={fmt} label={{ value: "кг/активний клієнт", angle: 90, position: "insideRight", style: { fontSize: 11, fill: "#525252" } }} />
        <Tooltip formatter={(v, name) => name.startsWith("ret_") ? [v + "%", name.slice(4)] : [fmt(v) + " кг", name.slice(3)]} />
        <Legend wrapperStyle={{ fontSize: 11 }}
                payload={[
                  ...retentionData.datasets.map((ds, i) => ({ value: `${ds.label} • retention %`, type: "line", color: COHORT_COLORS[i % COHORT_COLORS.length] })),
                  ...avgKgData.datasets.map((ds, i) => ({ value: `${ds.label} • кг/клієнт`, type: "rect", color: COHORT_COLORS[i % COHORT_COLORS.length] + "80" }))
                ]} />
        {avgKgData.datasets.map((ds, i) => (
          <Bar yAxisId="right" key={`bar_${ds.label}`} dataKey={`kg_${ds.label}`} fill={COHORT_COLORS[i % COHORT_COLORS.length] + "55"} />
        ))}
        {retentionData.datasets.map((ds, i) => (
          <Line yAxisId="left" key={`line_${ds.label}`} type="monotone" dataKey={`ret_${ds.label}`}
                stroke={COHORT_COLORS[i % COHORT_COLORS.length]} strokeWidth={2.5} dot={{ r: 5 }} connectNulls />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ---------- Cohort heatmap (MimiBon pink scale) ----------
export function CohortHeatmap({ matrix, metric = "kg" }) {
  const values = matrix[metric === "kg" ? "kg" : metric === "active" ? "active" : "avgKgPerActive"];
  const flat = values.flat().filter(v => v !== null && v !== undefined && v !== 0);
  const max = Math.max(...flat, 1);
  const min = Math.min(...flat, 0);

  const color = (v) => {
    if (v === null || v === undefined) return "#f9fafb";
    if (v === 0) return "#f3f4f6";
    const ratio = (v - min) / (max - min || 1);
    // pink scale: from very light pink to deep MimiBon pink
    const lightness = 95 - ratio * 55;  // 95% → 40%
    return `hsl(327, 100%, ${lightness}%)`;
  };
  const textColor = (v) => {
    if (v === null || v === undefined || v === 0) return "#9ca3af";
    const ratio = (v - min) / (max - min || 1);
    return ratio > 0.5 ? "#fff" : "#262626";
  };
  const label = (v) => {
    if (v === null || v === undefined) return "—";
    if (v === 0) return "0";
    return fmt(v);
  };

  return (
    <div className="overflow-x-auto">
      <table className="text-sm border-collapse w-full">
        <thead>
          <tr>
            <th className="text-left p-2 font-medium text-gray-500 border-b border-gray-200">Когорта (розмір)</th>
            {matrix.periods.map(p => (
              <th key={p} className="text-center p-2 font-medium text-gray-500 border-b border-gray-200">{p}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.cohorts.map((c, i) => (
            <tr key={c}>
              <td className="p-2 font-medium text-gray-700 border-b border-gray-100">
                {c} <span className="text-xs text-gray-400">({matrix.sizes[i]})</span>
              </td>
              {values[i].map((v, j) => (
                <td key={j} className="text-center font-medium border border-white"
                    style={{ background: color(v), color: textColor(v), padding: "10px 8px" }}>
                  {label(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------- Cohort stats table ----------
export function CohortStatsTable({ rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="text-sm w-full">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left p-2 font-semibold text-gray-700">Когорта</th>
            <th className="text-right p-2 font-semibold text-gray-700">Розмір</th>
            <th className="text-right p-2 font-semibold text-gray-700">Тижнів спост.</th>
            <th className="text-right p-2 font-semibold text-gray-700">Перший заказ, кг/клієнт</th>
            <th className="text-right p-2 font-semibold text-gray-700">Retention W+1</th>
            <th className="text-right p-2 font-semibold text-gray-700">Retention W+2</th>
            <th className="text-right p-2 font-semibold text-gray-700">Всього кг</th>
            <th className="text-right p-2 font-semibold text-gray-700">Спостережений LTV (кг/клієнт)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="p-2 font-medium text-brand-600">{r.cohort}</td>
              <td className="p-2 text-right">{r.size}</td>
              <td className="p-2 text-right">{r.weeksObserved}</td>
              <td className="p-2 text-right font-medium">{fmt(r.avgFirstKg)} кг</td>
              <td className="p-2 text-right">{r.retentionW1 !== null ? r.retentionW1 + "%" : "—"}</td>
              <td className="p-2 text-right">{r.retentionW2 !== null ? r.retentionW2 + "%" : "—"}</td>
              <td className="p-2 text-right">{fmt(r.totalKg)} кг</td>
              <td className="p-2 text-right font-bold text-brand-600">{fmt(r.observedLTV)} кг</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------- Reactive bars ----------
export function ReactiveBars({ data, labels, unit = "кг", color = PRIMARY, height = 240 }) {
  const chartData = labels.map((l, i) => ({ name: l, value: data[i] }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={fmt} />
        <Tooltip formatter={v => fmt(v) + " " + unit} />
        <Bar dataKey="value" fill={color} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ---------- Forecast chart ----------
export function ForecastChart({ history, forecast, ciLow, ciHigh, labels, forecastStartIdx, yLabel = "кг" }) {
  const data = labels.map((label, i) => ({
    period: label,
    history: i <= forecastStartIdx ? history[i] : null,
    forecast: i >= forecastStartIdx ? forecast[i] : null,
    ciRange: i >= forecastStartIdx ? [ciLow[i], ciHigh[i]] : null
  }));
  return (
    <ResponsiveContainer width="100%" height={380}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="period" />
        <YAxis tickFormatter={fmt} />
        <Tooltip formatter={v => Array.isArray(v) ? `${fmt(v[0])}–${fmt(v[1])}` : fmt(v)} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area dataKey="ciRange" stroke={false} fill={PRIMARY} fillOpacity={0.15} name="95% інтервал" />
        <Line dataKey="history" stroke={PRIMARY} strokeWidth={2.5} dot={{ r: 3 }} name={`Факт (${yLabel})`} />
        <Line dataKey="forecast" stroke={ACCENT} strokeWidth={2.5} strokeDasharray="6 4" dot={{ r: 3 }} name={`Прогноз (${yLabel})`} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
