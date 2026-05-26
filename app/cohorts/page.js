import data from "@/data/sales.json";
import Card from "@/components/Card";
import {
  CohortBars, MultiLine, RetentionDual, CohortHeatmap, CohortStatsTable
} from "@/components/Charts";

export default function Cohorts() {
  return (
    <div className="space-y-6">

      <Card title="Зведена таблиця когорт" sub="Усі ключові метрики на одному екрані. Перша когорта (W19) — базова лінія для порівняння.">
        <CohortStatsTable rows={data.cohortStats} />
        <div className="mt-4 px-4 py-3 bg-brand-50 border-l-4 border-brand-500 rounded text-sm text-gray-700">
          <b>Спостережений LTV</b> = скільки кг сировини в середньому замовив один клієнт когорти за всі тижні спостереження.
          У W19 (4 тижні даних) це <b>118 кг/клієнт</b>, у W21 (2 тижні даних) — лише <b>38 кг</b>. Розрив частково через коротший період, частково через слабкіший перший заказ.
        </div>
      </Card>

      <Card
        title="Retention + кг на одного активного клієнта"
        sub="Лінії — % клієнтів когорти, які повернулись (ліва вісь). Стовпці — скільки кг купив один активний клієнт у цьому тижні (права вісь)."
        insight={<><b>Retention впав, але середній чек тримається.</b> У W19 кг/клієнт залишається 47–65 кг навіть на 2-3 тижні. Це означає що ті, хто повертаються, замовляють так само багато — мова про "що клієнти зникли", а не "ослабли".</>}
      >
        <RetentionDual retentionData={data.retention} avgKgData={data.avgKgPerActive} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Кг сировини за тижнями (сумарно когорта)"
          sub="Скільки всього кг дала когорта в кожному тижні після першого замовлення."
        >
          <CohortBars chartData={data.cohortKg} />
        </Card>

        <Card
          title="Кумулятивний LTV (кг на одного клієнта)"
          sub="Скільки в сумі замовив один клієнт когорти до тижня W+N."
          insight={<><b>W19 виходить на ~118 кг/клієнт за 4 тижні.</b> Якщо ця крива продовжиться без падіння — за 3 місяці клієнт принесе ~250–350 кг сировини.</>}
        >
          <MultiLine chartData={data.cumulativeLTV} yLabel="кг/клієнт" />
        </Card>
      </div>

      <Card
        title="Теплова карта когорт (кг)"
        sub="Колір — інтенсивність продажу. Темніше = більше кг сировини в когорті у цьому тижні."
      >
        <CohortHeatmap matrix={data.cohortMatrix} metric="kg" />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Активних клієнтів у тижні"
          sub="Скільки людей з когорти ще замовляють."
        >
          <CohortHeatmap matrix={data.cohortMatrix} metric="active" />
        </Card>

        <Card
          title="Кг на активного клієнта"
          sub="Чи росте середній чек тих, хто повертається."
        >
          <CohortHeatmap matrix={data.cohortMatrix} metric="avgKgPerActive" />
        </Card>
      </div>

      <Card title="Як читати ці графіки">
        <div className="text-sm text-gray-700 space-y-3">
          <p><b>Когорта</b> — група клієнтів, що зробили перше замовлення в один і той самий тиждень. Ми порівнюємо їхню поведінку у наступні тижні.</p>
          <div>
            <b>Три основні питання:</b>
            <ul className="list-disc pl-6 mt-1 space-y-1">
              <li><b>Чи повертаються клієнти?</b> → дивись retention %</li>
              <li><b>Скільки кг беруть ті, хто повернувся?</b> → дивись кг/клієнт</li>
              <li><b>Скільки в сумі дає один клієнт когорти?</b> → дивись кумулятивний LTV</li>
            </ul>
          </div>
          <p><b>Перетин:</b> якщо retention падає, але кг/клієнт росте — частина клієнтів стала "опорою бізнесу". Якщо обидва падають — клієнти кидають.</p>
          <p className="text-amber-600">⚠️ <b>Прототип на 3-4 тижнях.</b> Усі цифри індикативні. Серйозні висновки — від 6 місяців історії.</p>
        </div>
      </Card>
    </div>
  );
}
