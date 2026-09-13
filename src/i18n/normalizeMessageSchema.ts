type Messages = Record<string, unknown>;

function isRecord(value: unknown): value is Messages {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function cloneMessages(messages: Messages): Messages {
  return JSON.parse(JSON.stringify(messages)) as Messages;
}

function getPath(root: Messages, path: string): unknown {
  return path.split(".").reduce<unknown>((value, part) => isRecord(value) ? value[part] : undefined, root);
}

function setPath(root: Messages, path: string, value: unknown) {
  const parts = path.split(".");
  let cursor = root;
  parts.slice(0, -1).forEach((part) => {
    if (!isRecord(cursor[part])) cursor[part] = {};
    cursor = cursor[part] as Messages;
  });
  cursor[parts.at(-1)!] = value;
}

function deletePath(root: Messages, path: string) {
  const parts = path.split(".");
  const parents: Array<{ parent: Messages; key: string }> = [];
  let cursor: Messages | undefined = root;
  for (const part of parts.slice(0, -1)) {
    if (!cursor || !isRecord(cursor[part])) return;
    parents.push({ parent: cursor, key: part });
    cursor = cursor[part] as Messages;
  }
  if (!cursor) return;
  delete cursor[parts.at(-1)!];
  for (let index = parents.length - 1; index >= 0; index -= 1) {
    const { parent, key } = parents[index];
    if (isRecord(parent[key]) && Object.keys(parent[key] as Messages).length === 0) delete parent[key];
    else break;
  }
}

function movePath(root: Messages, from: string, to: string, options?: { force?: boolean }) {
  const value = getPath(root, from);
  if (value === undefined) return;
  const destination = getPath(root, to);
  if (options?.force || destination === undefined || (!isRecord(destination) && isRecord(value))) {
    setPath(root, to, value);
  }
  deletePath(root, from);
}

/**
 * Branch 46 compatibility normalizer.
 *
 * Historical non-Italian bundles contain already-translated copy under an older
 * namespace layout. Moving that copy at load time keeps one translation source,
 * aligns runtime messages with the Italian canonical schema and avoids copying
 * hundreds of strings merely to change their JSON path.
 */
export function normalizeMessageSchema(messages: Messages): Messages {
  const normalized = cloneMessages(messages);

  movePath(normalized, "home.hero.subtitleHtml", "home.hero.subtitle");
  movePath(normalized, "home.usp.budgetUi.cards", "home.usp.cards");

  const moves: Array<[string, string]> = [
    ["home.usp.demo", "home.demo"],
    ["home.usp.privacy", "home.privacy"],
    ["home.usp.finalCta", "home.finalCta"],
    ["home.usp.floatingMenu", "home.floatingMenu"],
    ["home.usp.dashboard", "home.dashboard"],
    ["home.budgetUi", "budgetUi"],
    ["home.pageInfoNote", "pageInfoNote"],
    ["home.suppliersUi", "suppliersUi"],
    ["home.howItWorks", "howItWorks"],
    ["home.about", "about"],
    ["home.policies", "policies"],
  ];
  moves.forEach(([from, to]) => movePath(normalized, from, to, { force: isRecord(getPath(normalized, from)) }));

  movePath(normalized, "home.privacy.textHtml", "home.privacy.text");

  return normalized;
}
