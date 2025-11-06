import type { SupabaseClient } from "@supabase/supabase-js";

type GenericClient = SupabaseClient<any, any, any>;

export interface LocalizedSubcategory {
  id: string;
  code: string;
  sort: number;
  name: string;
  locale: string | null;
  fallbackUsed: boolean;
}

export interface LocalizedCategory {
  id: string;
  code: string;
  sort: number;
  name: string;
  locale: string | null;
  fallbackUsed: boolean;
  subcategories: LocalizedSubcategory[];
}

export interface LocalizedTimelineEntry {
  id: string;
  key: string;
  sort: number;
  offsetDays: number;
  title: string;
  description: string | null;
  locale: string | null;
  fallbackUsed: boolean;
}

export const DEFAULT_FALLBACK_LOCALE = "en-GB";

type TranslationMap = Map<string, Map<string, string>>;

type ResolveResult = {
  value: string | null;
  locale: string | null;
  fallbackUsed: boolean;
};

function resolveName(map: TranslationMap, id: string, locale: string, fallbackLocale?: string): ResolveResult {
  const translations = map.get(id);
  if (!translations) {
    return { value: null, locale: null, fallbackUsed: true };
  }
  if (translations.has(locale)) {
    return { value: translations.get(locale) ?? null, locale, fallbackUsed: false };
  }
  if (fallbackLocale && translations.has(fallbackLocale)) {
    return {
      value: translations.get(fallbackLocale) ?? null,
      locale: fallbackLocale,
      fallbackUsed: true,
    };
  }
  const [firstLocale, firstValue] = translations.entries().next().value ?? [null, null];
  if (firstLocale) {
    return { value: firstValue ?? null, locale: firstLocale, fallbackUsed: true };
  }
  return { value: null, locale: null, fallbackUsed: true };
}

export async function fetchLocalizedCategories(
  client: GenericClient,
  params: { eventTypeCode: string; locale: string; fallbackLocale?: string }
): Promise<LocalizedCategory[]> {
  const { eventTypeCode, locale, fallbackLocale = DEFAULT_FALLBACK_LOCALE } = params;

  const { data: eventType, error: eventTypeError } = await client
    .from("app_i18n.event_types")
    .select("id")
    .eq("code", eventTypeCode)
    .maybeSingle();

  if (eventTypeError) {
    throw new Error(`Failed to load event type ${eventTypeCode}: ${eventTypeError.message}`);
  }

  if (!eventType?.id) {
    return [];
  }

  const { data: categories, error: categoriesError } = await client
    .from("app_i18n.categories")
    .select("id, code, sort")
    .eq("event_type_id", eventType.id)
    .order("sort", { ascending: true });

  if (categoriesError) {
    throw new Error(`Failed to load categories for ${eventTypeCode}: ${categoriesError.message}`);
  }

  const categoryList = (categories ?? []) as Array<{ id: string; code: string; sort: number | null }>;

  if (categoryList.length === 0) {
    return [];
  }

  const categoryIds = categoryList.map((category) => category.id);
  const localesToFetch = Array.from(new Set([locale, fallbackLocale]));

  const { data: categoryTranslations, error: categoryTranslationError } = await client
    .from("app_i18n.category_translations")
    .select("category_id, locale, name")
    .in("category_id", categoryIds)
    .in("locale", localesToFetch);

  if (categoryTranslationError) {
    throw new Error(`Failed to load category translations: ${categoryTranslationError.message}`);
  }

  const categoryTranslationMap: TranslationMap = new Map();
  for (const row of categoryTranslations ?? []) {
    if (!categoryTranslationMap.has(row.category_id)) {
      categoryTranslationMap.set(row.category_id, new Map());
    }
    categoryTranslationMap.get(row.category_id)!.set(row.locale, row.name);
  }

  const { data: subcategories, error: subcategoriesError } = await client
    .from("app_i18n.subcategories")
    .select("id, code, sort, category_id")
    .in("category_id", categoryIds)
    .order("sort", { ascending: true });

  if (subcategoriesError) {
    throw new Error(`Failed to load subcategories: ${subcategoriesError.message}`);
  }

  const subcategoryList = (subcategories ?? []) as Array<{
    id: string;
    code: string;
    sort: number | null;
    category_id: string;
  }>;

  const subcategoryIds = subcategoryList.map((subcategory) => subcategory.id);

  let subcategoryTranslations: Array<{ subcategory_id: string; locale: string; name: string }> = [];
  if (subcategoryIds.length > 0) {
    const { data, error } = await client
      .from("app_i18n.subcategory_translations")
      .select("subcategory_id, locale, name")
      .in("subcategory_id", subcategoryIds)
      .in("locale", localesToFetch);

    if (error) {
      throw new Error(`Failed to load subcategory translations: ${error.message}`);
    }

    subcategoryTranslations = data ?? [];
  }

  const subcategoryTranslationMap: TranslationMap = new Map();
  for (const row of subcategoryTranslations ?? []) {
    if (!subcategoryTranslationMap.has(row.subcategory_id)) {
      subcategoryTranslationMap.set(row.subcategory_id, new Map());
    }
    subcategoryTranslationMap.get(row.subcategory_id)!.set(row.locale, row.name);
  }

  const subcategoriesByCategory = new Map<string, Array<(typeof subcategoryList)[number]>>();
  for (const subcategory of subcategoryList) {
    if (!subcategory.category_id) continue;
    if (!subcategoriesByCategory.has(subcategory.category_id)) {
      subcategoriesByCategory.set(subcategory.category_id, []);
    }
    subcategoriesByCategory.get(subcategory.category_id)!.push(subcategory);
  }

  return categoryList.map((category) => {
    const resolvedCategory = resolveName(categoryTranslationMap, category.id, locale, fallbackLocale);

    const localizedSubcategories = (subcategoriesByCategory.get(category.id) ?? []).map((subcategory) => {
      const resolvedSubcategory = resolveName(subcategoryTranslationMap, subcategory.id, locale, fallbackLocale);
      return {
        id: subcategory.id,
        code: subcategory.code,
        sort: subcategory.sort ?? 0,
        name: resolvedSubcategory.value ?? "",
        locale: resolvedSubcategory.locale,
        fallbackUsed: resolvedSubcategory.fallbackUsed,
      } satisfies LocalizedSubcategory;
    });

    return {
      id: category.id,
      code: category.code,
      sort: category.sort ?? 0,
      name: resolvedCategory.value ?? "",
      locale: resolvedCategory.locale,
      fallbackUsed: resolvedCategory.fallbackUsed,
      subcategories: localizedSubcategories,
    } satisfies LocalizedCategory;
  });
}

export async function fetchLocalizedTimeline(
  client: GenericClient,
  params: { eventTypeCode: string; locale: string; fallbackLocale?: string }
): Promise<LocalizedTimelineEntry[]> {
  const { eventTypeCode, locale, fallbackLocale = DEFAULT_FALLBACK_LOCALE } = params;

  const { data: eventType, error: eventTypeError } = await client
    .from("app_i18n.event_types")
    .select("id")
    .eq("code", eventTypeCode)
    .maybeSingle();

  if (eventTypeError) {
    throw new Error(`Failed to load event type ${eventTypeCode}: ${eventTypeError.message}`);
  }

  if (!eventType?.id) {
    return [];
  }

  const { data: entries, error: entriesError } = await client
    .from("app_i18n.event_timelines")
    .select("id, key, sort, offset_days")
    .eq("event_type_id", eventType.id)
    .order("sort", { ascending: true });

  if (entriesError) {
    throw new Error(`Failed to load timeline for ${eventTypeCode}: ${entriesError.message}`);
  }

  const entriesList = (entries ?? []) as Array<{ id: string; key: string; sort: number | null; offset_days: number | null }>;

  if (entriesList.length === 0) {
    return [];
  }

  const entryIds = entriesList.map((entry) => entry.id);
  const localesToFetch = Array.from(new Set([locale, fallbackLocale]));

  let timelineTranslations: Array<{ timeline_id: string; locale: string; title: string; description: string | null }> = [];
  if (entryIds.length > 0) {
    const { data, error } = await client
      .from("app_i18n.event_timeline_translations")
      .select("timeline_id, locale, title, description")
      .in("timeline_id", entryIds)
      .in("locale", localesToFetch);

    if (error) {
      throw new Error(`Failed to load timeline translations: ${error.message}`);
    }

    timelineTranslations = data ?? [];
  }

  const timelineTranslationMap: Map<string, Map<string, { title: string; description: string | null }>> = new Map();
  for (const translation of timelineTranslations) {
    if (!timelineTranslationMap.has(translation.timeline_id)) {
      timelineTranslationMap.set(translation.timeline_id, new Map());
    }
    timelineTranslationMap
      .get(translation.timeline_id)!
      .set(translation.locale, { title: translation.title, description: translation.description });
  }

  return entriesList.map((entry) => {
    const translations = timelineTranslationMap.get(entry.id) ?? new Map();
    let chosenLocale: string | null = null;
    let payload: { title: string; description: string | null } | null = null;
    let fallbackUsed = false;

    if (translations.has(locale)) {
      chosenLocale = locale;
      payload = translations.get(locale)!;
    } else if (fallbackLocale && translations.has(fallbackLocale)) {
      chosenLocale = fallbackLocale;
      payload = translations.get(fallbackLocale)!;
      fallbackUsed = true;
    } else {
      const first = translations.entries().next().value;
      if (first) {
        chosenLocale = first[0];
        payload = first[1];
        fallbackUsed = true;
      }
    }

    return {
      id: entry.id,
      key: entry.key,
      sort: entry.sort ?? 0,
      offsetDays: entry.offset_days ?? 0,
      title: payload?.title ?? "",
      description: payload?.description ?? null,
      locale: chosenLocale,
      fallbackUsed,
    } satisfies LocalizedTimelineEntry;
  });
}
