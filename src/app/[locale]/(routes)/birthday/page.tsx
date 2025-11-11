import EventBudgetLayout from "@/features/events/components/EventBudgetLayout";
import { BIRTHDAY_META } from "@/features/events/birthday/config";

export const metadata = {
  title: "Birthday",
};

export default function BirthdayPage() {
  return <EventBudgetLayout meta={BIRTHDAY_META} />;
}
