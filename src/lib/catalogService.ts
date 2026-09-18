import { supabaseFetch } from './supabaseClient';
import seedCatalogData from './seedCatalog.json';

export interface CatalogItem {
  id: string;
  name: string;
  price: number;
  img?: string;
  category_id?: string;
  category?: string;
  subcategory?: string;
}

export interface CatalogCategory {
  id: string;
  name: string;
}

export async function fetchCatalog(): Promise<CatalogItem[]> {
  let data: any = null;

  // 1. Try Supabase with subcategory
  const resWithSubcat = await supabaseFetch('items?select=id,name,price,img_url,category_id,subcategory,categories(name)&order=name.asc');
  if (resWithSubcat.data && !resWithSubcat.error) {
    data = resWithSubcat.data;
  } else {
    // 2. If subcategory doesn't exist yet on Supabase schema cache, fallback to query without subcategory
    const resWithoutSubcat = await supabaseFetch('items?select=id,name,price,img_url,category_id,categories(name)&order=name.asc');
    if (resWithoutSubcat.data && !resWithoutSubcat.error) {
      data = resWithoutSubcat.data;
    }
  }

  // 3. If Supabase returned items (database is seeded and has rows)
  if (data && Array.isArray(data) && data.length > 0) {
    const items: CatalogItem[] = data.map((item: any) => ({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      img: item.img_url || "",
      category_id: item.category_id,
      category: item.categories?.name || "بدون قسم",
      subcategory: item.subcategory || "عام"
    }));

    try {
      localStorage.setItem("khcf_catalog_cache_v2", JSON.stringify(items));
    } catch (_) {}

    return items;
  }

  // 4. If Supabase table is empty, check localStorage custom items
  try {
    const custom = localStorage.getItem("khcf_catalog_custom");
    if (custom) {
      const parsed = JSON.parse(custom);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}

  // 5. Fallback directly to the official 737 items from 006_seed_catalog.sql
  const fallback = seedCatalogData.items as CatalogItem[];
  try {
    // Remove old stale cache of 633 items from browser storage
    localStorage.removeItem("khcf_catalog_cache");
    localStorage.setItem("khcf_catalog_cache_v2", JSON.stringify(fallback));
  } catch (_) {}
  return fallback;
}

function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function persistItemLocally(item: any, isDelete = false) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem("khcf_catalog_custom") || localStorage.getItem("khcf_catalog_cache_v2");
    let list: CatalogItem[] = raw ? JSON.parse(raw) : [...(seedCatalogData.items as CatalogItem[])];
    if (isDelete) {
      list = list.filter(i => i.id !== item.id);
    } else {
      const idx = list.findIndex(i => i.id === item.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...item };
      } else {
        list.unshift(item);
      }
    }
    localStorage.setItem("khcf_catalog_custom", JSON.stringify(list));
    localStorage.setItem("khcf_catalog_cache_v2", JSON.stringify(list));
  } catch (e) {
    console.warn("Local catalog persist warning:", e);
  }
}

export async function fetchCategories(): Promise<CatalogCategory[]> {
  const { data, error } = await supabaseFetch('categories?select=id,name&order=name.asc');
  if (error || !data || !Array.isArray(data) || data.length === 0) {
    return seedCatalogData.categories.map((name, idx) => ({
      id: `c0000000-0000-0000-0000-${String(idx + 1).padStart(12, '0')}`,
      name
    }));
  }
  return data;
}

export async function updateCatalogItem(item: {
  id: string;
  name: string;
  price: number;
  category_id?: string;
  subcategory?: string;
  img?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  // Always persist locally first so UI and cache immediately update
  persistItemLocally(item);

  // If item.id is not a valid UUID, don't send invalid syntax to Supabase
  if (!isUUID(item.id)) {
    return { success: true, data: item };
  }

  const payload: any = {
    name: item.name,
    price: Number(item.price),
    img_url: item.img || ""
  };
  if (item.category_id && isUUID(item.category_id)) {
    payload.category_id = item.category_id;
  }
  if (item.subcategory !== undefined) {
    payload.subcategory = item.subcategory;
  }

  try {
    const { data, error } = await supabaseFetch(`items?id=eq.${item.id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });

    if (error) {
      console.warn("Notice: Supabase remote update skipped or unseeded, saved locally:", error);
      return { success: true, data: item };
    }

    return { success: true, data: data?.[0] || item };
  } catch (err) {
    return { success: true, data: item };
  }
}

export async function createCatalogItem(item: {
  name: string;
  price: number;
  category_id: string;
  subcategory?: string;
  img?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  const newId = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'f0000000-0000-0000-0000-' + String(Date.now()).slice(-12).padStart(12, '0');

  const newItem: CatalogItem = {
    id: newId,
    name: item.name,
    price: Number(item.price),
    category_id: item.category_id,
    subcategory: item.subcategory || "عام",
    img: item.img || "/shop_logo.png"
  };

  persistItemLocally(newItem);

  if (isUUID(item.category_id)) {
    try {
      const payload: any = {
        id: newId,
        name: item.name,
        price: Number(item.price),
        category_id: item.category_id,
        subcategory: item.subcategory || "عام",
        img_url: item.img || ""
      };

      const { data, error } = await supabaseFetch('items', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (!error && data) {
        return { success: true, data: data?.[0] || newItem };
      }
    } catch (_) {}
  }

  return { success: true, data: newItem };
}

export async function deleteCatalogItem(id: string): Promise<{ success: boolean; error?: string }> {
  persistItemLocally({ id }, true);

  if (isUUID(id)) {
    try {
      await supabaseFetch(`items?id=eq.${id}`, {
        method: 'DELETE'
      });
    } catch (_) {}
  }

  return { success: true };
}

