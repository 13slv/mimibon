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
          П'ять моделей прогнозування. Усі — інтерактивні, у кг сировини, тижневий період.
          <br/>⚠️ <b>Прототип на 4 тижнях даних.</b> Точність зросте з історією.
        </p>
      </Card>

      <Card
        title="1. Best / Найімовірніший / Worst"
        sub="Лінійний тренд × сценарні множники. Простий бюджетний прогноз."
        insight={<>Базова траєкторія йде вниз — кожен тиждень мінус ~165 кг. Без втручання за 8 тижнів вийдемо на 0. Це сигнал зайнятися acquisition зараз.</>}
        howToRead={<>
          <div>На графіку <b>4 лінії</b>:</div>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><span className="text-brand-600 font-semibold">Рожева суцільна "Факт"</span> — реальні кг за минулі тижні.</li>
            <li><span className="text-amber-600 font-semibold">Помаранчева пунктирна "Найімовірніший"</span> — продовження лінійного тренду.</li>
            <li><span className="text-green-600 font-semibold">Зелена пунктирна "Best"</span> — оптимістичний сценарій (тренд × множник).</li>
            <li><span className="text-red-600 font-semibold">Червона пунктирна "Worst"</span> — песимістичний сценарій.</li>
          </ul>
          <div className="mt-2"><b>Як використати:</b> для бюджету бери <i>найімовірніший</i>; для замовлення сировини — <i>best</i> (щоб не залишитись без запасу); для cash-flow подушки — <i>worst</i>.</div>
          <div className="mt-2"><b>Ползунки</b>: можеш регулювати множники Best/Worst і горизонт прогнозу.</div>
        </>}
      >
        <ScenarioForecast weekly={data.weekly} />
      </Card>

      <Card
        title="2. Температурний регресор"
        sub="Кореляція з середньою температурою у Києві. Дані з open-meteo.com."
        insight={<>На 4 точках коефіцієнт {data.tempModel.correlation} — є <b>помірна позитивна звʼязок</b> (+{data.tempModel.slope} кг на кожен °C). Це логічно: мороженне залежить від спеки. Корреляція стане надійнішою, коли буде ≥12 тижнів.</>}
        howToRead={<>
          <div>На графіку поєднано <b>факт + прогноз кг</b> (стовпці) і <b>температуру</b> (червона лінія).</div>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><span className="text-brand-600 font-semibold">Рожеві стовпці</span> — реальні кг за минулі тижні.</li>
            <li><span className="text-amber-600 font-semibold">Помаранчеві стовпці</span> — прогноз кг на наступні тижні (рахується через температуру).</li>
            <li><span className="text-red-600 font-semibold">Червона лінія</span> — середня температура у Києві (історія + прогноз з open-meteo).</li>
          </ul>
          <div className="mt-2"><b>Як читати кореляцію:</b></div>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>0.7+ — сильна звʼязок, на температуру можна спиратись.</li>
            <li>0.4-0.7 — помірна (наш випадок), є тенденція.</li>
            <li>&lt;0.4 — слабка, температура не керує продажами.</li>
          </ul>
          <div className="mt-2"><b>Як використати:</b> якщо прогноз погоди на тиждень холодніший — зменши виробництво на коефіцієнт. На жаркий тиждень — збільш.</div>
        </>}
      >
        <TemperatureForecast weekly={data.weekly} weeklyForecastTemp={data.weeklyForecastTemp} tempModel={data.tempModel} />
      </Card>

      <Card
        title="3. Bottom-up (по кожному клієнту)"
        sub="Прогноз як сума по всіх 47 клієнтах окремо."
        insight={<>Якщо <b>всі клієнти продовжать у поточному темпі</b> — у наступному тижні очікувано ~1 050 кг. Гра з ползунком показує: для збереження поточного оберту потрібно +20%.</>}
        howToRead={<>
          <div>Замість прогнозу "загальної лінії" — рахуємо <b>сумму прогнозів по кожному клієнту окремо</b>.</div>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><span className="text-brand-600 font-semibold">Рожеві стовпці</span> — прогноз кг на тиждень.</li>
            <li><span className="text-amber-600 font-semibold">Помаранчева лінія</span> — кількість клієнтів, що дають внесок.</li>
          </ul>
          <div className="mt-2"><b>Чому це точніше за просто тренд:</b></div>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Великий клієнт + новачок не "усереднюються" — кожен має свій профіль.</li>
            <li>Новачкам (1 тиждень спост.) автоматично знижуємо впевненість на 75%.</li>
            <li>Можна тестувати "що буде якщо всі виростуть на +30%" через ползунок.</li>
          </ul>
          <div className="mt-2"><b>Як використати:</b> для річного планування виробництва й закупок. Точніше за лінійний тренд при різнорідній базі.</div>
        </>}
      >
        <BottomUpForecast customers={data.customers} />
      </Card>

      <Card
        title="4. Lead indicator: нові клієнти → майбутні кг"
        sub="Найраніший сигнал про майбутнє падіння — притік нових клієнтів."
        insight={<><b>Притік нових клієнтів падає 25 → 14 → 8 → 0.</b> Це майже гарантує падіння кг через 2-4 тижні.</>}
        howToRead={<>
          <div>Цей графік показує <b>причину</b>, а не наслідок.</div>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><span className="text-brand-600 font-semibold">Рожеві стовпці "Кг (факт)"</span> — реальні кг за тиждень.</li>
            <li><span className="text-green-600 font-semibold">Зелені стовпці "Кг від нових"</span> — оцінка: скільки з фактичних кг прийшло від нових клієнтів (це їх W+0 заказ).</li>
            <li><span className="text-amber-600 font-semibold">Помаранчева лінія "Нових клієнтів"</span> — скільки клієнтів зробили перший заказ у тижні.</li>
          </ul>
          <div className="mt-2"><b>Чому це важливо:</b></div>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Один новий клієнт у тиждень входу дає ~65 кг.</li>
            <li>Через 2 тижні він поверне ~40 кг (retention 56% × 47 кг/клієнт).</li>
            <li>Якщо <b>сьогодні нових 0</b>, то через 4 тижні відсутні ~200 кг.</li>
          </ul>
          <div className="mt-2"><b>Як використати:</b> якщо ця помаранчева лінія падає — алярм. Скоро впадуть і інші. Час підняти sales-активність <i>сьогодні</i>, поки тренд не вʼїхав у кг.</div>
        </>}
      >
        <LeadIndicator weekly={data.weekly} cohortChart={data.cohortKg} />
      </Card>

      <Card
        title="5. What-if калькулятор когорт"
        sub="Поіграй з гіпотезами 'що буде якщо…'. Хороший інструмент для річного планування."
        howToRead={<>
          <div>Це <b>симулятор бізнесу</b>. Ти задаєш 5 параметрів — модель будує "що буде" на N тижнів.</div>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><b>Нових клієнтів/тиждень</b> — скільки нових приваблюєш регулярно.</li>
            <li><b>Перший заказ, кг</b> — типовий W+0 заказ.</li>
            <li><b>Retention W+1, %</b> — яка частка повертається через тиждень.</li>
            <li><b>Повторний заказ, кг</b> — типовий обʼєм повторного заказу.</li>
            <li><b>Горизонт</b> — на скільки тижнів моделюємо.</li>
          </ul>
          <div className="mt-2"><b>Як використати:</b></div>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>"Що буде, якщо найму ще 1 sales і він приведе +5 нових/тиждень?" — додай 5 до новых, побач Δ.</li>
            <li>"Скільки треба нових/тиждень для 5 000 кг/міс?" — крути ползунок поки не вийде на 5 000.</li>
            <li>"Що дає важливіше — більше нових чи кращий retention?" — порівняй сценарії.</li>
          </ul>
        </>}
      >
        <WhatIfCalculator />
      </Card>

      <Card title="Як обирати модель">
        <div className="text-sm text-gray-700 space-y-2">
          <p><b>Для бюджету / прогнозу виробництва на 1-2 тижні:</b> модель 1 (Best/Likely/Worst).</p>
          <p><b>Для сезонного планування:</b> модель 2 (температурний). На літо ріст гарантований.</p>
          <p><b>Для індивідуальної роботи з клієнтами:</b> модель 3 (bottom-up) + сторінка <a href="/customers" className="text-brand-600 underline">"Клієнти"</a>.</p>
          <p><b>Для рішень про продажі/маркетинг:</b> модель 4 (lead indicator).</p>
          <p><b>Для річного планування:</b> модель 5 (what-if когорт).</p>
        </div>
      </Card>
    </div>
  );
}
