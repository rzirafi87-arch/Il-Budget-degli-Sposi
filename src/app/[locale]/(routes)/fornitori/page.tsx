"use client";

import { CatalogMap } from "@/components/catalog/CatalogMap";
import { CurrentPosition, NearMeButton } from "@/components/catalog/NearMeButton";
import { AppButton } from "@/components/ui/AppButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import type { CatalogSearchResult, CatalogSort } from "@/lib/catalogSearch";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { Heart, Search, Store } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type Saved = { id:string; supplier_id:string; status:string; favorite:boolean };
type Pagination = { page:number; pageSize:number; total:number; totalPages:number };
const categories = ["wedding_planner","catering","photographer","videomaker","florist","dj","band","ceremony_music","reception_music","entertainment","decor","lighting","pastry","wedding_cake","favors","invitations","graphic_design","atelier","bride_attire","groom_attire","makeup","hairdresser","car","transfer","rental","babysitting","honeymoon","other"];

export default function SuppliersPage() {
  const t = useTranslations("catalogSearch");
  const [items,setItems]=useState<CatalogSearchResult[]>([]), [saved,setSaved]=useState<Saved[]>([]);
  const [q,setQ]=useState(""), [category,setCategory]=useState(""), [verification,setVerification]=useState("");
  const [city,setCity]=useState(""), [province,setProvince]=useState(""), [region,setRegion]=useState("");
  const [position,setPosition]=useState<CurrentPosition|null>(null), [radius,setRadius]=useState("50");
  const [sort,setSort]=useState<CatalogSort>("RELEVANCE"), [page,setPage]=useState(1);
  const [pagination,setPagination]=useState<Pagination>({page:1,pageSize:12,total:0,totalPages:1});
  const [loading,setLoading]=useState(true), [selectedId,setSelectedId]=useState<string|null>(null), [mapMode,setMapMode]=useState(false);

  async function load(next=page, currentPosition=position) {
    setLoading(true);
    const p=new URLSearchParams({entityType:"supplier",page:String(next),pageSize:"12",sort:currentPosition&&sort==="NEAREST"?"NEAREST":sort});
    if(q)p.set("q",q); if(category)p.set("category",category); if(verification)p.set("verification",verification);
    if(city)p.set("city",city); if(province)p.set("province",province); if(region)p.set("region",region);
    if(currentPosition){p.set("latitude",String(currentPosition.latitude));p.set("longitude",String(currentPosition.longitude));p.set("radius",radius);}
    const response=await fetch(`/api/catalog/search?${p}`,{cache:"no-store"});
    const body=await response.json();
    setItems(body.results||[]); setPagination(body.pagination||{page:next,pageSize:12,total:0,totalPages:1});
    setPage(next); setLoading(false);
    const shareable=new URLSearchParams(p); shareable.delete("latitude");shareable.delete("longitude");shareable.delete("radius");shareable.delete("entityType");shareable.delete("pageSize");
    window.history.replaceState(null,"",`?${shareable}`);
  }

  useEffect(()=>{ async function initial(){
    const params=new URLSearchParams(window.location.search); setQ(params.get("q")||"");setCategory(params.get("category")||"");setCity(params.get("city")||"");setProvince(params.get("province")||"");setRegion(params.get("region")||"");setVerification(params.get("verification")||"");
    const initialParams=new URLSearchParams(params); initialParams.set("entityType","supplier"); initialParams.set("pageSize","12");
    const publicRequest=fetch(`/api/catalog/search?${initialParams}`).then(r=>r.json());
    const {data}=await getBrowserClient().auth.getSession(); const jwt=data.session?.access_token;
    const privateRequest=jwt?fetch("/api/my/suppliers",{headers:{authorization:`Bearer ${jwt}`}}).then(r=>r.ok?r.json():null):Promise.resolve(null);
    const [catalog,privateData]=await Promise.all([publicRequest,privateRequest]);setItems(catalog.results||[]);setPagination(catalog.pagination||{page:1,pageSize:12,total:0,totalPages:1});setPage(Number(params.get("page"))||1);setSaved(privateData?.savedSuppliers||[]);setLoading(false);
  } void initial(); },[]);

  function submit(e:FormEvent){e.preventDefault();void load(1);}
  function located(next:CurrentPosition){setPosition(next);setSort("NEAREST");void load(1,next);}
  const savedBy=(id:string)=>saved.find(s=>s.supplier_id===id);
  async function toggle(id:string){const current=savedBy(id);const {data}=await getBrowserClient().auth.getSession();const token=data.session?.access_token;if(!token)return;const r=await fetch(current?`/api/my/suppliers?id=${current.id}`:"/api/my/suppliers",{method:current?"DELETE":"POST",headers:{"content-type":"application/json",authorization:`Bearer ${token}`},body:current?undefined:JSON.stringify({supplier_id:id})});if(r.ok){if(current)setSaved(v=>v.filter(s=>s.id!==current.id));else{const j=await r.json();setSaved(v=>[...v,j.savedSupplier]);}}}

  return <section className="space-y-6"><PageHeader eyebrow="Catalogo globale verificabile" title="Fornitori" description="Cerca professionisti per nome, categoria e area geografica." icon={<Store size={24} aria-hidden/>}/>
    <form onSubmit={submit} className="app-card app-card--md grid gap-3 lg:grid-cols-4">
      <label className="lg:col-span-2"><span className="sr-only">Cerca</span><input className="app-input w-full" value={q} onChange={e=>setQ(e.target.value)} placeholder="Nome, città, provincia, regione o categoria"/></label>
      <select className="app-select" value={category} onChange={e=>setCategory(e.target.value)} aria-label="Categoria"><option value="">Tutte le categorie</option>{categories.map(c=><option key={c} value={c}>{c.replaceAll("_"," ")}</option>)}</select>
      <select className="app-select" value={verification} onChange={e=>setVerification(e.target.value)} aria-label={t("verification")}><option value="">{t("all")}</option><option>VERIFIED</option><option>PROBABLE</option><option>TO_CHECK</option></select>
      <input className="app-input" value={city} onChange={e=>setCity(e.target.value)} placeholder="Città" aria-label="Città"/>
      <input className="app-input" value={province} onChange={e=>setProvince(e.target.value)} placeholder={t("province")} aria-label={t("province")}/>
      <input className="app-input" value={region} onChange={e=>setRegion(e.target.value)} placeholder={t("region")} aria-label={t("region")}/>
      <select className="app-select" value={sort} onChange={e=>setSort(e.target.value as CatalogSort)} aria-label={t("sort")}><option value="RELEVANCE">{t("relevance")}</option><option value="VERIFIED_FIRST">{t("verifiedFirst")}</option><option value="NAME_ASC">{t("name")}</option>{position?<option value="NEAREST">{t("nearest")}</option>:null}</select>
      <div className="flex flex-wrap gap-2 lg:col-span-4"><NearMeButton onPosition={located} label={t("nearMe")} unavailableLabel={t("positionUnavailable")}/>{position?<label className="flex items-center gap-2 text-sm">{t("radius")}<select className="app-select" value={radius} onChange={e=>setRadius(e.target.value)}><option value="10">10 km</option><option value="25">25 km</option><option value="50">50 km</option><option value="100">100 km</option></select></label>:null}<AppButton type="submit"><Search size={16} aria-hidden/> Cerca</AppButton></div>
    </form>
    {items.some(i=>i.latitude!==null)?<div className="flex gap-2 md:hidden"><AppButton variant={!mapMode?"primary":"outline"} onClick={()=>setMapMode(false)}>{t("list")}</AppButton><AppButton variant={mapMode?"primary":"outline"} onClick={()=>setMapMode(true)}>{t("map")}</AppButton></div>:null}
    {mapMode?<CatalogMap results={items} selectedId={selectedId} onSelect={setSelectedId}/>:null}
    <div className="hidden md:block"><CatalogMap results={items} selectedId={selectedId} onSelect={setSelectedId}/></div>
    {!mapMode?(loading?<p aria-live="polite">Caricamento…</p>:items.length===0?<EmptyState icon={<Search/>} title="Nessun fornitore trovato" description="Modifica i filtri per ampliare la ricerca."/>:<ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{items.map(s=><li id={`catalog-${s.id}`} key={s.id} onClick={()=>setSelectedId(s.id)} className={`app-card app-card--md ${selectedId===s.id?"ring-2 ring-[#8d3f63]":""}`}><div className="flex justify-between gap-3"><div><h2 className="font-semibold text-lg">{s.name}</h2>{s.category&&<p className="text-sm capitalize">{s.category.replaceAll("_"," ")}</p>}</div><button onClick={e=>{e.stopPropagation();void toggle(s.id)}} aria-label={savedBy(s.id)?"Rimuovi dai salvati":"Salva fornitore"} className={savedBy(s.id)?"text-red-600":"text-gray-500"}><Heart fill={savedBy(s.id)?"currentColor":"none"}/></button></div><p className="mt-2 text-sm text-gray-600">{[s.city,s.province,s.region].filter(Boolean).join(", ")}</p><p className="mt-2 text-xs font-semibold">{s.verificationStatus}</p>{s.distanceKm!==null?<p className="text-sm">{t("distance",{distance:s.distanceKm})}</p>:position?<p className="text-sm text-gray-500">{t("distanceUnavailable")}</p>:null}<Link className="mt-3 inline-block text-sm underline" href={`fornitori/${s.id}`}>Dettaglio</Link></li>)}</ul>):null}
    <nav className="flex items-center justify-center gap-3" aria-label="Paginazione"><AppButton variant="outline" disabled={page<=1} onClick={()=>void load(page-1)}>Precedente</AppButton><span>{page}/{pagination.totalPages}</span><AppButton variant="outline" disabled={page>=pagination.totalPages} onClick={()=>void load(page+1)}>Successiva</AppButton></nav>
  </section>;
}
