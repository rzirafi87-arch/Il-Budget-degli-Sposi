// Shared types for event templates

export interface EventSubcategory {
  name: string;
  description?: string;
  estimated_cost?: number;
}

export interface EventCategory {
  name: string;
  icon?: string;
  budgetPercent?: number;
  subcategories: EventSubcategory[];
}

export interface TimelineItem {
  title: string;
  description?: string;
  days_before?: number | null;
}

export interface TimelinePhase {
  phase: string;
  items: TimelineItem[];
}

export interface EventTemplate {
  eventType: string;
  name: string;
  colorTheme: string[];
  totalBudget: number;
  description: string;
  categories: EventCategory[];
  timeline: TimelinePhase[];
  fields?: string[];
  tags?: string[];
  variants?: unknown;
  extraFields?: unknown;
}
