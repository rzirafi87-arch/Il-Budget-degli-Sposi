import events from "@/data/config/events.json";
import themes from "@/data/config/eventCarouselThemes.json";

type EventConfig = (typeof events)[number];
type ThemeConfig = (typeof themes)[number];

const themeMap = new Map<string, ThemeConfig>(themes.map((theme) => [theme.slug, theme]));

export type EventCarouselMeta = {
  slug: string;
  label: string;
  emoji: string;
  group: string;
  available: boolean;
  taglines: string[];
  images: string[];
};

export const EVENT_CAROUSELS: EventCarouselMeta[] = (events as EventConfig[])
  .filter((event) => themeMap.has(event.slug))
  .map((event) => {
    const theme = themeMap.get(event.slug)!;
    return {
      slug: event.slug,
      label: event.label,
      emoji: event.emoji,
      group: event.group,
      available: event.available,
      taglines: theme.taglines ?? [],
      images: Array.from({ length: 3 }, (_, idx) => `/images/carousels/${event.slug}-${idx + 1}.jpg`),
    } satisfies EventCarouselMeta;
  });

export const EVENT_CAROUSEL_IMAGES: Record<string, string[]> = Object.fromEntries(
  EVENT_CAROUSELS.map((event) => [event.slug, event.images]),
);

export function getEventCarouselMeta(slug: string): EventCarouselMeta | undefined {
  return EVENT_CAROUSELS.find((event) => event.slug === slug);
}
