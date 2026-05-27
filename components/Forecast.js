"use client";
import { useMemo, useState } from "react";
import {
  ResponsiveContainer, ComposedChart, LineChart, BarChart, Bar, Line,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from "recharts";
import { ReactiveBars } from "@/components/Charts";

const PRIMARY = "#d6006d";
const ACCENT = "#f88d2a";
const BURGUNDY = "#942d5c";
const GREEN = "#16a34a";
const RED = "#dc2626";

const fmt = n => n.toLocaleString("uk-UA", { maximumFractionDigits: 1 });

function linearRegression(y) {
  const n = y.length;
  const x = y.map((_, i) => i);
  const sumX = x.reduce((a, v) => a + v, 0);
  const sumY = y.reduce((a, v) => a + v, 0);
  const sumXY = x.reduce((a, _, i) => a + x[i] * y[i], 0);
  const sumXX = x.reduce((a, v) => a + v * v, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const pred = x.map(i => intercept + slope * i);
  const residuals = y.map((v, i) => v - pred[i]);
  const rss = residuals.reduce((a, r) => a + r * r, 0);
  const stdErr = Math.sqrt(rss / Math.max(n - 2, 1));
  return { slope, intercept, stdErr };
}

// ---------- 1. Best / Likely / Worst ----------
export function ScenarioForecast({ weekly }) {
  const [horizon, setHorizon] = useState(8);
  const [bestMul, setBestMul] = useState(1.2);
  const [worstMul, setWorstMul] = useState(0.8);
  const series = weekly.kg;
  const { slope, intercept } = useMemo(() => linearRegression(series), [series]);

  const data = useMemo(() => {
    const n = series.length;
    const labels = [...weekly.labels];
    const history = [...series];
    const likely = [...Array(n).fill(null)];
    const best = [...Array(n).fill(null)];
    const worst = [...Array(n).fill(null)];
    likely[n - 1] = best[n - 1] = worst[n - 1] = series[n - 1];
    for (let i = 1; i <= horizon; i++) {
      const xi = n - 1 + i;
      const pred = Math.max(0, intercept + slope * xi);
      labels.push(`W+${i}`);
      history.push(null);
      likely.push(pred);
      best.push(pred * bestMul);
      worst.push(pred * worstMul);
    }
    return { labels, history, likely, best, worst, startIdx: n - 1 };
  }, [series, horizon, slope, intercept, bestMul, worstMul, weekly.labels]);

  const bestLabel = `Best (×${bestMul})`;
  const worstLabel = `Worst (×${worstMul})`;
  const dataPoints = data.labels.map((label, i) => ({
    period: label,
    "Факт": data.history[i],
    "Найімовірніший": data.likely[i],
    [bestLabel]: data.best[i],
    [worstLabel]: data.worst[i],
  }));

  return (
    <div>
      <div className="grid md:grid-cols-3 gap-4 mb-5 text-sm">
        <Slider label="Best множник" value={bestMul} min={1.0} max={2.0} step={0.05} onChange={setBestMul} suffix="×" />
        <Slider label="Worst множник" value={worstMul} min={0.3} max={1.0} step={0.05} onChange={setWorstMul} suffix="×" />
        <Slider label="Горизонт, тижнів" value={horizon} min={2} max={26} onChange={setHorizon} />
      </div>
      <ResponsiveContainer width="100%" height={380}>
        <LineChart data={dataPoints}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="period" />
          <YAxis tickFormatter={fmt} label={{ value: "кг", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "#525252" } }} />
          <Tooltip formatter={v => fmt(v) + " кг"} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line dataKey="Факт" stroke={PRIMARY} strokeWidth={3} dot={{ r: 4 }} connectNulls />
          <Line dataKey={bestLabel} stroke={GREEN} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} connectNulls />
          <Line dataKey="Найімовірніший" stroke={ACCENT} strokeWidth={2.5} strokeDasharray="6 4" dot={{ r: 3 }} connectNulls />
          <Line dataKey={worstLabel} stroke={RED} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} connectNulls />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-500 mt-3">
        Базовий прогноз — лінійний тренд (нахил {fmt(slope)} кг/тижд). Best/Worst — множники до прогнозу.
      </p>
    </div>
  );
}

// ---------- 2. Temperature ----------
export function TemperatureForecast({ weekly, weeklyForecastTemp, tempModel }) {
  const [horizon, setHorizon] = useState(4);
  const futureN = Math.min(horizon, weeklyForecastTemp.labels.length);

  const data = useMemo(() => {
    const labels = [...weekly.labels, ...weeklyForecastTemp.labels.slice(0, futureN)];
    const histKg = weekly.kg;
    const histTemp = weekly.temperature;
    const fcstTemp = weeklyForecastTemp.temperature.slice(0, futureN);
    const fcstKg = fcstTemp.map(t => t != null ? Math.max(0, tempModel.intercept + tempModel.slope * t) : null);
    return labels.map((label, i) => ({
      period: label,
      "Факт кг": i < histKg.length ? histKg[i] : null,
      "Прогноз кг": i >= histKg.length ? fcstKg[i - histKg.length] : (i === histKg.length - 1 ? histKg[i] : null),
      "Темп °C": i < histTemp.length ? histTemp[i] : fcstTemp[i - histTemp.length],
    }));
  }, [weekly, weeklyForecastTemp, futureN, tempModel]);

  const corrLabel = Math.abs(tempModel.correlation) >= 0.7 ? "сильна"
                  : Math.abs(tempModel.correlation) >= 0.4 ? "помірна" : "слабка";

  return (
    <div>
      <div className="grid md:grid-cols-3 gap-4 mb-5 text-sm">
        <Stat label="Кореляція кг ↔ температура" value={tempModel.correlation.toFixed(2)} sub={corrLabel + " звʼязок"} />
        <Stat label="Чутливість" value={`+${fmt(tempModel.slope)} кг/°C`} sub="приріст кг за +1°C" />
        <Slider label="Горизонт прогнозу" value={horizon} min={1} max={Math.min(4, weeklyForecastTemp.labels.length)} onChange={setHorizon} suffix=" тижнів" />
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="period" />
          <YAxis yAxisId="left" tickFormatter={fmt} label={{ value: "кг", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "#525252" } }} />
          <YAxis yAxisId="right" orientation="right" tickFormatter={v => v + "°C"} label={{ value: "°C", angle: 90, position: "insideRight", style: { fontSize: 11, fill: "#525252" } }} />
          <Tooltip formatter={(v, name) => name === "Темп °C" ? [v + "°C", name] : [fmt(v) + " кг", name]} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line yAxisId="right" dataKey="Темп °C" stroke={RED} strokeWidth={2} dot={{ r: 3 }} connectNulls />
          <Bar yAxisId="left" dataKey="Факт кг" fill={PRIMARY} />
          <Bar yAxisId="left" dataKey="Прогноз кг" fill={ACCENT} />
        </ComposedChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-500 mt-3">
        Модель: <code>кг = {fmt(tempModel.intercept)} + {fmt(tempModel.slope)} × температура</code>.
        Корреляція <b>{tempModel.correlation.toFixed(2)}</b> на 4 точках —
        {Math.abs(tempModel.correlation) > 0.5 ? " тенденція є, але статистично слабка через малу вибірку." : " тенденція слабка, треба більше даних."}
        Прогноз температури з open-meteo.com.
      </p>
    </div>
  );
}

// ---------- 3. Bottom-up ----------
export function BottomUpForecast({ customers }) {
  const [horizon, setHorizon] = useState(4);
  const [growthPct, setGrowthPct] = useState(0);

  const data = useMemo(() => {
    const growth = 1 + growthPct / 100;
    const weeks = [];
    for (let i = 0; i < horizon; i++) {
      let weekKg = 0;
      let activeCount = 0;
      customers.forEach(c => {
        const weeklyRate = (c.kgPerMonth / 4.33) * growth;
        const stability = Math.min(1, c.weeksObserved / 4);
        const expectedKg = weeklyRate * stability;
        if (expectedKg > 0) {
          weekKg += expectedKg;
          activeCount++;
        }
      });
      weeks.push({ period: `W+${i + 1}`, kg: Math.round(weekKg * 10) / 10, active: activeCount });
    }
    return weeks;
  }, [customers, horizon, growthPct]);

  const totalKg = data.reduce((sum, w) => sum + w.kg, 0);

  return (
    <div>
      <div className="grid md:grid-cols-3 gap-4 mb-5 text-sm">
        <Slider label="Горизонт, тижнів" value={horizon} min={2} max={12} onChange={setHorizon} />
        <Slider label="Загальне зростання, %" value={growthPct} min={-30} max={50} step={5} onChange={setGrowthPct} suffix="%" />
        <Stat label={`Сумарно за ${horizon} тижнів`} value={fmt(totalKg)} sub="кг сировини" />
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="period" />
          <YAxis yAxisId="left" tickFormatter={fmt} label={{ value: "кг", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "#525252" } }} />
          <YAxis yAxisId="right" orientation="right" tickFormatter={fmt} label={{ value: "клієнтів", angle: 90, position: "insideRight", style: { fontSize: 11, fill: "#525252" } }} />
          <Tooltip formatter={(v, name) => [name === "active" ? v : fmt(v) + " кг", name === "kg" ? "Прогноз кг" : "Активних клієнтів"]} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar yAxisId="left" dataKey="kg" name="Прогноз кг" fill={PRIMARY} />
          <Line yAxisId="right" dataKey="active" name="Активних клієнтів" stroke={ACCENT} strokeWidth={2.5} dot={{ r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-500 mt-3">
        Сума по всіх 47 клієнтах: <code>прогноз тижня = Σ (кг/міс клієнта / 4.33) × (1 + зростання%) × (тижнів_спост / 4)</code>.
      </p>
    </div>
  );
}

// ---------- 4. Lead indicator ----------
export function LeadIndicator({ weekly, cohortChart }) {
  const avgFirstWeekKg = cohortChart.datasets.reduce((sum, ds) => {
    const m = ds.label.match(/(\d+)\s*клієнтів/);
    const size = m ? parseInt(m[1]) : 1;
    return sum + (ds.data[0] / size);
  }, 0) / cohortChart.datasets.length;

  const data = weekly.labels.map((label, i) => ({
    period: label,
    "Нових клієнтів": weekly.newCustomers[i],
    "Кг (факт)": weekly.kg[i],
    "Кг від нових (оцінка)": Math.round(weekly.newCustomers[i] * avgFirstWeekKg * 10) / 10,
  }));

  const newTrend = weekly.newCustomers.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const earlierTrend = weekly.newCustomers[0] || 0;
  const trendChange = ((newTrend - earlierTrend) / Math.max(earlierTrend, 1) * 100);

  return (
    <div>
      <div className="grid md:grid-cols-3 gap-4 mb-5 text-sm">
        <Stat label="Сер. кг від 1 нового клієнта" value={fmt(avgFirstWeekKg)} sub="у тиждень входу" />
        <Stat label="Нових/тиждень (середнє)" value={fmt(newTrend)} sub="за останні 3 тижні" />
        <Stat label="Зміна притоку" value={`${trendChange > 0 ? "+" : ""}${trendChange.toFixed(0)}%`} sub={trendChange < -30 ? "критичне падіння" : trendChange < 0 ? "падіння" : "ріст"} />
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="period" />
          <YAxis yAxisId="left" tickFormatter={fmt} label={{ value: "кг", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "#525252" } }} />
          <YAxis yAxisId="right" orientation="right" tickFormatter={fmt} label={{ value: "нових клієнтів", angle: 90, position: "insideRight", style: { fontSize: 11, fill: "#525252" } }} />
          <Tooltip formatter={(v, name) => name.includes("Нових") ? v : [fmt(v) + " кг", name]} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar yAxisId="left" dataKey="Кг (факт)" fill={PRIMARY} />
          <Bar yAxisId="left" dataKey="Кг від нових (оцінка)" fill={GREEN} />
          <Line yAxisId="right" dataKey="Нових клієнтів" stroke={ACCENT} strokeWidth={3} dot={{ r: 5 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------- shared UI ----------
function Stat({ label, value, sub }) {
  return (
    <div className="bg-brand-50 p-4 rounded-lg">
      <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">{label}</div>
      <div className="text-xl font-bold text-brand-600">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

function Slider({ label, value, min, max, onChange, suffix = "", step = 1 }) {
  return (
    <div className="bg-brand-50 p-4 rounded-lg">
      <label className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2 block">
        {label}: <span className="text-brand-600 font-bold">{value}{suffix}</span>
      </label>
      <input type="range" min={min} max={max} step={step} value={value}
             onChange={e => onChange(parseFloat(e.target.value))}
             className="w-full accent-brand-500" />
    </div>
  );
}

export function WhatIfCalculator() {
  const [newPerWeek, setNewPerWeek] = useState(10);
  const [avgKgW0, setAvgKgW0] = useState(65);
  const [retentionPct, setRetentionPct] = useState(40);
  const [avgKgRepeat, setAvgKgRepeat] = useState(50);
  const [weeks, setWeeks] = useState(12);

  const data = useMemo(() => {
    const cohorts = [];
    const weeklyKg = [];
    const cumulKg = [];
    let cumulative = 0;
    for (let w = 0; w < weeks; w++) {
      cohorts.push({ size: newPerWeek, week: w });
      let weekTotal = 0;
      cohorts.forEach(coh => {
        const age = w - coh.week;
        if (age === 0) weekTotal += coh.size * avgKgW0;
        else weekTotal += coh.size * Math.pow(retentionPct / 100, age) * avgKgRepeat;
      });
      cumulative += weekTotal;
      weeklyKg.push(Math.round(weekTotal * 10) / 10);
      cumulKg.push(cumulative);
    }
    return { weeklyKg, cumulKg };
  }, [newPerWeek, avgKgW0, retentionPct, avgKgRepeat, weeks]);

  const totalKg = data.cumulKg[data.cumulKg.length - 1] || 0;

  return (
    <div>
      <div className="grid md:grid-cols-5 gap-4 mb-6">
        <Slider label="Нових клієнтів/тиждень" value={newPerWeek} min={1} max={30} onChange={setNewPerWeek} />
        <Slider label="Перший заказ, кг" value={avgKgW0} min={20} max={150} onChange={setAvgKgW0} />
        <Slider label="Retention W+1, %" value={retentionPct} min={10} max={90} onChange={setRetentionPct} suffix="%" />
        <Slider label="Повторний заказ, кг" value={avgKgRepeat} min={10} max={100} onChange={setAvgKgRepeat} />
        <Slider label="Горизонт, тижнів" value={weeks} min={4} max={26} onChange={setWeeks} />
      </div>
      <div className="grid md:grid-cols-3 gap-4 mb-5">
        <Stat label={`Прогноз за ${weeks} тижнів`} value={fmt(totalKg)} sub="кг" />
        <Stat label="Середньотижневий" value={fmt(totalKg / weeks)} sub="кг/тиждень" />
        <Stat label="Активних на кінець" value={fmt(newPerWeek * weeks * (retentionPct / 100))} sub="оцінка" />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Прогноз кг на тиждень</h4>
        <ReactiveBars data={data.weeklyKg} labels={data.weeklyKg.map((_, i) => `W${i+1}`)} unit="кг" color={PRIMARY} />
      </div>
    </div>
  );
}
