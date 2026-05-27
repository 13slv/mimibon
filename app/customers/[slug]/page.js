import data from "@/data/sales.json";
import CustomerDetail from "@/components/CustomerDetail";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return data.customers.map(c => ({ slug: c.slug }));
}

export default function CustomerPage({ params }) {
  const customer = data.customers.find(c => c.slug === params.slug);
  if (!customer) notFound();
  return (
    <CustomerDetail
      customer={customer}
      benchmarks={data.benchmarks}
      weekly={data.weekly}
      weeklyForecastTemp={data.weeklyForecastTemp}
    />
  );
}
