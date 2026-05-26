import data from "@/data/sales.json";
import Card from "@/components/Card";
import { LinearTrend, WhatIfCalculator, CohortLTV } from "@/components/Forecast";

export default function Forecast() {
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-bold text-brand-600 mb-2">Прогнози</h2>
        <p className="text-sm text-gray-600">
          Три інструменти прогнозування. Кожен інтерактивний — рухай ползунки, модель перераховується миттєво.
          Усі прогнози — <b>прототип на 4 тижнях даних</b>, реалістичну точність очікуй після ≥3 місяців історії.
        </p>
      </Card>

      <Card
        title="1. Лінійний тренд із довірчим інтервалом"
        sub="Продовження тижневого тренду на N тижнів вперед. Сірим — 95% інтервал. Можна перемикати між кг сировини та обсягом."
      >
        <LinearTrend weekly={data.weekly} />
      </Card>

      <Card
        title="2. What-if калькулятор"
        sub="Поіграй з припущеннями про залучення, перший заказ, retention — побач прогноз."
      >
        <WhatIfCalculator />
      </Card>

      <Card
        title="3. Когортний LTV-прогноз"
        sub="На основі реальної кривої W19 — скільки кг принесе нова когорта за N тижнів."
      >
        <CohortLTV cohortChart={data.cohortKg} />
      </Card>

      <Card title="Як інтерпретувати">
        <div className="text-sm text-gray-700 space-y-2">
          <p><b>Лінійний тренд</b> працює добре, коли немає сезонності й одноразових подій. Зараз із 4 тижнями даних — це орієнтир, не прогноз.</p>
          <p><b>What-if</b> — це не прогноз, а <i>планування сценаріїв</i>. Корисний, коли треба оцінити: "якщо наймемо ще 2 sales і вони приведуть 5 нових клієнтів/тиждень — скільки кг на склад на 3 місяці?"</p>
          <p><b>Когортний LTV</b> — найточніший із трьох, бо спирається на реально спостережену поведінку клієнтів. Якість підвищується з кількістю когорт.</p>
        </div>
      </Card>
    </div>
  );
}
