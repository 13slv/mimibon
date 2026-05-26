import data from "@/data/sales.json";
import { ProfitabilityDashboard } from "@/components/Profitability";

export default function CustomersPage() {
  return (
    <div className="space-y-4">
      <div className="bg-brand-50 border-l-4 border-brand-500 rounded p-4 text-sm text-gray-700">
        <b>Поріг прибутковості клієнта = 150 кг сировини/міс</b> (за замовчуванням).
        Нижче — кожен клієнт стає економічно невигідним. На цій сторінці видно, хто де знаходиться зараз,
        куди веде сценарій, і що робити з кожним.
      </div>
      <ProfitabilityDashboard customers={data.customers} />
    </div>
  );
}
