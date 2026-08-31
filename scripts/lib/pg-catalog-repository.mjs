import pg from "pg";

const TABLES = { church: "churches", location: "locations", supplier: "suppliers" };
const NON_COLUMNS = { church: new Set(["slug"]), location: new Set(["slug"]), supplier: new Set(["slug", "normalized_address"]) };
export class PgCatalogRepository {
  constructor(client) { this.client = client; }
  static async connect(connectionString) { const client = new pg.Client({ connectionString }); await client.connect(); return new PgCatalogRepository(client); }
  async begin() { await this.client.query("begin"); }
  async commit() { await this.client.query("commit"); }
  async rollback() { await this.client.query("rollback"); }
  async close() { await this.client.end(); }
  async findDuplicate(type, record) {
    const table = TABLES[type];
    const addressColumn = type === "supplier" ? "public.normalize_catalog_text(address_line)" : "normalized_address";
    const strong = await this.client.query(`select * from public.${table} where (source=$1 and external_id=$2) or ($3::text is not null and phone=$3) or ($4::text is not null and website=$4) or (normalized_name=$5 and ${addressColumn} is not null and ${addressColumn}=$6 and lower(city)=lower($7)) limit 2`, [record.source, record.external_id, record.phone, record.website, record.normalized_name, record.normalized_address, record.city]);
    if (strong.rowCount) return { kind: "strong", record: strong.rows[0] };
    const ambiguous = await this.client.query(`select id from public.${table} where normalized_name=$1 and lower(city)=lower($2) limit 10`, [record.normalized_name, record.city]);
    return ambiguous.rowCount ? { kind: "ambiguous", records: ambiguous.rows } : { kind: "none", records: [] };
  }
  async upsert(type, record) {
    const table = TABLES[type]; const entries = Object.entries(record).filter(([key]) => !NON_COLUMNS[type].has(key));
    const columns = entries.map(([key]) => key); const values = entries.map(([, value]) => value); const params = values.map((_, index) => `$${index + 1}`).join(",");
    const updates = columns.filter((column) => !["id", "source", "external_id", "created_at", "updated_at"].includes(column)).map((column) => `${column}=excluded.${column}`).concat("updated_at=now()").join(",");
    const result = await this.client.query(`insert into public.${table}(${columns.join(",")}) values(${params}) on conflict(source,external_id) where external_id is not null do update set ${updates} returning *`, values); return result.rows[0];
  }
  async recordProvenance(record) {
    await this.client.query(`insert into public.catalog_provenance(entity_type,entity_id,external_key,source_type,source_name,source_url,external_id,imported_at,last_seen_at,raw_fingerprint,metadata) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) on conflict(entity_type,source_type,source_name,external_id) do update set entity_id=excluded.entity_id,external_key=excluded.external_key,source_url=excluded.source_url,last_seen_at=excluded.last_seen_at,raw_fingerprint=excluded.raw_fingerprint,metadata=excluded.metadata`, [record.entity_type, record.entity_id, record.external_key, record.source_type, record.source_name, record.source_url, record.external_id, record.imported_at, record.last_seen_at, record.raw_fingerprint, record.metadata]);
  }
}
