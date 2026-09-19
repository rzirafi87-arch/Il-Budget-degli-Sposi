import type { Database } from "@/types/database.types";

type LocationRow = Database["public"]["Tables"]["locations"]["Row"];

export type LocationDetail = Pick<
  LocationRow,
  | "id" | "name" | "venue_type" | "subtype" | "description"
  | "address_line" | "city" | "province" | "region" | "postal_code" | "country_code"
  | "phone" | "email" | "website" | "instagram_url" | "facebook_url"
  | "capacity_min" | "capacity_max" | "accommodation_available"
  | "catering_internal" | "catering_external_allowed" | "parking" | "accessibility"
  | "outdoor_space" | "indoor_space" | "price_range_min" | "price_range_max"
  | "currency" | "verification_status"
>;

export const LOCATION_DETAIL_PROJECTION = "id,name,venue_type,subtype,description,address_line,city,province,region,postal_code,country_code,phone,email,website,instagram_url,facebook_url,capacity_min,capacity_max,accommodation_available,catering_internal,catering_external_allowed,parking,accessibility,outdoor_space,indoor_space,price_range_min,price_range_max,currency,verification_status";
