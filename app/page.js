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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Сировина (кг)" value={fmt(k.total_kg)} sub="кг рідкої суміші" />
        <KPICard label="Клієнтів" value={k.customers} sub="купували суміш" />
        <KPICard label="Точок продажу" value={k.points} sub="фізичних адрес" />
        <KPICard label="Міст / н.п." value={k.cities} sub="географія" />
        <KPICard label="Замовлень" value={k.orders} sub="клієнт × день" />
        <KPICard label="Середній заказ" value={fmt(k.avg_order_kg)} sub="кг/заказ" />
        <KPICard label="Активних днів" value={k.days} sub="за 20 календарних" />
        <KPICard label="Аромати" value="2" sub="Три молока, Крем-пломбір" />
      </div>

      <Card
        title="Тижнева динаміка"
        sub="Стовпці — кг сировини. Лінії — клієнти (активні та нові)."
        insight={<>
          <b>W19 — пік 1 777 кг (передсвяткова закладка).</b> Далі поступове зниження.
          Притік нових клієнтів падає: 25 → 14 → 8 → 0. Це найважливіший тривожний сигнал — без нових клієнтів навіть стабільний retention не врятує.
        </>}
        howToRead={<>
          <div><b>Вертикальна вісь зліва</b> — кг сировини за тиждень (стовпці).</div>
          <div><b>Вертикальна вісь справа</b> — кількість клієнтів (лінії).</div>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><b>Помаранчева лінія "Активних клієнтів"</b> — скільки людей зробили хоча б 1 заказ у цьому тижні.</li>
            <li><b>Зелена пунктирна "Нових клієнтів"</b> — скільки прийшло вперше. <u>Це випереджаючий індикатор</u>: нові сьогодні = кг через 2-4 тижні.</li>
          </ul>
          <div className="mt-2"><b>На що дивитися:</b> чи розширюється стовпчик, чи стиснулась лінія нових. Якщо розрив між активними і новими різко росте — клієнтська база старіє і скоро впаде.</div>
        </>}
      >
        <WeeklyCombo {...data.weekly} />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          title="Розподіл за смаками"
          sub="Скільки кг сировини за кожним ароматом."
          insight={<><b>Крем-пломбір лідирує:</b> {fmt(data.products.values[0])} кг проти {fmt(data.products.values[1])} кг "Три молока". Враховуй це у виробничому плані — пропорція приблизно 55/45.</>}
          howToRead={<>
            <div>Кругова діаграма ділить загальні кг сировини на 2 аромати.</div>
            <div className="mt-2"><b>Як використати:</b> ця пропорція = твій виробничий план. Якщо одного аромату стабільно більше — виробництво має йти в тому ж співвідношенні.</div>
            <div className="mt-2"><b>Тривога:</b> якщо пропорція раптом сильно змінилась (&gt;10% за тиждень) — або сезонність, або новий клієнт з одностороннім попитом.</div>
          </>}
        >
          <ProductPie {...data.products} />
        </Card>

        <Card
          title="День тижня"
          sub="Сумарно кг сировини за день тижня."
          insight={<><b>Субота — пік продажів.</b> Неділя й понеділок відсутні — або графік доставки, або упущена виручка.</>}
          howToRead={<>
            <div>Стовпці показують <b>сумарні кг за весь період</b> по днях тижня.</div>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><span className="text-amber-600 font-medium">Помаранчевий</span> — субота (пік).</li>
              <li><span className="text-brand-500 font-medium">Рожевий</span> — будні з продажами.</li>
              <li><span className="text-gray-400 font-medium">Сірий</span> — дні без жодного продажу.</li>
            </ul>
            <div className="mt-2"><b>Як використати:</b> плануй виробництво й доставку під суботу. Якщо неділя/понеділок порожні — спитай у клієнтів чи готові брати в ці дні.</div>
          </>}
        >
          <WeekdayBar {...data.weekday} />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card
            title="Топ-15 клієнтів"
            sub="З 47 клієнтів. Топ-5 = ~30% обсягу, топ-10 = ~45%."
            insight={<><b>Майданович Р. О. = {fmt(data.topCustomers.values[0])} кг</b> (топ-1). Втрата одного клієнта = мінус ~10-12% продажів сировини.</>}
            howToRead={<>
              <div>Горизонтальні стовпці — клієнти, відсортовані за кг сировини за весь період.</div>
              <div className="mt-2"><b>Як використати:</b></div>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Верхні 3-5 — твої <b>якорі</b>. Тримай контакт мінімум раз на тиждень.</li>
                <li>Концентрація: якщо топ-3 дають &gt;30% — це <u>ризик</u>, диверсифікуй.</li>
                <li>"Хвіст" знизу — кандидати на детальний аналіз на сторінці "Клієнти".</li>
              </ul>
            </>}
          >
            <HorizontalBar {...data.topCustomers} color="#d6006d" height={500} unit="кг" />
          </Card>
        </div>

        <Card
          title="Географія (топ-12, кг)"
          sub="За кг сировини."
          insight={<><b>Київ — {fmt(data.geography.values[0])} кг</b> (≈60% обсягу). Інше — пригородна зона.</>}
          howToRead={<>
            <div>Розподіл кг сировини по містах і населених пунктах.</div>
            <div className="mt-2"><b>Як використати:</b> якщо одне місто бере 60%+ — будь-який логістичний збій там вибиває з гри. Працюй над регіональною диверсифікацією.</div>
            <div className="mt-2"><b>Можливість:</b> якщо пригородні точки беруть стабільно ~150 кг/міс при темпі росту 20% — там потенціал відкриття 2-го клієнта.</div>
          </>}
        >
          <HorizontalBar {...data.geography} color="#f88d2a" height={500} unit="кг" />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RiskList />
        <OppList />
      </div>
    </div>
  );
}

function RiskList() {
  const items = [
    "Концентрація на топ-клієнті (Майданович = ~12% обсягу)",
    "Залежність від Києва (~60% сировини)",
    "34% клієнтів зробили лише 1 заказ за 4 тижні",
    "Падаюча когортна динаміка: 25 → 14 → 8 → 0 нових/тиждень",
    "Аномалія 9 травня маскує справжній тренд (передсвято)",
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
    "Майже всі клієнти беруть обидва аромати — повний асортимент",
    "Передбачуваний 2-тижневий цикл замовлень у HoReCa",
    "17 населених пунктів у пригороді Києва — база для масштабування",
    "Високий середній заказ (52 кг/заказ) — низькі питомі логвитрати",
    "Стандартні фасування 13.5/18/22.5/40.5 л — спрощена логістика"
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
