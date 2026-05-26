"use client";
import { useMemo, useState } from "react";
import { ForecastChart } from "@/components/Charts";

const fmt = n => n.toLocaleString("uk-UA", { maximumFractionDigits: 1 });

// ---------- math helpers ----------
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

// ---------- 1. Linear trend (weekly basis) ----------
export function LinearTrend({ weekly }) {
  const [horizon, setHorizon] = useState(8);
  const [metric, setMetric] = useState("kg"); // "kg" or "units"
  const series = metric === "kg" ? weekly.kg : weekly.units;
  const yLabel = metric === "kg" ? "кг" : "од.";

  const { slope, intercept, stdErr } = useMemo(() => linearRegression(series), [series]);

  const data = useMemo(() => {
    const n = series.length;
    const labels = [...weekly.labels];
    const history = [...series];
    const forecast = [...Array(n).fill(null)];
    const ciLow = [...Array(n).fill(null)];
    const ciHigh = [...Array(n).fill(null)];

    forecast[n - 1] = series[n - 1];
    ciLow[n - 1] = series[n - 1];
    ciHigh[n - 1] = series[n - 1];

    for (let i = 1; i <= horizon; i++) {
      const xi = n - 1 + i;
      const pred = intercept + slope * xi;
      labels.push(`W+${i}`);
      history.push(null);
      forecast.push(Math.max(0, pred));
      ciLow.push(Math.max(0, pred - 1.96 * stdErr));
      ciHigh.push(Math.max(0, pred + 1.96 * stdErr));
    }
    return { labels, history, forecast, ciLow, ciHigh, startIdx: n - 1 };
  }, [series, horizon, slope, intercept, stdErr, weekly.labels]);

  const trendDir = slope > 0 ? "↗ зростання" : slope < 0 ? "↘ спад" : "→ стабільно";

  return (
    <div>
      <div className="grid md:grid-cols-4 gap-4 mb-5 text-sm">
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2 block">Метрика</label>
          <select value={metric} onChange={e => setMetric(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded px-2 py-1.5 text-sm">
            <option value="kg">Сировина (кг)</option>
            <option value="units">Обсяг (од.)</option>
          </select>
        </div>
        <Stat label="Нахил тренду" value={`${fmt(slope)} ${yLabel}/тиждень`} sub={trendDir} />
        <Stat label="Похибка моделі (σ)" value={`±${fmt(stdErr)} ${yLabel}`} sub="95% інтервал ≈ ±1.96σ" />
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2 block">
            Горизонт: {horizon} тижнів
          </label>
          <input type="range" min={2} max={26} value={horizon}
                 onChange={e => setHorizon(parseInt(e.target.value))}
                 className="w-full accent-brand-600" />
        </div>
      </div>
      <ForecastChart
        history={data.history}
        forecast={data.forecast}
        ciLow={data.ciLow}
        ciHigh={data.ciHigh}
        labels={data.labels}
        forecastStartIdx={data.startIdx}
        yLabel={yLabel}
      />
      <p className="text-xs text-gray-500 mt-3">
        ⚠️ Модель навчена на {series.length} тижнях. На малій вибірці лінійний тренд чутливий до викидів.
        Для серйозного прогнозу — Prophet або ARIMA, але треба ≥3 місяці історії.
      </p>
    </div>
  );
}

// ---------- 2. What-if calculator ----------
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
        if (age === 0) {
          weekTotal += coh.size * avgKgW0;
        } else {
          const remaining = coh.size * Math.pow(retentionPct / 100, age);
          weekTotal += remaining * avgKgRepeat;
        }
      });
      cumulative += weekTotal;
      weeklyKg.push(weekTotal);
      cumulKg.push(cumulative);
    }
    return { weeklyKg, cumulKg };
  }, [newPerWeek, avgKgW0, retentionPct, avgKgRepeat, weeks]);

  const totalKg = data.cumulKg[data.cumulKg.length - 1] || 0;

  return (
    <div>
      <div className="grid md:grid-cols-5 gap-4 mb-6">
        <Slider label="Нових клієнтів/тиждень" value={newPerWeek} min={1} max={30} onChange={setNewPerWeek} />
        <Slider label="Перший заказ, кг/клієнт" value={avgKgW0} min={20} max={150} onChange={setAvgKgW0} />
        <Slider label="Retention W+1, %" value={retentionPct} min={10} max={90} onChange={setRetentionPct} suffix="%" />
        <Slider label="Повторний заказ, кг" value={avgKgRepeat} min={10} max={100} onChange={setAvgKgRepeat} />
        <Slider label="Горизонт, тижнів" value={weeks} min={4} max={26} onChange={setWeeks} />
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-5">
        <Stat label={`Прогноз кг за ${weeks} тижнів`} value={fmt(totalKg)} sub="кг сировини" />
        <Stat label="Середньотижневий обсяг" value={fmt(totalKg / weeks)} sub="кг/тиждень" />
        <Stat label="Активних клієнтів на кінець" value={fmt(newPerWeek * weeks * (retentionPct / 100))} sub="оцінка" />
      </div>

      <SimpleBarsChart data={data.weeklyKg} labels={data.weeklyKg.map((_, i) => `W${i + 1}`)} unit="кг" />

      <p className="text-xs text-gray-500 mt-3">
        Модель: щотижня додається N нових клієнтів. Кожен у тиждень входу дає K₀ кг,
        у наступні тижні з імовірністю R повертається й дає K кг.
      </p>
    </div>
  );
}

// ---------- 3. Cohort LTV projection ----------
export function CohortLTV({ cohortChart }) {
  const w19 = cohortChart.datasets[0];
  const totalCohortSize = parseInt(w19.label.match(/(\d+)\s*клієнтів/)?.[1] || "25");

  const observed = w19.data.map(v => v / totalCohortSize);
  const tail = observed.slice(-2).reduce((a, v) => a + v, 0) / 2;

  const [horizon, setHorizon] = useState(12);
  const [cohortSize, setCohortSize] = useState(15);

  const data = useMemo(() => {
    const perCustomer = [];
    const cumPerCustomer = [];
    let cum = 0;
    for (let i = 0; i < horizon; i++) {
      let val;
      if (i < observed.length) val = observed[i];
      else val = Math.max(0, tail * Math.pow(0.92, i - observed.length + 1));
      perCustomer.push(val);
      cum += val;
      cumPerCustomer.push(cum);
    }
    return {
      perCustomer,
      cumPerCustomer,
      cohortCum: cumPerCustomer.map(v => v * cohortSize),
      cohortPer: perCustomer.map(v => v * cohortSize)
    };
  }, [horizon, cohortSize]);

  const totalKg = data.cohortCum[data.cohortCum.length - 1] || 0;

  return (
    <div>
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Slider label="Розмір нової когорти" value={cohortSize} min={3} max={40} onChange={setCohortSize} suffix=" клієнтів" />
        <Slider label="Горизонт прогнозу" value={horizon} min={4} max={26} onChange={setHorizon} suffix=" тижнів" />
        <Stat label={`Кумулятивний LTV за ${horizon} тиж.`} value={fmt(totalKg)} sub="кг" />
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Прогноз кг на тиждень (вся когорта)</h4>
        <SimpleBarsChart data={data.cohortPer} labels={data.cohortPer.map((_, i) => `W+${i}`)} unit="кг" />
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Модель: беремо спостережену криву "кг на клієнта" для когорти W19, екстраполюємо хвостом
        із загасанням 8% на тиждень. Множимо на розмір нової когорти.
      </p>
    </div>
  );
}

// ---------- shared UI ----------
function Stat({ label, value, sub }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">{label}</div>
      <div className="text-xl font-bold text-brand-600">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

function Slider({ label, value, min, max, onChange, suffix = "" }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <label className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2 block">
        {label}: <span className="text-brand-600 font-bold">{value}{suffix}</span>
      </label>
      <input type="range" min={min} max={max} value={value}
             onChange={e => onChange(parseInt(e.target.value))}
             className="w-full accent-brand-600" />
    </div>
  );
}

function SimpleBarsChart({ data, labels, unit = "" }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1 h-48 bg-gray-50 p-3 rounded-lg">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end" title={`${labels[i]}: ${fmt(v)} ${unit}`}>
          <div className="text-[10px] text-gray-500 mb-1">{fmt(v)}</div>
          <div className="w-full bg-brand-500 rounded-t" style={{ height: `${(v / max) * 80}%`, minHeight: 2 }} />
          <div className="text-[10px] text-gray-400 mt-1">{labels[i]}</div>
        </div>
      ))}
    </div>
  );
}
