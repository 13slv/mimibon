import data from "@/data/sales.json";
import KPICard from "@/components/KPICard";
import Card from "@/components/Card";
import {
  ProductPie, WeekdayBar, WeeklyCombo, HorizontalBar
} from "@/components/Charts";

const fmt = n => n.toLocaleString("uk-UA", { maximumFractionDigits: 1 });

export default function Home() {
  const k = data.kpis;
  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Загальний обсяг" value={fmt(k.total_units)} sub="одиниць (шт+л)" />
        <KPICard label="Сировина морозива" value={fmt(k.total_kg)} sub="кг рідкої суміші" />
        <KPICard label="Клієнтів" value={k.customers} sub="унікальних B2B" />
        <KPICard label="Точок продажу" value={k.points} sub="фізичних адрес" />
        <KPICard label="Міст / н.п." value={k.cities} sub="географія" />
        <KPICard label="Замовлень" value={k.orders} sub="клієнт × день" />
        <KPICard label="Середній заказ" value={fmt(k.avg_order)} sub="одиниць" />
        <KPICard label="Активних днів" value={k.days} sub="за 20 календарних" />
      </div>

      {/* Weekly main chart */}
      <Card
        title="Тижнева динаміка"
        sub="Стовпці — обсяг (од.) і сировина (кг). Лінії — кількість клієнтів."
        insight={<>
          <b>W19 — пік 20 260 од. (передсвяткова закладка).</b> Далі плавне зниження.
          Притік нових клієнтів падає: 25 → 14 → 8 → 0. Це найважливіший тривожний сигнал — без нових клієнтів навіть стабільний retention не врятує.
        </>}
      >
        <WeeklyCombo {...data.weekly} />
      </Card>

      {/* Product & weekday */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          title="Продуктовий мікс"
          sub="Розподіл обсягу за SKU."
          insight={<><b>Ріжок = 48% обсягу.</b> Стакани разом — 42%. Смесь у штуках мала, але це 4 620 кг реальної сировини.</>}
        >
          <ProductPie {...data.products} />
        </Card>

        <Card
          title="День тижня"
          sub="Сумарний обсяг за день тижня."
          insight={<><b>Субота = 44% обсягу.</b> Неділя й понеділок відсутні — або графік доставки, або упущена виручка.</>}
        >
          <WeekdayBar {...data.weekday} />
        </Card>
      </div>

      {/* Customers & geography */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          title="Топ-15 клієнтів"
          sub="З 47 клієнтів. Топ-5 = 27% обсягу, топ-10 = 42%."
          insight={<><b>Майданович Р. О. = 11,6%</b> обсягу. Втрата одного клієнта = мінус 1/8 продажів.</>}
        >
          <div className="md:col-span-2"><HorizontalBar {...data.topCustomers} color="#1F4E78" height={500} /></div>
        </Card>

        <Card
          title="Географія (топ-12)"
          sub="За обсягом продажів."
          insight={<><b>Київ — 60,5%.</b> Інше — пригородна зона.</>}
        >
          <HorizontalBar {...data.geography} color="#2E75B6" height={500} />
        </Card>
      </div>

      {/* Risks / Strengths */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RiskList />
        <OppList />
      </div>
    </div>
  );
}

function RiskList() {
  const items = [
    "Концентрація на топ-клієнті (Майданович = 11,6%)",
    "Залежність від Києва (60,5%)",
    "34% клієнтів зробили лише 1 заказ",
    "Падаюча когортна динаміка: 25 → 14 → 8 → 0 нових/тиждень",
    "Аномалія 9 травня маскує справжній тренд",
    "Повернення/корекція −0,9 л у Чернова М. Л. 19.05"
  ];
  return (
    <Card title="Ризики">
      <ul className="space-y-2">
        {items.map((t, i) => (
          <li key={i} className="flex gap-3 text-sm border-b border-gray-100 pb-2 last:border-0">
            <span className="flex-shrink-0 w-6 h-6 bg-red-600 text-white rounded-full text-xs font-bold flex items-center justify-center">{i + 1}</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function OppList() {
  const items = [
    "44 з 47 клієнтів купують 4-5 SKU — повний асортимент",
    "Стандартизовані пакування (340/160/100) — прості логістика і прайс",
    "17 населених пунктів у пригороді Києва — база для масштабування",
    "Передбачуваний 2-тижневий цикл замовлень",
    "Висока середня партія (467 од./заказ) — низькі питомі логвитрати"
  ];
  return (
    <Card title="Сильні сторони">
      <ul className="space-y-2">
        {items.map((t, i) => (
          <li key={i} className="flex gap-3 text-sm border-b border-gray-100 pb-2 last:border-0">
            <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full text-xs font-bold flex items-center justify-center">{i + 1}</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
