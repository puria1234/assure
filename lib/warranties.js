// Free plan ceilings. Previously duplicated in firestore.rules; now the API is
// the only path to the data, so this is the single enforcement point.
export const LIMITS = { warranties: 5, scans: 3, claims: 1 };

/**
 * Postgres row to the camelCase shape the dashboard renders.
 * Dates come back as DATE columns, which pg hands over as JS Date objects in
 * the server's timezone. The UI does its own local-midnight arithmetic on
 * 'YYYY-MM-DD' strings, so normalise here rather than leaking Date objects.
 */
export function toApi(row) {
  if (!row) return null;
  const day = (v) => {
    if (!v) return '';
    if (typeof v === 'string') return v.slice(0, 10);
    return `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(v.getDate()).padStart(2, '0')}`;
  };
  return {
    id: row.id,
    productName: row.product_name,
    brand: row.brand ?? '',
    category: row.category ?? '',
    purchaseDate: day(row.purchase_date),
    expiryDate: day(row.expiry_date),
    price: row.price == null ? '' : String(row.price),
    retailer: row.retailer ?? '',
    serial: row.serial ?? '',
    notes: row.notes ?? '',
    receiptUrl: row.receipt_url ?? '',
    // Uploads are accept="image/*" only, so a stored column would always hold
    // the same constant. Derive it; add a column if PDFs are ever supported.
    receiptType: row.receipt_url ? 'image' : '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Columns a client is allowed to write, mapped from their camelCase names. */
export const WRITABLE = {
  productName: 'product_name',
  brand: 'brand',
  category: 'category',
  purchaseDate: 'purchase_date',
  expiryDate: 'expiry_date',
  price: 'price',
  retailer: 'retailer',
  serial: 'serial',
  notes: 'notes',
  receiptUrl: 'receipt_url',
};

/** Empty strings arrive from the form for untouched optional fields. */
export function normalise(key, value) {
  if (value === '' || value === undefined) return null;
  if (key === 'price') {
    const n = Number(String(value).replace(/[^0-9.]/g, ''));
    return Number.isFinite(n) ? n : null;
  }
  return value;
}
