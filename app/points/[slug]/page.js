import data from "@/data/sales.json";
import CustomerDetail from "@/components/CustomerDetail";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return data.points.map(p => ({ slug: p.slug }));
}

export default function PointPage({ params }) {
  const point = data.points.find(p => p.slug === params.slug);
  if (!point) notFound();
  return (
    <CustomerDetail
      customer={point}
      benchmarks={data.benchmarks}
      weekly={data.weekly}
      weeklyForecastTemp={data.weeklyForecastTemp}
    />
  );
}
