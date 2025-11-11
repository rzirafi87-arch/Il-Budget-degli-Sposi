import EventBudgetLayout from "@/features/events/components/EventBudgetLayout";
import { BABY_SHOWER_META } from "@/features/events/baby-shower/config";

export const metadata = {
  title: "Baby Shower",
};

export default function BabyShowerPage() {
  return <EventBudgetLayout meta={BABY_SHOWER_META} />;
}
