# Дашборд продажів морозива КСТ

Інтерактивний дашборд на Next.js + Recharts. Деплоїться на Vercel.

## Що всередині

- **Огляд** — KPI, графіки, ризики, сильні сторони
- **Прогнози** — лінійний тренд, what-if калькулятор, когортний LTV
- **Когорти** — heatmap та retention

## Як запустити онлайн без терміналу (рекомендований шлях)

Якщо ти ніколи не працював з GitHub — ця інструкція для тебе. Тут немає жодної команди в терміналі.

### Крок 1. Створи акаунт на GitHub (1 хв)

1. Відкрий [github.com/signup](https://github.com/signup)
2. Зареєструйся (email + пароль). Безкоштовно.

### Крок 2. Створи новий репозиторій (1 хв)

1. Натисни зверху справа **+** → **New repository**
2. Назва: `ice-cream-dashboard` (можна будь-яку)
3. Public або Private — як хочеш
4. **НЕ** додавай README, .gitignore чи license (вони вже є у нашому архіві)
5. Натисни **Create repository**

### Крок 3. Залий файли через браузер (2 хв)

1. На свіжоствореному репозиторії натисни **uploading an existing file** (синє посилання) або вкладку **Add file → Upload files**
2. **Розпакуй ZIP-архів** з дашбордом у себе на компʼютері — отримаєш папку `ice-cream-dashboard`
3. **Виділи ВСІ файли всередині цієї папки** (Ctrl+A / Cmd+A) — крім самої папки!
   Має бути: `app/`, `components/`, `data/`, `public/`, `package.json`, `next.config.mjs`, `tailwind.config.js`, `postcss.config.js`, `jsconfig.json`, `.gitignore`, `README.md`
4. Перетягни їх у вікно GitHub (drag and drop)
5. Внизу напиши `Initial commit` і натисни **Commit changes**

### Крок 4. Підключи до Vercel (2 хв)

1. Відкрий [vercel.com](https://vercel.com)
2. Натисни **Sign Up** → **Continue with GitHub** (вхід через твій GitHub-акаунт)
3. На головній сторінці Vercel: **Add New... → Project**
4. Знайди свій репозиторій `ice-cream-dashboard` і натисни **Import**
5. На сторінці налаштувань нічого не змінюй — просто натисни **Deploy**
6. Чекай 1-2 хвилини. Коли побачиш "Congratulations" — готово!

### Крок 5. Отримай посилання

Vercel дає тобі URL виду `https://ice-cream-dashboard-xxxx.vercel.app`. Це й є твоя публічна
посилання — діляся з усіма.

## Як оновити дані

Коли дочекаєшся повної історії з 1С:

1. На GitHub зайди у файл `data/sales.json`
2. Натисни значок олівця (Edit this file)
3. Встав новий JSON (за тією ж структурою)
4. Внизу — **Commit changes**
5. Vercel автоматично пересоберет дашборд за 1-2 хвилини. Ніяких додаткових дій.

## Структура даних `data/sales.json`

```json
{
  "kpis": { "total_units": ..., "total_kg": ..., "customers": ..., ... },
  "products": { "labels": [...], "values": [...] },
  "daily": { "labels": [...], "values": [...], "weekdays": [...] },
  "weekday": { "labels": [...], "values": [...] },
  "topCustomers": { "labels": [...], "values": [...] },
  "geography": { "labels": [...], "values": [...] },
  "cohortKg": { "labels": [...], "datasets": [...] },
  "retention": { "labels": [...], "datasets": [...] }
}
```

Якщо потрібен новий генератор `sales.json` із .xlsx — напиши, я зроблю Python-скрипт.

## Якщо хочеш редагувати локально (необовʼязково)

Знадобиться [Node.js 20+](https://nodejs.org). Команди:

```bash
npm install
npm run dev
```

Відкрий [http://localhost:3000](http://localhost:3000).

## Стек

- Next.js 14 (App Router)
- React 18
- Recharts 2
- Tailwind CSS 3
- Деплой: Vercel (безкоштовний tier)

## Підтримка

Якщо щось зламалось при деплої — найшвидший fix:
1. У Vercel зайди на свій проект → **Deployments**
2. Натисни на останній деплой → **Build Logs**
3. Скопіюй помилку й напиши — допоможу розібратись.
