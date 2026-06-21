import { formatCurrency } from "@/lib/utils";
import { Calendar, Clock, TrendingUp } from "lucide-react";

interface Props {
  stats: {
    total:   number;
    pending: number;
    revenue: number;
  };
}

export default function AdminStats({ stats }: Props) {
  const cards = [
    {
      icon:  Calendar,
      label: "Összes foglalás",
      value: stats.total.toString(),
      color: "bg-forest-600",
    },
    {
      icon:  Clock,
      label: "Előlegre vár",
      value: stats.pending.toString(),
      color: "bg-terra-400",
    },
    {
      icon:  TrendingUp,
      label: "Bevétel",
      value: formatCurrency(stats.revenue),
      color: "bg-forest-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {cards.map(({ icon: Icon, label, value, color }) => (
        <div key={label} className="bg-white rounded-2xl shadow-card p-6 flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shrink-0`}>
            <Icon size={22} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-2xl font-serif text-stone-800">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}