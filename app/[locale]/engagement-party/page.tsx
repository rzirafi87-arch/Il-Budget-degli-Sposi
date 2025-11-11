import { ENGAGEMENT_PARTY_META } from "@/features/events/engagement-party/config";
import EventBudgetLayout from "@/features/events/components/EventBudgetLayout";
export default function Page() {
  return <EventBudgetLayout meta={ENGAGEMENT_PARTY_META} />;
}
