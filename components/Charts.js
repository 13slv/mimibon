"use client";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, ResponsiveContainer, LineChart, Line,
  ComposedChart, Area
} from "recharts";

const PALETTE = ["#1F4E78", "#2E75B6", "#5B9BD5", "#9BC2E6", "#BDD7EE", "#DEEBF7"];

const fmt = n => (typeof n === "number" ? n.toLocaleString("uk-UA", { maximumFractionDigits: 1 }) : n);

// ---------- Pie ----------
export function ProductPie({ labels, values }) {
  const data = labels.map((l, i) => ({ name: l, value: values[i] }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" outerRadius={100} innerRadius={50} label={d => d.name.split(" ")[0]}>
          {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
        </Pie>
        <Tooltip formatter={v => fmt(v) + " од."} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ---------- Weekday Bar ----------
export function WeekdayBar({ labels, values }) {
  const data = labels.map((l, i) => ({
    day: l, value: values[i],
    fill: i === 5 ? "#F59E0B" : values[i] === 0 ? "#E5E7EB" : "#5B9BD5"
  }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="day" />
        <YAxis tickFormatter={fmt} />
        <Tooltip formatter={v => fmt(v) + " од."} />
        <Bar dataKey="value">
          {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ---------- Weekly Combo (units + kg bars + new customers line) ----------
export function WeeklyCombo({ labels, units, kg, customers, newCustomers }) {
  const data = labels.map((l, i) => ({
    week: l,
    units: units[i],
    kg: kg[i],
    customers: customers[i],
    newCustomers: newCustomers[i]
  }));
  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="week" />
        <YAxis yAxisId="left" tickFormatter={fmt} label={{ value: "од. / кг", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "#6b7280" } }} />
        <YAxis yAxisId="right" orientation="right" tickFormatter={fmt} label={{ value: "клієнтів", angle: 90, position: "insideRight", style: { fontSize: 11, fill: "#6b7280" } }} />
        <Tooltip formatter={(v, name) => [fmt(v), name]} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar yAxisId="left" dataKey="units" name="Обсяг (од.)" fill="#5B9BD5" />
        <Bar yAxisId="left" dataKey="kg" name="Сировина (кг)" fill="#1F4E78" />
        <Line yAxisId="right" type="monotone" dataKey="customers" name="Активних клієнтів" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 4 }} />
        <Line yAxisId="right" type="monotone" dataKey="newCustomers" name="Нових клієнтів" stroke="#10B981" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 4 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ---------- Horizontal Bar ----------
export function HorizontalBar({ labels, values, color = "#1F4E78", height = 400, unit = "од." }) {
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

// ---------- Cohort Grouped Bar (kg per period) ----------
export function CohortBars({ chartData }) {
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
        <YAxis tickFormatter={fmt} label={{ value: "кг сировини", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "#6b7280" } }} />
        <Tooltip formatter={v => fmt(v) + " кг"} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {chartData.datasets.map(ds => (
          <Bar key={ds.label} dataKey={ds.label} fill={ds.backgroundColor} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

// ---------- Multi-Line Chart (for retention, avg kg, etc.) ----------
export function MultiLine({ chartData, yLabel, yFormatter = fmt, domain }) {
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
        <YAxis domain={domain} tickFormatter={yFormatter} label={yLabel ? { value: yLabel, angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "#6b7280" } } : undefined} />
        <Tooltip formatter={yFormatter} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {chartData.datasets.map(ds => (
          <Line key={ds.label} type="monotone" dataKey={ds.label}
                stroke={ds.borderColor} strokeWidth={2.5}
                dot={{ r: 4 }} connectNulls />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// ---------- Retention Dual: retention% line + kg/customer bars ----------
export function RetentionDual({ retentionData, avgKgData }) {
  // merge by period (assumes same labels)
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
        <YAxis yAxisId="left" domain={[0, 100]} tickFormatter={v => v + "%"} label={{ value: "Retention %", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "#6b7280" } }} />
        <YAxis yAxisId="right" orientation="right" tickFormatter={fmt} label={{ value: "кг/активний клієнт", angle: 90, position: "insideRight", style: { fontSize: 11, fill: "#6b7280" } }} />
        <Tooltip formatter={(v, name) => name.startsWith("ret_") ? [v + "%", name.slice(4)] : [fmt(v) + " кг", name.slice(3)]} />
        <Legend wrapperStyle={{ fontSize: 11 }}
                payload={[
                  ...retentionData.datasets.map(ds => ({ value: `${ds.label} • retention %`, type: "line", color: ds.borderColor })),
                  ...avgKgData.datasets.map(ds => ({ value: `${ds.label} • кг/клієнт`, type: "rect", color: ds.borderColor + "80" }))
                ]} />
        {avgKgData.datasets.map(ds => (
          <Bar yAxisId="right" key={`bar_${ds.label}`} dataKey={`kg_${ds.label}`} fill={ds.borderColor + "55"} />
        ))}
        {retentionData.datasets.map(ds => (
          <Line yAxisId="left" key={`line_${ds.label}`} type="monotone" dataKey={`ret_${ds.label}`}
                stroke={ds.borderColor} strokeWidth={2.5} dot={{ r: 5 }} connectNulls />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ---------- Cohort heatmap (HTML/CSS, not Recharts) ----------
export function CohortHeatmap({ matrix, metric = "kg" }) {
  const values = matrix[metric === "kg" ? "kg" : metric === "active" ? "active" : "avgKgPerActive"];
  const flat = values.flat().filter(v => v !== null && v !== undefined && v !== 0);
  const max = Math.max(...flat, 1);
  const min = Math.min(...flat, 0);

  const color = (v) => {
    if (v === null || v === undefined) return "#f9fafb";
    if (v === 0) return "#f3f4f6";
    const ratio = (v - min) / (max - min || 1);
    const intensity = Math.round(ratio * 100);
    return `hsl(207, 70%, ${95 - intensity * 0.55}%)`;
  };
  const textColor = (v) => {
    if (v === null || v === undefined || v === 0) return "#9ca3af";
    const ratio = (v - min) / (max - min || 1);
    return ratio > 0.5 ? "#fff" : "#1f2937";
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

// ---------- Forecast Line with Confidence Band ----------
export function ForecastChart({ history, forecast, ciLow, ciHigh, labels, forecastStartIdx, yLabel = "од." }) {
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
        <Area dataKey="ciRange" stroke={false} fill="#5B9BD5" fillOpacity={0.18} name="95% інтервал" />
        <Line dataKey="history" stroke="#1F4E78" strokeWidth={2.5} dot={{ r: 3 }} name={`Факт (${yLabel})`} />
        <Line dataKey="forecast" stroke="#F59E0B" strokeWidth={2.5} strokeDasharray="6 4" dot={{ r: 3 }} name={`Прогноз (${yLabel})`} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
