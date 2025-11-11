import { BIRTHDAY_META } from "@/features/events/birthday/config";
import EventBudgetLayout from "@/features/events/components/EventBudgetLayout";
export default function Page() {
  return <EventBudgetLayout meta={BIRTHDAY_META} />;
}
