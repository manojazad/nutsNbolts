import { useEffect, useState } from "react";
import axios from "axios";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/data/categories.json").then((res) => {
      setCategories(res.data);
      setLoading(false);
    });
  }, []);

  return { categories, loading };
}

export function useProducts() {
  const [products, setProducts] = useState<CategoryWithProducts[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/data/products.json").then((res) => {
      setProducts(res.data);
      setLoading(false);
    });
  }, []);

  return { products, loading };
}
