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

// ---------- Daily Bar ----------
export function DailyBar({ labels, values, weekdays }) {
  const data = labels.map((l, i) => ({
    day: l, value: values[i],
    fill: weekdays[i] === 5 ? "#F59E0B" : "#5B9BD5"
  }));
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ bottom: 50 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="day" angle={-45} textAnchor="end" interval={0} height={70} />
        <YAxis tickFormatter={fmt} />
        <Tooltip formatter={v => fmt(v) + " од."} />
        <Bar dataKey="value">
          {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ---------- Horizontal Bar ----------
export function HorizontalBar({ labels, values, color = "#1F4E78", height = 400 }) {
  const data = labels.map((l, i) => ({ name: l, value: values[i] }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis type="number" tickFormatter={fmt} />
        <YAxis type="category" dataKey="name" width={170} />
        <Tooltip formatter={v => fmt(v) + " од."} />
        <Bar dataKey="value" fill={color} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ---------- Cohort Grouped Bar ----------
export function CohortBars({ chartData }) {
  // chartData has shape { labels, datasets: [{label, data, backgroundColor}, ...] }
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

// ---------- Retention Lines ----------
export function RetentionLines({ chartData }) {
  const flatData = chartData.labels.map((label, i) => {
    const row = { period: label };
    chartData.datasets.forEach(ds => { row[ds.label] = ds.data[i] ?? 0; });
    return row;
  });
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={flatData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="period" />
        <YAxis domain={[0, 100]} tickFormatter={v => v + "%"} />
        <Tooltip formatter={v => v + "%"} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {chartData.datasets.map(ds => (
          <Line key={ds.label} type="monotone" dataKey={ds.label} stroke={ds.borderColor} strokeWidth={2} dot={{ r: 4 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// ---------- Forecast Line with Confidence Band ----------
export function ForecastChart({ history, forecast, ciLow, ciHigh, labels, forecastStartIdx }) {
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
        <Line dataKey="history" stroke="#1F4E78" strokeWidth={2.5} dot={{ r: 3 }} name="Факт" />
        <Line dataKey="forecast" stroke="#F59E0B" strokeWidth={2.5} strokeDasharray="6 4" dot={{ r: 3 }} name="Прогноз" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
