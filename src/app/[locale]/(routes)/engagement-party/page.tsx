import EventBudgetLayout from "@/features/events/components/EventBudgetLayout";
import { ENGAGEMENT_PARTY_META } from "@/features/events/engagement-party/config";

export const metadata = {
  title: "Engagement Party",
};

export default function EngagementPartyPage() {
  return <EventBudgetLayout meta={ENGAGEMENT_PARTY_META} />;
}
