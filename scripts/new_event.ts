import fs from "fs";
import path from "path";

const name = process.argv[2];
if (!name) {
  console.error("Usage: ts-node scripts/new_event.ts <kebab-name>");
  process.exit(1);
}

const pascal = name
  .split("-")
  .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
  .join("");
const constant = pascal.toUpperCase();

const featureDir = path.join("src/features/events", name);
fs.mkdirSync(featureDir, { recursive: true });

const configContent = `import type { EventMeta } from "@/features/events/types";

export const ${constant}_META: EventMeta = {
  key: "${name}",
  defaultCurrency: "EUR",
  sections: [
    {
      id: "core",
      label: "Core",
      categories: [
        { id: "venue", label: "Venue" },
        { id: "decor", label: "Decor" },
        { id: "music", label: "Music" }
      ]
    }
  ],
  timeline: [
    { id: "plan", label: "Planning", offsetDays: -30 },
    { id: "event", label: "Event day", offsetDays: 0 }
  ]
};
`;

fs.writeFileSync(path.join(featureDir, "config.ts"), configContent);

const routeDir = path.join("src/app/[locale]/(routes)", name);
fs.mkdirSync(routeDir, { recursive: true });

const pageContent = `import EventBudgetLayout from "@/features/events/components/EventBudgetLayout";
import { ${constant}_META } from "@/features/events/${name}/config";

export const metadata = {
  title: "${pascal.replace(/([A-Z])/g, " $1").trim()}",
};

export default function ${pascal}Page() {
  return <EventBudgetLayout meta={${constant}_META} />;
}
`;

fs.writeFileSync(path.join(routeDir, "page.tsx"), pageContent);

console.log(`Event scaffolded: ${name}`);
