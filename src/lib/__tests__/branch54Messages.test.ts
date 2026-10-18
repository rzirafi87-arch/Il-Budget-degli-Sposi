import fs from "node:fs";
import path from "node:path";
const read = (locale: string) => JSON.parse(fs.readFileSync(path.join(process.cwd(), `src/messages/branch54.${locale}.json`), "utf8")).branch54 as Record<string, string>;
it.each(["it", "en", "es", "fr", "de"])("covers every new journey string and interpolation in %s", locale => {
  const messages = read(locale);
  expect(Object.keys(messages).sort()).toEqual(Object.keys(read("en")).sort());
  for (const [key, value] of Object.entries(messages)) {
    expect(value.trim()).not.toBe("");
    expect(value.match(/\{\w+\}/g)).toEqual(read("en")[key].match(/\{\w+\}/g));
  }
});
