#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const eventsPath = path.resolve(__dirname, "../src/data/config/events.json");
const themesPath = path.resolve(__dirname, "../src/data/config/eventCarouselThemes.json");

const events = JSON.parse(await fs.readFile(eventsPath, "utf8"));
const themes = JSON.parse(await fs.readFile(themesPath, "utf8"));

const WIDTH = 1280;
const HEIGHT = 720;
const OUTPUT_DIR = path.resolve("public/images/carousels");

await fs.mkdir(OUTPUT_DIR, { recursive: true });

const themeBySlug = new Map(themes.map((theme) => [theme.slug, theme]));

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function wrapText(value, maxChars = 36) {
  const words = value.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  for (const word of words) {
    const tentative = current ? `${current} ${word}` : word;
    if (tentative.length <= maxChars) {
      current = tentative;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function hexToRgb(hex) {
  const clean = hex.replace(/[^0-9a-fA-F]/g, "");
  const value = clean.length === 3
    ? clean.split("").map((ch) => ch + ch).join("")
    : clean.padEnd(6, "f");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return { r, g, b };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b]
    .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
    .join("")}`;
}

function lighten(hex, amount) {
  const base = hexToRgb(hex);
  const target = { r: 255, g: 255, b: 255 };
  return rgbToHex({
    r: base.r + (target.r - base.r) * amount,
    g: base.g + (target.g - base.g) * amount,
    b: base.b + (target.b - base.b) * amount,
  });
}

function buildSvg({
  gradient,
  accents,
  text,
  emoji,
  label,
  tagline,
  variant,
}) {
  const [gradStart, gradEnd] = gradient;
  const accentElements = (accents ?? []).map((color, idx) => {
    const radius = HEIGHT * (0.7 - idx * 0.12);
    const cx = WIDTH * (0.28 + idx * 0.28 + (variant - 1) * 0.04);
    const cy = HEIGHT * (0.4 + idx * 0.18 + (variant - 1) * 0.03);
    const opacity = Math.max(0.12, 0.34 - idx * 0.07);
    const blur = 220 + idx * 80;
    return `
      <g filter="url(#blur-${idx})">
        <circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${radius.toFixed(2)}" fill="${color}" fill-opacity="${opacity.toFixed(2)}" />
      </g>
      <defs>
        <filter id="blur-${idx}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="${blur.toFixed(2)}" />
        </filter>
      </defs>
    `;
  }).join("");

  const arcElements = (accents ?? []).slice(0, 2).map((color, idx) => {
    const offsetX = WIDTH * (0.12 + idx * 0.18 + variant * 0.02);
    const offsetY = HEIGHT * (0.62 + idx * 0.08);
    const width = WIDTH * (0.55 + idx * 0.1);
    return `<path d="M${offsetX.toFixed(2)},${offsetY.toFixed(2)} C${(offsetX + width * 0.3).toFixed(2)},${(offsetY - 80 - idx * 20).toFixed(2)} ${(offsetX + width * 0.7).toFixed(2)},${(offsetY + 120 + idx * 35).toFixed(2)} ${(offsetX + width).toFixed(2)},${(offsetY - 40).toFixed(2)}" stroke="${color}" stroke-opacity="0.35" stroke-width="22" stroke-linecap="round" fill="none" />`;
  }).join("");

  const taglineLines = wrapText(tagline, 34);
  const textColor = text ?? "#1f2937";
  const subtitleColor = lighten(textColor, 0.22);
  const taglineSpans = taglineLines
    .map((line, idx) => `<tspan x="96" dy="${idx === 0 ? 0 : 54}">${escapeXml(line)}</tspan>`)
    .join("");

  const brandRectWidth = 420;
  const brandRectHeight = 68;
  const brandX = 96;
  const brandY = HEIGHT - 96 - brandRectHeight;

  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${gradStart}" />
        <stop offset="100%" stop-color="${gradEnd}" />
      </linearGradient>
      <linearGradient id="overlay" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#000000" stop-opacity="0.38" />
        <stop offset="55%" stop-color="#000000" stop-opacity="0.12" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0.55" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)" />
    ${accentElements}
    ${arcElements}
    <rect width="100%" height="100%" fill="url(#overlay)" opacity="0.35" />

    <text x="96" y="160" font-family="'DM Sans','Montserrat','Helvetica Neue',sans-serif" font-size="76" font-weight="700" fill="${textColor}">
      ${escapeXml(`${emoji || "✨"}  ${label}`)}
    </text>
    <text x="96" y="228" font-family="'DM Sans','Source Sans Pro','Arial',sans-serif" font-size="42" fill="${subtitleColor}" letter-spacing="0.01em">
      ${taglineSpans}
    </text>
    <rect x="${brandX}" y="${brandY}" width="${brandRectWidth}" height="${brandRectHeight}" rx="34" fill="${textColor}20" stroke="${textColor}55" stroke-width="2" />
    <text x="${brandX + 40}" y="${brandY + 44}" font-family="'DM Sans','Montserrat','Helvetica Neue',sans-serif" font-size="28" font-weight="600" fill="${textColor}" letter-spacing="0.18em">
      IL BUDGET DEGLI SPOSI
    </text>
  </svg>`;
}

for (const event of events) {
  const theme = themeBySlug.get(event.slug);
  if (!theme) {
    console.warn(`Skipping ${event.slug} (no theme)`);
    continue;
  }
  const taglines = (theme.taglines && theme.taglines.length > 0)
    ? theme.taglines
    : [event.label];

  for (let idx = 0; idx < 3; idx += 1) {
    const tagline = taglines[idx % taglines.length];
    const svg = buildSvg({
      gradient: theme.gradient ?? ["#f5f5f5", "#d4d4d4"],
      accents: theme.accents ?? [],
      text: theme.text ?? "#1f2937",
      emoji: event.emoji ?? "✨",
      label: event.label,
      tagline,
      variant: idx,
    });

    const outputName = `${event.slug}-${idx + 1}.jpg`;
    const outputPath = path.join(OUTPUT_DIR, outputName);

    await sharp(Buffer.from(svg))
      .jpeg({ quality: 90, progressive: true })
      .toFile(outputPath);

    console.log(`created ${outputName}`);
  }
}
