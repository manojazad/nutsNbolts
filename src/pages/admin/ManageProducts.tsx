import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineArrowPath,
  HiOutlinePlus,
  HiOutlineExclamationTriangle,
  HiOutlinePhoto,
  HiOutlineDocumentText,
} from "react-icons/hi2";

// ── types ──────────────────────────────────────────────────
interface CategoryRow {
  id: number;
  name: string;
  deleted_at: string | null;
}
interface SubcategoryRow {
  id: number;
  name: string;
  category_id: number;
  deleted_at: string | null;
}
interface ProductRow {
  id: number;
  name: string;
  subcategory_id: number;
  image_url: string | null;
  sku: string | null;
  deleted_at: string | null;
}

type Tab = "all" | "incomplete" | "deleted";

const ManageProducts = () => {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [specCounts, setSpecCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<Tab>("all");

  // Filters
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [selectedSubId, setSelectedSubId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Add / edit
  const [newProduct, setNewProduct] = useState({ name: "", subcategoryId: 0 });
  const [editProduct, setEditProduct] = useState<{ id: number; name: string } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // ── fetch ────────────────────────────────────────────────
  const fetchAll = async () => {
    const [catRes, subRes, ptRes, specRes] = await Promise.all([
      supabase.from("categories").select("id, name, deleted_at").is("deleted_at", null).order("sort_order").order("name"),
      supabase.from("subcategories").select("id, name, category_id, deleted_at").is("deleted_at", null).order("sort_order").order("name"),
      supabase.from("product_types").select("*").order("name"),
      supabase.from("product_specifications").select("product_id"),
    ]);

    setCategories(catRes.data || []);
    setSubcategories(subRes.data || []);
    setProducts(ptRes.data || []);

    // Build spec count map
    const counts: Record<number, number> = {};
    (specRes.data || []).forEach((row: { product_id: number }) => {
      counts[row.product_id] = (counts[row.product_id] || 0) + 1;
    });
    setSpecCounts(counts);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ── product CRUD ─────────────────────────────────────────
  const addProduct = async () => {
    const name = newProduct.name.trim();
    if (!name || !newProduct.subcategoryId) {
      toast.error("Name and subcategory are required");
      return;
    }
    const { error } = await supabase.from("product_types").insert({
      name,
      subcategory_id: newProduct.subcategoryId,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Product added");
    setNewProduct({ name: "", subcategoryId: 0 });
    setShowAddForm(false);
    fetchAll();
  };

  const updateProduct = async () => {
    if (!editProduct) return;
    const { error } = await supabase
      .from("product_types")
      .update({ name: editProduct.name })
      .eq("id", editProduct.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Product updated");
    setEditProduct(null);
    fetchAll();
  };

  const softDeleteProduct = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase
      .from("product_types")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Product deleted");
    fetchAll();
  };

  const restoreProduct = async (id: number) => {
    const { error } = await supabase
      .from("product_types")
      .update({ deleted_at: null })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Product restored");
    fetchAll();
  };

  // ── derived data ─────────────────────────────────────────
  const isDeleted = (p: ProductRow) => p.deleted_at !== null;
  const isIncomplete = (p: ProductRow) =>
    !p.deleted_at && !p.image_url && !(specCounts[p.id] > 0);

  const filteredSubcategories = selectedCatId
    ? subcategories.filter((s) => s.category_id === selectedCatId)
    : subcategories;

  const filteredProducts = products.filter((p) => {
    // Tab filter
    if (tab === "deleted" && !isDeleted(p)) return false;
    if (tab === "incomplete" && !isIncomplete(p)) return false;
    if (tab === "all" && isDeleted(p)) return false;

    // Category / subcategory filter
    if (selectedSubId && p.subcategory_id !== selectedSubId) return false;
    if (selectedCatId && !selectedSubId) {
      const subIds = filteredSubcategories.map((s) => s.id);
      if (!subIds.includes(p.subcategory_id)) return false;
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!p.name.toLowerCase().includes(q)) return false;
    }

    return true;
  });

  // helper to get breadcrumb
  const getBreadcrumb = (p: ProductRow) => {
    const sub = subcategories.find((s) => s.id === p.subcategory_id);
    const cat = sub ? categories.find((c) => c.id === sub.category_id) : null;
    return [cat?.name, sub?.name].filter(Boolean).join(" › ");
  };

  const incompleteCount = products.filter(isIncomplete).length;
  const deletedCount = products.filter(isDeleted).length;

  if (loading)
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Manage Products</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 bg-secondaryBrown text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90 self-start"
        >
          <HiOutlinePlus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Add Product Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 space-y-3">
          <h3 className="font-semibold text-sm">Add New Product</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={newProduct.subcategoryId || ""}
              onChange={(e) => {
                const subId = parseInt(e.target.value);
                setNewProduct({ ...newProduct, subcategoryId: subId });
              }}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="">Select subcategory…</option>
              {categories.map((cat) => {
                const subs = subcategories.filter((s) => s.category_id === cat.id);
                if (subs.length === 0) return null;
                return (
                  <optgroup key={cat.id} label={cat.name}>
                    {subs.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
            <input
              type="text"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              placeholder="Product name…"
              className="border rounded-md px-3 py-2 text-sm"
              onKeyDown={(e) => e.key === "Enter" && addProduct()}
            />
            <div className="flex gap-2">
              <button
                onClick={addProduct}
                className="bg-secondaryBrown text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 text-sm hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setTab("all")}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === "all" ? "bg-secondaryBrown text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All Active
        </button>
        <button
          onClick={() => setTab("incomplete")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === "incomplete"
              ? "bg-amber-500 text-white"
              : "bg-amber-50 text-amber-700 hover:bg-amber-100"
          }`}
        >
          <HiOutlineExclamationTriangle className="w-4 h-4" />
          Incomplete ({incompleteCount})
        </button>
        <button
          onClick={() => setTab("deleted")}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === "deleted"
              ? "bg-red-500 text-white"
              : "bg-red-50 text-red-600 hover:bg-red-100"
          }`}
        >
          Deleted ({deletedCount})
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <select
          value={selectedCatId ?? ""}
          onChange={(e) => {
            setSelectedCatId(e.target.value ? parseInt(e.target.value) : null);
            setSelectedSubId(null);
          }}
          className="border rounded-md px-3 py-1.5 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={selectedSubId ?? ""}
          onChange={(e) => setSelectedSubId(e.target.value ? parseInt(e.target.value) : null)}
          className="border rounded-md px-3 py-1.5 text-sm"
        >
          <option value="">All subcategories</option>
          {filteredSubcategories.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products…"
          className="border rounded-md px-3 py-1.5 text-sm flex-1 min-w-[150px] max-w-xs"
        />
      </div>

      {/* Product count */}
      <p className="text-sm text-gray-500 mb-3">
        Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
      </p>

      {/* Product list */}
      {filteredProducts.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">No products match the current filters.</p>
      ) : (
        <div className="space-y-1">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-2 text-xs font-medium text-gray-500 uppercase">
            <div className="col-span-4">Product</div>
            <div className="col-span-3">Category</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>

          {filteredProducts.map((p) => {
            const deleted = isDeleted(p);
            const incomplete = isIncomplete(p);
            const hasImage = !!p.image_url;
            const hasSpecs = (specCounts[p.id] || 0) > 0;

            return (
              <div
                key={p.id}
                className={`grid grid-cols-1 sm:grid-cols-12 gap-2 px-4 py-3 rounded-lg border items-center ${
                  deleted
                    ? "border-red-200 bg-red-50/30"
                    : incomplete
                    ? "border-amber-200 bg-amber-50/30"
                    : "border-gray-200 bg-white"
                }`}
              >
                {/* Product name */}
                <div className="sm:col-span-4">
                  {editProduct?.id === p.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editProduct.name}
                        onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                        className="border rounded px-2 py-1 text-sm flex-1"
                        onKeyDown={(e) => e.key === "Enter" && updateProduct()}
                      />
                      <button onClick={updateProduct} className="text-green-600 text-xs font-medium">
                        Save
                      </button>
                      <button onClick={() => setEditProduct(null)} className="text-gray-400 text-xs">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <Link
                      to={`/admin/products/${p.id}`}
                      className={`font-medium text-sm hover:underline ${
                        deleted ? "line-through text-gray-400" : "text-gray-900"
                      }`}
                    >
                      {p.name}
                    </Link>
                  )}
                </div>

                {/* Breadcrumb */}
                <div className="sm:col-span-3 text-xs text-gray-500 truncate">
                  {getBreadcrumb(p)}
                </div>

                {/* Status indicators */}
                <div className="sm:col-span-2 flex gap-1.5">
                  <span
                    title={hasImage ? "Has image" : "No image"}
                    className={`inline-flex items-center ${hasImage ? "text-green-500" : "text-gray-300"}`}
                  >
                    <HiOutlinePhoto className="w-4 h-4" />
                  </span>
                  <span
                    title={hasSpecs ? `${specCounts[p.id]} specs` : "No specs"}
                    className={`inline-flex items-center ${hasSpecs ? "text-green-500" : "text-gray-300"}`}
                  >
                    <HiOutlineDocumentText className="w-4 h-4" />
                  </span>
                </div>

                {/* Actions */}
                <div className="sm:col-span-3 flex gap-2 justify-end">
                  {deleted ? (
                    <button
                      onClick={() => restoreProduct(p.id)}
                      className="flex items-center gap-1 text-sm text-green-600 hover:underline"
                    >
                      <HiOutlineArrowPath className="w-3.5 h-3.5" /> Restore
                    </button>
                  ) : (
                    <>
                      <Link
                        to={`/admin/products/${p.id}`}
                        className="text-sm text-secondaryBrown hover:underline"
                      >
                        Details
                      </Link>
                      <button
                        onClick={() => setEditProduct({ id: p.id, name: p.name })}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        <HiOutlinePencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => softDeleteProduct(p.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
