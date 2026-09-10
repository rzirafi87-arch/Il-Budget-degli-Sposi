import { createHash } from "node:crypto";
import { getServiceClient } from "@/lib/supabaseServer";
import type { CatalogEntityType } from "@/lib/catalogSearch";

export const PLACE_TYPES = ["church","basilica","cathedral","abbey","sanctuary","chapel","mosque","synagogue","temple","place_of_worship","ceremony_place"] as const;
export const LOCATION_TYPES = ["reception_restaurant","villa","reception_hall","event_hotel","resort","agriturismo","castle_historic_house","estate","masseria","event_venue","seaside_venue","other"] as const;
export const SUPPLIER_TYPES = ["photographer","videomaker","florist","wedding_planner","makeup_artist","hair_stylist","music","dj","entertainment","transport","atelier","favors","catering","bakery","rental","lighting","other"] as const;
const email=/^[^\s@]+@[^\s@]+\.[^\s@]+$/, country=/^[a-z]{2}$/;
const clean=(v:unknown,n=200)=>typeof v==="string"?v.trim().slice(0,n):"";
export type ContributionData={name:string;type:string;custom_type?:string;city:string;province:string;region:string;country:string;address?:string;postal_code?:string;website?:string;phone?:string;email?:string;description?:string;reviewer_notes?:string};

export function parseContribution(entityType:CatalogEntityType,input:unknown):ContributionData{
  if(!input||typeof input!=="object")throw new Error("INVALID_BODY"); const v=input as Record<string,unknown>;
  const data:ContributionData={name:clean(v.name,160),type:clean(v.type,80).toLowerCase(),custom_type:clean(v.custom_type,100),city:clean(v.city,100),province:clean(v.province,100),region:clean(v.region,100),country:clean(v.country,2).toLowerCase(),address:clean(v.address,200),postal_code:clean(v.postal_code,20),website:clean(v.website,300),phone:clean(v.phone,40),email:clean(v.email,200),description:clean(v.description,1000),reviewer_notes:clean(v.reviewer_notes,1000)};
  if(!data.name||!data.city||!data.province||!data.region||!country.test(data.country))throw new Error("REQUIRED_FIELDS");
  const allowed=entityType==="church"?PLACE_TYPES:entityType==="location"?LOCATION_TYPES:SUPPLIER_TYPES;
  if(!(allowed as readonly string[]).includes(data.type))throw new Error("INVALID_TYPE");
  if(entityType==="supplier"&&data.type==="other"&&!data.custom_type)throw new Error("CUSTOM_TYPE_REQUIRED");
  if(data.email&&!email.test(data.email))throw new Error("INVALID_EMAIL");
  if(data.website){try{const u=new URL(data.website);if(!["http:","https:"].includes(u.protocol))throw new Error();}catch{throw new Error("INVALID_WEBSITE");}}
  return data;
}
export function contributionFingerprint(entityType:CatalogEntityType,d:ContributionData){return createHash("sha256").update(JSON.stringify([entityType,normalize(d.name),normalize(d.city),normalize(d.address||""),domain(d.website||""),digits(d.phone||"")])).digest("hex");}
const normalize=(v:string)=>v.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const digits=(v:string)=>v.replace(/\D/g,"");
const domain=(v:string)=>{try{return new URL(v).hostname.replace(/^www\./,"");}catch{return "";}};

export async function findDuplicates(entityType:CatalogEntityType,d:ContributionData){
  const db=getServiceClient(); const table=entityType==="church"?"churches":entityType==="location"?"locations":"suppliers";
  const {data,error}=await db.from(table).select("id,name,city,province,address_line,website,phone").eq("country_code",d.country).ilike("city",d.city).ilike("name",`%${d.name}%`).limit(5);
  if(error)throw error; return (data||[]).map((row)=>{const r=row as Record<string,unknown>;let score=normalize(String(r.name))===normalize(d.name)?60:35;if(normalize(String(r.city))===normalize(d.city))score+=20;if(d.address&&normalize(String(r.address_line||""))===normalize(d.address))score+=15;if(d.website&&domain(String(r.website||""))===domain(d.website))score+=20;if(d.phone&&digits(String(r.phone||""))===digits(d.phone))score+=20;return{id:String(r.id),name:String(r.name),city:String(r.city),province:String(r.province||""),score:Math.min(score,100)};}).sort((a,b)=>b.score-a.score);
}
