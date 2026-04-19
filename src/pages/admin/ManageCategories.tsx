import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import {
  HiOutlineChevronDown,
  HiOutlineChevronRight,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineArrowPath,
  HiOutlinePlus,
  HiOutlineArrowDown,
  HiOutlinePhoto,
} from "react-icons/hi2";

// ── types ──────────────────────────────────────────────────
interface CategoryRow {
  id: number;
  name: string;
  image_url: string | null;
  sort_order: number;
  deleted_at: string | null;
}

interface SubcategoryRow {
  id: number;
  name: string;
  category_id: number;
  sort_order: number;
  deleted_at: string | null;
}

type FilterMode = "active" | "deleted" | "all";

// ── constants ──────────────────────────────────────────────
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const IMAGE_BUCKET = "category";

// ── helpers ────────────────────────────────────────────────
function validateImage(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type))
    return `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.map((t) => t.split("/")[1]).join(", ")}`;
  if (file.size > MAX_IMAGE_SIZE)
    return `File too large. Maximum size: ${MAX_IMAGE_SIZE / 1024 / 1024} MB`;
  return null;
}

function downloadCSV(categories: CategoryRow[], subcategories: SubcategoryRow[]) {
  const header = "type,id,name,sort_order,category_id,image_url";
  const catRows = categories.map(
    (c) => `category,${c.id},"${c.name}",${c.sort_order},,${c.image_url ?? ""}`
  );
  const subRows = subcategories.map(
    (s) => `subcategory,${s.id},"${s.name}",${s.sort_order},${s.category_id},`
  );
  const csv = [header, ...catRows, ...subRows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "categories_export.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ── component ──────────────────────────────────────────────
const ManageCategories = () => {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterMode>("active");

  const [expandedCat, setExpandedCat] = useState<number | null>(null);

  // Add / edit state
  const [newCat, setNewCat] = useState("");
  const [newSub, setNewSub] = useState({ name: "", categoryId: 0 });
  const [editCat, setEditCat] = useState<{ id: number; name: string; sort_order: number } | null>(null);
  const [editSub, setEditSub] = useState<{ id: number; name: string; sort_order: number } | null>(null);

  // Image upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingCatId, setUploadingCatId] = useState<number | null>(null);

  // ── fetch ────────────────────────────────────────────────
  const fetchAll = async () => {
    let catQuery = supabase.from("categories").select("*").order("sort_order").order("name");
    let subQuery = supabase.from("subcategories").select("*").order("sort_order").order("name");

    if (filter === "active") {
      catQuery = catQuery.is("deleted_at", null);
      subQuery = subQuery.is("deleted_at", null);
    } else if (filter === "deleted") {
      catQuery = catQuery.not("deleted_at", "is", null);
      subQuery = subQuery.not("deleted_at", "is", null);
    }

    const [c, s] = await Promise.all([catQuery, subQuery]);
    setCategories(c.data || []);
    setSubcategories(s.data || []);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // ── category CRUD ────────────────────────────────────────
  const addCategory = async () => {
    const name = newCat.trim();
    if (!name) return;
    const maxOrder = categories.reduce((m, c) => Math.max(m, c.sort_order ?? 0), 0);
    const { error } = await supabase.from("categories").insert({ name, sort_order: maxOrder + 1 });
    if (error) { toast.error(error.message); return; }
    toast.success("Category added");
    setNewCat("");
    fetchAll();
  };

  const updateCategory = async () => {
    if (!editCat) return;
    const { error } = await supabase
      .from("categories")
      .update({ name: editCat.name, sort_order: editCat.sort_order })
      .eq("id", editCat.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Category updated");
    setEditCat(null);
    fetchAll();
  };

  const softDeleteCategory = async (id: number) => {
    if (!confirm("Delete this category? Its subcategories will also be hidden.")) return;
    const now = new Date().toISOString();
    const { error: catErr } = await supabase.from("categories").update({ deleted_at: now }).eq("id", id);
    if (catErr) { toast.error(catErr.message); return; }
    // cascade soft-delete subcategories
    await supabase.from("subcategories").update({ deleted_at: now }).eq("category_id", id).is("deleted_at", null);
    toast.success("Category deleted");
    fetchAll();
  };

  const restoreCategory = async (id: number) => {
    const { error } = await supabase.from("categories").update({ deleted_at: null }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    // restore child subcategories too
    await supabase.from("subcategories").update({ deleted_at: null }).eq("category_id", id);
    toast.success("Category restored");
    fetchAll();
  };

  // ── image upload ─────────────────────────────────────────
  const handleImageUpload = async (catId: number, file: File) => {
    const err = validateImage(file);
    if (err) { toast.error(err); return; }

    setUploadingCatId(catId);
    const filePath = `${catId}.${file.name.split(".").pop()}`;
    const { error: uploadErr } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(filePath, file, { upsert: true });

    if (uploadErr) {
      toast.error(uploadErr.message);
      setUploadingCatId(null);
      return;
    }

    const { data: urlData } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(filePath);
    await supabase.from("categories").update({ image_url: urlData.publicUrl }).eq("id", catId);
    toast.success("Image uploaded");
    setUploadingCatId(null);
    fetchAll();
  };

  // ── subcategory CRUD ─────────────────────────────────────
  const addSubcategory = async (categoryId: number) => {
    const name = newSub.name.trim();
    if (!name) return;
    const subsForCat = subcategories.filter((s) => s.category_id === categoryId);
    const maxOrder = subsForCat.reduce((m, s) => Math.max(m, s.sort_order ?? 0), 0);
    const { error } = await supabase.from("subcategories").insert({
      name,
      category_id: categoryId,
      sort_order: maxOrder + 1,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Subcategory added");
    setNewSub({ name: "", categoryId: 0 });
    fetchAll();
  };

  const updateSubcategory = async () => {
    if (!editSub) return;
    const { error } = await supabase
      .from("subcategories")
      .update({ name: editSub.name, sort_order: editSub.sort_order })
      .eq("id", editSub.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Subcategory updated");
    setEditSub(null);
    fetchAll();
  };

  const softDeleteSubcategory = async (id: number) => {
    if (!confirm("Delete this subcategory?")) return;
    const { error } = await supabase
      .from("subcategories")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Subcategory deleted");
    fetchAll();
  };

  const restoreSubcategory = async (id: number) => {
    const { error } = await supabase.from("subcategories").update({ deleted_at: null }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Subcategory restored");
    fetchAll();
  };

  // ── render helpers ───────────────────────────────────────
  const isDeleted = (row: { deleted_at: string | null }) => row.deleted_at !== null;

  if (loading)
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Manage Categories</h1>
        <div className="flex gap-2 flex-wrap">
          {/* Filter tabs */}
          {(["active", "deleted", "all"] as FilterMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                filter === mode
                  ? "bg-secondaryBrown text-white"
                  : "text-gray-600 bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {mode}
            </button>
          ))}
          {/* Download CSV */}
          <button
            onClick={() => {
              const activeCats = categories.filter((c) => !isDeleted(c));
              const activeSubs = subcategories.filter((s) => !isDeleted(s));
              downloadCSV(activeCats, activeSubs);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            <HiOutlineArrowDown className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Add Category */}
      {filter !== "deleted" && (
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            placeholder="New category name…"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm flex-1 max-w-xs focus:ring-2 focus:ring-secondaryBrown focus:border-transparent outline-none"
            onKeyDown={(e) => e.key === "Enter" && addCategory()}
          />
          <button
            onClick={addCategory}
            className="flex items-center gap-1.5 bg-secondaryBrown text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90"
          >
            <HiOutlinePlus className="w-4 h-4" /> Add Category
          </button>
        </div>
      )}

      {/* Hidden file input for image uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && uploadingCatId !== null) {
            handleImageUpload(uploadingCatId, file);
          }
          e.target.value = "";
        }}
      />

      {/* Category list */}
      {categories.length === 0 ? (
        <p className="text-gray-400 text-sm">No categories found for this filter.</p>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => {
            const subs = subcategories.filter((s) => s.category_id === cat.id);
            const isExpanded = expandedCat === cat.id;
            const deleted = isDeleted(cat);

            return (
              <div
                key={cat.id}
                className={`border rounded-lg bg-white ${
                  deleted ? "border-red-200 bg-red-50/30" : "border-gray-200"
                }`}
              >
                {/* Category row */}
                <div className="flex items-center gap-2 px-4 py-3">
                  <button
                    onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
                    className="text-gray-400 hover:text-gray-700"
                  >
                    {isExpanded ? (
                      <HiOutlineChevronDown className="w-4 h-4" />
                    ) : (
                      <HiOutlineChevronRight className="w-4 h-4" />
                    )}
                  </button>

                  {/* Thumbnail */}
                  {cat.image_url ? (
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="w-8 h-8 rounded object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                      <HiOutlinePhoto className="w-4 h-4 text-gray-400" />
                    </div>
                  )}

                  {editCat?.id === cat.id ? (
                    <div className="flex gap-2 flex-1 items-center">
                      <input
                        type="text"
                        value={editCat.name}
                        onChange={(e) => setEditCat({ ...editCat, name: e.target.value })}
                        className="border rounded px-2 py-1 text-sm flex-1"
                        onKeyDown={(e) => e.key === "Enter" && updateCategory()}
                      />
                      <label className="text-xs text-gray-500">Order:</label>
                      <input
                        type="number"
                        value={editCat.sort_order}
                        onChange={(e) =>
                          setEditCat({ ...editCat, sort_order: parseInt(e.target.value) || 0 })
                        }
                        className="border rounded px-2 py-1 text-sm w-16"
                      />
                      <button onClick={updateCategory} className="text-green-600 text-sm font-medium">
                        Save
                      </button>
                      <button onClick={() => setEditCat(null)} className="text-gray-400 text-sm">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className={`font-semibold flex-1 ${deleted ? "line-through text-gray-400" : ""}`}>
                        {cat.name} ({subs.length})
                      </span>
                      <span className="text-xs text-gray-400 hidden sm:inline">
                        #{cat.sort_order}
                      </span>

                      {deleted ? (
                        <button
                          onClick={() => restoreCategory(cat.id)}
                          className="flex items-center gap-1 text-sm text-green-600 hover:underline"
                        >
                          <HiOutlineArrowPath className="w-3.5 h-3.5" /> Restore
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setUploadingCatId(cat.id);
                              fileInputRef.current?.click();
                            }}
                            className="text-sm text-gray-500 hover:text-gray-700"
                            title="Upload image"
                          >
                            <HiOutlinePhoto className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setEditCat({ id: cat.id, name: cat.name, sort_order: cat.sort_order })
                            }
                            className="text-sm text-blue-600 hover:underline"
                          >
                            <HiOutlinePencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => softDeleteCategory(cat.id)}
                            className="text-sm text-red-600 hover:underline"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>

                {/* Expanded: subcategories */}
                {isExpanded && (
                  <div className="border-t px-4 py-3 bg-gray-50">
                    {/* Add subcategory */}
                    {!deleted && (
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={newSub.categoryId === cat.id ? newSub.name : ""}
                          onChange={(e) => setNewSub({ name: e.target.value, categoryId: cat.id })}
                          placeholder="New subcategory…"
                          className="border rounded px-2 py-1 text-sm flex-1 max-w-xs"
                          onKeyDown={(e) => e.key === "Enter" && addSubcategory(cat.id)}
                        />
                        <button
                          onClick={() => addSubcategory(cat.id)}
                          className="flex items-center gap-1 text-sm bg-secondaryBrown text-white px-3 py-1 rounded hover:bg-opacity-90"
                        >
                          <HiOutlinePlus className="w-3.5 h-3.5" /> Add
                        </button>
                      </div>
                    )}

                    {subs.length === 0 && (
                      <p className="text-sm text-gray-400">No subcategories yet</p>
                    )}

                    {subs.map((sub) => {
                      const subDeleted = isDeleted(sub);

                      return (
                        <div key={sub.id} className="ml-4 mb-1">
                          <div className="flex items-center gap-2 py-1.5">
                            {editSub?.id === sub.id ? (
                              <div className="flex gap-2 flex-1 items-center">
                                <input
                                  type="text"
                                  value={editSub.name}
                                  onChange={(e) =>
                                    setEditSub({ ...editSub, name: e.target.value })
                                  }
                                  className="border rounded px-2 py-1 text-sm flex-1"
                                  onKeyDown={(e) => e.key === "Enter" && updateSubcategory()}
                                />
                                <label className="text-xs text-gray-500">Order:</label>
                                <input
                                  type="number"
                                  value={editSub.sort_order}
                                  onChange={(e) =>
                                    setEditSub({
                                      ...editSub,
                                      sort_order: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className="border rounded px-2 py-1 text-xs w-14"
                                />
                                <button
                                  onClick={updateSubcategory}
                                  className="text-green-600 text-xs font-medium"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditSub(null)}
                                  className="text-gray-400 text-xs"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <>
                                <span
                                  className={`text-sm font-medium flex-1 ${
                                    subDeleted ? "line-through text-gray-400" : ""
                                  }`}
                                >
                                  {sub.name}
                                </span>
                                <span className="text-xs text-gray-400 hidden sm:inline">
                                  #{sub.sort_order}
                                </span>

                                {subDeleted ? (
                                  <button
                                    onClick={() => restoreSubcategory(sub.id)}
                                    className="flex items-center gap-1 text-xs text-green-600 hover:underline"
                                  >
                                    <HiOutlineArrowPath className="w-3 h-3" /> Restore
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      onClick={() =>
                                        setEditSub({
                                          id: sub.id,
                                          name: sub.name,
                                          sort_order: sub.sort_order,
                                        })
                                      }
                                      className="text-xs text-blue-600 hover:underline"
                                    >
                                      <HiOutlinePencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => softDeleteSubcategory(sub.id)}
                                      className="text-xs text-red-600 hover:underline"
                                    >
                                      <HiOutlineTrash className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
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
          })}
        </div>
      )}
    </div>
  );
};

export default ManageCategories;
