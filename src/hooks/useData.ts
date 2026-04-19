import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("categories")
      .select("id, name, image_url")
      .is("deleted_at", null)
      .order("sort_order")
      .order("name")
      .then(({ data }) => {
        setCategories(data || []);
        setLoading(false);
      });
  }, []);

  return { categories, loading };
}

export function useProducts() {
  const [products, setProducts] = useState<CategoryWithProducts[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      const [catRes, subRes, ptRes] = await Promise.all([
        supabase.from("categories").select("id, name, image_url").is("deleted_at", null).order("sort_order").order("name"),
        supabase.from("subcategories").select("id, name, category_id").is("deleted_at", null).order("sort_order").order("name"),
        supabase.from("product_types").select("id, name, subcategory_id, image_url").is("deleted_at", null).order("name"),
      ]);

      const cats = catRes.data || [];
      const subs = subRes.data || [];
      const pts = ptRes.data || [];

      const result: CategoryWithProducts[] = cats.map((cat) => ({
        ...cat,
        subCategories: subs
          .filter((sc) => sc.category_id === cat.id)
          .map((sc) => ({
            id: sc.id,
            name: sc.name,
            productTypes: pts.filter((pt) => pt.subcategory_id === sc.id).map((pt) => ({
              id: pt.id,
              name: pt.name,
              image_url: pt.image_url,
            })),
          })),
      }));

      setProducts(result);
      setLoading(false);
    }

    fetchAll();
  }, []);

  return { products, loading };
}
