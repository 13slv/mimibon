import data from "@/data/sales.json";
import Card from "@/components/Card";
import {
  ScenarioForecast, TemperatureForecast, BottomUpForecast, LeadIndicator, WhatIfCalculator
} from "@/components/Forecast";

export default function Forecast() {
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-bold text-brand-600 mb-2">Прогнози</h2>
        <p className="text-sm text-gray-600">
          П'ять моделей прогнозування. Усі — інтерактивні. Усе в кг сировини, тижневий період.
          <br/>⚠️ <b>Прототип на 4 тижнях даних.</b> Точність зросте з історією.
        </p>
      </Card>

      <Card
        title="1. Best / Найімовірніший / Worst"
        sub="Лінійний тренд × сценарні множники. Простий бюджетний прогноз."
        insight={<>Базова траєкторія йде вниз — кожен тиждень мінус ~165 кг. Без втручання за 8 тижнів вийдемо на 0. Це сигнал зайнятися acquisition зараз.</>}
      >
        <ScenarioForecast weekly={data.weekly} />
      </Card>

      <Card
        title="2. Температурний регресор"
        sub="Кореляція з середньою температурою у Києві. Дані з open-meteo.com (історія + прогноз 16 днів)."
        insight={<>На 4 точках коефіцієнт {data.tempModel.correlation} — є <b>помірна позитивна звʼязок</b> (+{data.tempModel.slope} кг на кожен °C). Це логічно: мороженне залежить від спеки. Корреляція стане надійнішою, коли буде ≥12 тижнів.</>}
      >
        <TemperatureForecast weekly={data.weekly} weeklyForecastTemp={data.weeklyForecastTemp} tempModel={data.tempModel} />
      </Card>

      <Card
        title="3. Bottom-up (по кожному клієнту)"
        sub="Прогноз як сума по всіх 47 клієнтах окремо. Точніше за агрегатний тренд при різнорідній базі."
        insight={<>Якщо <b>всі клієнти продовжать у поточному темпі</b> — у наступному тижні очікувано ~1 050 кг (не враховує сезонність). Гра на ползунку показує: для збереження поточного оберту потрібно +20%.</>}
      >
        <BottomUpForecast customers={data.customers} />
      </Card>

      <Card
        title="4. Lead indicator: нові клієнти → майбутні кг"
        sub="Найраніший сигнал про майбутнє падіння — притік нових клієнтів."
        insight={<><b>Притік нових клієнтів падає 25 → 14 → 8 → 0.</b> Це майже гарантує падіння кг через 2-4 тижні. Зараз кожен новий клієнт у середньому приносить ~{Math.round(data.weekly.kg[0]*0.7/data.weekly.newCustomers[0])} кг у тиждень входу.</>}
      >
        <LeadIndicator weekly={data.weekly} cohortChart={data.cohortKg} />
      </Card>

      <Card
        title="5. What-if калькулятор когорт"
        sub="Поіграй з гіпотезами 'що буде якщо…'. Хороший інструмент для річного планування."
      >
        <WhatIfCalculator />
      </Card>

      <Card title="Як обирати модель">
        <div className="text-sm text-gray-700 space-y-2">
          <p><b>Для бюджету / прогнозу виробництва на 1-2 тижні:</b> модель 1 (Best/Likely/Worst).</p>
          <p><b>Для сезонного планування:</b> модель 2 (температурний). На літо ріст гарантований.</p>
          <p><b>Для індивідуальної роботи з клієнтами:</b> модель 3 (bottom-up) + сторінка <a href="/customers" className="text-brand-600 underline">"Клієнти"</a>.</p>
          <p><b>Для рішень про продажі/маркетинг:</b> модель 4 (lead indicator). Якщо вона падає — інші моделі скоро покажуть це теж.</p>
          <p><b>Для річного планування:</b> модель 5 (what-if когорт).</p>
        </div>
      </Card>
    </div>
  );
}
