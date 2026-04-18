import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

interface CategoryRow { id: number; name: string }
interface SubcategoryRow { id: number; name: string; category_id: number }
interface ProductTypeRow { id: number; name: string; subcategory_id: number }

const ManageProducts = () => {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryRow[]>([]);
  const [productTypes, setProductTypes] = useState<ProductTypeRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [expandedCat, setExpandedCat] = useState<number | null>(null);
  const [expandedSub, setExpandedSub] = useState<number | null>(null);

  // Add forms
  const [newCat, setNewCat] = useState("");
  const [newSub, setNewSub] = useState({ name: "", categoryId: 0 });
  const [newPt, setNewPt] = useState({ name: "", subcategoryId: 0 });

  // Edit state
  const [editCat, setEditCat] = useState<{ id: number; name: string } | null>(null);
  const [editSub, setEditSub] = useState<{ id: number; name: string } | null>(null);
  const [editPt, setEditPt] = useState<{ id: number; name: string } | null>(null);

  const fetchAll = async () => {
    const [c, s, p] = await Promise.all([
      supabase.from("categories").select("*").order("id"),
      supabase.from("subcategories").select("*").order("id"),
      supabase.from("product_types").select("*").order("id"),
    ]);
    setCategories(c.data || []);
    setSubcategories(s.data || []);
    setProductTypes(p.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  // Category CRUD
  const addCategory = async () => {
    if (!newCat.trim()) return;
    const { error } = await supabase.from("categories").insert({ name: newCat.trim() });
    if (error) { toast.error(error.message); return; }
    toast.success("Category added");
    setNewCat("");
    fetchAll();
  };

  const updateCategory = async () => {
    if (!editCat) return;
    const { error } = await supabase.from("categories").update({ name: editCat.name }).eq("id", editCat.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Category updated");
    setEditCat(null);
    fetchAll();
  };

  const deleteCategory = async (id: number) => {
    if (!confirm("Delete this category and all its subcategories and products?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Category deleted");
    fetchAll();
  };

  // Subcategory CRUD
  const addSubcategory = async (categoryId: number) => {
    if (!newSub.name.trim()) return;
    const { error } = await supabase.from("subcategories").insert({ name: newSub.name.trim(), category_id: categoryId });
    if (error) { toast.error(error.message); return; }
    toast.success("Subcategory added");
    setNewSub({ name: "", categoryId: 0 });
    fetchAll();
  };

  const updateSubcategory = async () => {
    if (!editSub) return;
    const { error } = await supabase.from("subcategories").update({ name: editSub.name }).eq("id", editSub.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Subcategory updated");
    setEditSub(null);
    fetchAll();
  };

  const deleteSubcategory = async (id: number) => {
    if (!confirm("Delete this subcategory and all its products?")) return;
    const { error } = await supabase.from("subcategories").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Subcategory deleted");
    fetchAll();
  };

  // Product type CRUD
  const addProductType = async (subcategoryId: number) => {
    if (!newPt.name.trim()) return;
    const { error } = await supabase.from("product_types").insert({ name: newPt.name.trim(), subcategory_id: subcategoryId });
    if (error) { toast.error(error.message); return; }
    toast.success("Product added");
    setNewPt({ name: "", subcategoryId: 0 });
    fetchAll();
  };

  const updateProductType = async () => {
    if (!editPt) return;
    const { error } = await supabase.from("product_types").update({ name: editPt.name }).eq("id", editPt.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Product updated");
    setEditPt(null);
    fetchAll();
  };

  const deleteProductType = async (id: number) => {
    if (!confirm("Delete this product type?")) return;
    const { error } = await supabase.from("product_types").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Product deleted");
    fetchAll();
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Products</h1>

      {/* Add Category */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          placeholder="New category name..."
          className="border border-gray-300 rounded-md px-3 py-2 text-sm flex-1 max-w-xs focus:ring-2 focus:ring-secondaryBrown focus:border-transparent outline-none"
          onKeyDown={(e) => e.key === "Enter" && addCategory()}
        />
        <button onClick={addCategory} className="bg-secondaryBrown text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90">
          Add Category
        </button>
      </div>

      {/* Category list */}
      <div className="space-y-2">
        {categories.map((cat) => {
          const subs = subcategories.filter((s) => s.category_id === cat.id);
          const isExpanded = expandedCat === cat.id;

          return (
            <div key={cat.id} className="border border-gray-200 rounded-lg bg-white">
              {/* Category row */}
              <div className="flex items-center gap-2 px-4 py-3">
                <button
                  onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
                  className="text-gray-400 hover:text-gray-700 text-sm w-6"
                >
                  {isExpanded ? "▼" : "▶"}
                </button>

                {editCat?.id === cat.id ? (
                  <div className="flex gap-2 flex-1">
                    <input
                      type="text"
                      value={editCat.name}
                      onChange={(e) => setEditCat({ ...editCat, name: e.target.value })}
                      className="border rounded px-2 py-1 text-sm flex-1"
                      onKeyDown={(e) => e.key === "Enter" && updateCategory()}
                    />
                    <button onClick={updateCategory} className="text-green-600 text-sm font-medium">Save</button>
                    <button onClick={() => setEditCat(null)} className="text-gray-400 text-sm">Cancel</button>
                  </div>
                ) : (
                  <>
                    <span className="font-semibold flex-1">{cat.name}</span>
                    <span className="text-xs text-gray-400">{subs.length} subs</span>
                    <button onClick={() => setEditCat({ id: cat.id, name: cat.name })} className="text-sm text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => deleteCategory(cat.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                  </>
                )}
              </div>

              {/* Expanded: subcategories */}
              {isExpanded && (
                <div className="border-t px-4 py-3 bg-gray-50">
                  {/* Add subcategory */}
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newSub.categoryId === cat.id ? newSub.name : ""}
                      onChange={(e) => setNewSub({ name: e.target.value, categoryId: cat.id })}
                      placeholder="New subcategory..."
                      className="border rounded px-2 py-1 text-sm flex-1 max-w-xs"
                      onKeyDown={(e) => e.key === "Enter" && addSubcategory(cat.id)}
                    />
                    <button onClick={() => addSubcategory(cat.id)} className="text-sm bg-secondaryBrown text-white px-3 py-1 rounded hover:bg-opacity-90">
                      Add
                    </button>
                  </div>

                  {subs.length === 0 && <p className="text-sm text-gray-400">No subcategories yet</p>}

                  {subs.map((sub) => {
                    const pts = productTypes.filter((p) => p.subcategory_id === sub.id);
                    const subExpanded = expandedSub === sub.id;

                    return (
                      <div key={sub.id} className="ml-4 mb-2">
                        <div className="flex items-center gap-2 py-1">
                          <button
                            onClick={() => setExpandedSub(subExpanded ? null : sub.id)}
                            className="text-gray-400 hover:text-gray-700 text-xs w-4"
                          >
                            {subExpanded ? "▼" : "▶"}
                          </button>

                          {editSub?.id === sub.id ? (
                            <div className="flex gap-2 flex-1">
                              <input
                                type="text"
                                value={editSub.name}
                                onChange={(e) => setEditSub({ ...editSub, name: e.target.value })}
                                className="border rounded px-2 py-1 text-sm flex-1"
                                onKeyDown={(e) => e.key === "Enter" && updateSubcategory()}
                              />
                              <button onClick={updateSubcategory} className="text-green-600 text-xs font-medium">Save</button>
                              <button onClick={() => setEditSub(null)} className="text-gray-400 text-xs">Cancel</button>
                            </div>
                          ) : (
                            <>
                              <span className="text-sm font-medium flex-1">{sub.name}</span>
                              <span className="text-xs text-gray-400">{pts.length} products</span>
                              <button onClick={() => setEditSub({ id: sub.id, name: sub.name })} className="text-xs text-blue-600 hover:underline">Edit</button>
                              <button onClick={() => deleteSubcategory(sub.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                            </>
                          )}
                        </div>

                        {/* Expanded: product types */}
                        {subExpanded && (
                          <div className="ml-6 mt-1 mb-2">
                            <div className="flex gap-2 mb-2">
                              <input
                                type="text"
                                value={newPt.subcategoryId === sub.id ? newPt.name : ""}
                                onChange={(e) => setNewPt({ name: e.target.value, subcategoryId: sub.id })}
                                placeholder="New product type..."
                                className="border rounded px-2 py-1 text-xs flex-1 max-w-xs"
                                onKeyDown={(e) => e.key === "Enter" && addProductType(sub.id)}
                              />
                              <button onClick={() => addProductType(sub.id)} className="text-xs bg-secondaryBrown text-white px-2 py-1 rounded hover:bg-opacity-90">
                                Add
                              </button>
                            </div>

                            {pts.length === 0 && <p className="text-xs text-gray-400">No products yet</p>}

                            {pts.map((pt) => (
                              <div key={pt.id} className="flex items-center gap-2 py-0.5">
                                {editPt?.id === pt.id ? (
                                  <div className="flex gap-2 flex-1">
                                    <input
                                      type="text"
                                      value={editPt.name}
                                      onChange={(e) => setEditPt({ ...editPt, name: e.target.value })}
                                      className="border rounded px-2 py-0.5 text-xs flex-1"
                                      onKeyDown={(e) => e.key === "Enter" && updateProductType()}
                                    />
                                    <button onClick={updateProductType} className="text-green-600 text-xs">Save</button>
                                    <button onClick={() => setEditPt(null)} className="text-gray-400 text-xs">Cancel</button>
                                  </div>
                                ) : (
                                  <>
                                    <span className="text-xs flex-1">{pt.name}</span>
                                    <button onClick={() => setEditPt({ id: pt.id, name: pt.name })} className="text-xs text-blue-600 hover:underline">Edit</button>
                                    <button onClick={() => deleteProductType(pt.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ManageProducts;
