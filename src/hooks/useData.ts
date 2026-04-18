import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("categories")
      .select("id, name")
      .order("id")
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
        supabase.from("categories").select("id, name").order("id"),
        supabase.from("subcategories").select("id, name, category_id").order("id"),
        supabase.from("product_types").select("id, name, subcategory_id").order("id"),
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
