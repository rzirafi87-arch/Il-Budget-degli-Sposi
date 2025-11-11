import { BABY_SHOWER_META } from "@/features/events/baby-shower/config";
import EventBudgetLayout from "@/features/events/components/EventBudgetLayout";
export default function Page() {
  return <EventBudgetLayout meta={BABY_SHOWER_META} />;
}
