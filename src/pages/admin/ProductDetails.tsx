import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import {
  HiOutlineArrowLeft,
  HiOutlinePhoto,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineChevronDown,
  HiOutlineChevronRight,
} from "react-icons/hi2";

// ── types ──────────────────────────────────────────────────
interface ProductRow {
  id: number;
  name: string;
  subcategory_id: number;
  image_url: string | null;
  sku: string | null;
  deleted_at: string | null;
}

interface SpecRow {
  id: number;
  product_id: number;
  field_label: string;
  field_type: "fixed_text" | "select_option" | "radio_button";
  value_type: "text" | "number";
  sort_order: number;
}

interface SpecOptionRow {
  id: number;
  specification_id: number;
  heading: string;
  subheading: string | null;
  content: string;
  sort_order: number;
}

type FieldType = "fixed_text" | "select_option" | "radio_button";
type ValueType = "text" | "number";

// ── constants ──────────────────────────────────────────────
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const IMAGE_BUCKET = "products";

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "fixed_text", label: "Fixed Text" },
  { value: "select_option", label: "Select Option" },
  { value: "radio_button", label: "Radio Button" },
];

const VALUE_TYPES: { value: ValueType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
];

// ── helpers ────────────────────────────────────────────────
function validateImage(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type))
    return `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.map((t) => t.split("/")[1]).join(", ")}`;
  if (file.size > MAX_IMAGE_SIZE)
    return `File too large. Maximum: ${MAX_IMAGE_SIZE / 1024 / 1024} MB`;
  return null;
}

// ── component ──────────────────────────────────────────────
const ProductDetails = () => {
  const { productId } = useParams<{ productId: string }>();
  const id = parseInt(productId || "0");

  const [product, setProduct] = useState<ProductRow | null>(null);
  const [specs, setSpecs] = useState<SpecRow[]>([]);
  const [options, setOptions] = useState<SpecOptionRow[]>([]);
  const [breadcrumb, setBreadcrumb] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Edit product name
  const [editName, setEditName] = useState(false);
  const [nameVal, setNameVal] = useState("");

  // Add / edit spec
  const [showAddSpec, setShowAddSpec] = useState(false);
  const [specForm, setSpecForm] = useState({
    id: 0,
    field_label: "",
    field_type: "fixed_text" as FieldType,
    value_type: "text" as ValueType,
    sort_order: 0,
  });
  const [expandedSpec, setExpandedSpec] = useState<number | null>(null);

  // Add / edit option
  const [showAddOption, setShowAddOption] = useState<number | null>(null);
  const [optionForm, setOptionForm] = useState({
    id: 0,
    heading: "",
    subheading: "",
    content: "",
    sort_order: 0,
  });
  const [customizeOption, setCustomizeOption] = useState<Record<number, boolean>>({});

  // Newly created spec that should auto-expand options
  const [autoExpandSpecId, setAutoExpandSpecId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── fetch ────────────────────────────────────────────────
  const fetchProduct = async () => {
    const { data: prod } = await supabase
      .from("product_types")
      .select("*")
      .eq("id", id)
      .single();
    if (!prod) { setLoading(false); return; }
    setProduct(prod);
    setNameVal(prod.name);

    // Breadcrumb
    const { data: sub } = await supabase
      .from("subcategories")
      .select("id, name, category_id")
      .eq("id", prod.subcategory_id)
      .single();
    if (sub) {
      const { data: cat } = await supabase
        .from("categories")
        .select("id, name")
        .eq("id", sub.category_id)
        .single();
      setBreadcrumb([cat?.name, sub.name].filter(Boolean).join(" › "));
    }

    // Specs
    const { data: specData } = await supabase
      .from("product_specifications")
      .select("*")
      .eq("product_id", id)
      .order("sort_order")
      .order("id");
    setSpecs(specData || []);

    // Options for all specs
    const specIds = (specData || []).map((s: SpecRow) => s.id);
    if (specIds.length > 0) {
      const { data: optData } = await supabase
        .from("product_specification_options")
        .select("*")
        .in("specification_id", specIds)
        .order("sort_order")
        .order("id");
      setOptions(optData || []);
    } else {
      setOptions([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (id) fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── product actions ──────────────────────────────────────
  const updateName = async () => {
    const name = nameVal.trim();
    if (!name) return;
    const { error } = await supabase.from("product_types").update({ name }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Name updated");
    setEditName(false);
    fetchProduct();
  };

  const handleImageUpload = async (file: File) => {
    const err = validateImage(file);
    if (err) { toast.error(err); return; }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const filePath = `${id}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(filePath, file, { upsert: true });

    if (uploadErr) {
      toast.error(uploadErr.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(filePath);
    const { error: updateErr } = await supabase
      .from("product_types")
      .update({ image_url: urlData.publicUrl })
      .eq("id", id);

    if (updateErr) toast.error(updateErr.message);
    else toast.success("Image uploaded");
    setUploading(false);
    fetchProduct();
  };

  const removeImage = async () => {
    if (!confirm("Remove product image?")) return;
    await supabase.from("product_types").update({ image_url: null }).eq("id", id);
    toast.success("Image removed");
    fetchProduct();
  };

  // ── spec CRUD ────────────────────────────────────────────
  const resetSpecForm = () => {
    setSpecForm({ id: 0, field_label: "", field_type: "fixed_text", value_type: "text", sort_order: 0 });
    setShowAddSpec(false);
  };

  const saveSpec = async () => {
    const label = specForm.field_label.trim();
    if (!label) { toast.error("Field label is required"); return; }

    const needsOptions = specForm.field_type === "select_option" || specForm.field_type === "radio_button";

    if (specForm.id) {
      // Update
      const { error } = await supabase
        .from("product_specifications")
        .update({
          field_label: label,
          field_type: specForm.field_type,
          value_type: specForm.value_type,
          sort_order: specForm.sort_order,
        })
        .eq("id", specForm.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Specification updated");
      if (needsOptions) {
        setAutoExpandSpecId(specForm.id);
      }
    } else {
      // Insert
      const maxOrder = specs.reduce((m, s) => Math.max(m, s.sort_order ?? 0), 0);
      const { data: inserted, error } = await supabase.from("product_specifications").insert({
        product_id: id,
        field_label: label,
        field_type: specForm.field_type,
        value_type: specForm.value_type,
        sort_order: maxOrder + 1,
      }).select().single();
      if (error) { toast.error(error.message); return; }
      toast.success("Specification added");
      if (needsOptions && inserted) {
        setAutoExpandSpecId(inserted.id);
      }
    }
    resetSpecForm();
    fetchProduct();
  };

  const deleteSpec = async (specId: number) => {
    if (!confirm("Delete this specification and all its options?")) return;
    const { error } = await supabase.from("product_specifications").delete().eq("id", specId);
    if (error) { toast.error(error.message); return; }
    toast.success("Specification deleted");
    fetchProduct();
  };

  // ── option CRUD ──────────────────────────────────────────
  const resetOptionForm = () => {
    setOptionForm({ id: 0, heading: "", subheading: "", content: "", sort_order: 0 });
    setShowAddOption(null);
  };

  const saveOption = async (specId: number) => {
    const content = optionForm.content.trim();
    if (!content) { toast.error("Content is required"); return; }
    const heading = optionForm.heading.trim() || content;

    if (optionForm.id) {
      const { error } = await supabase
        .from("product_specification_options")
        .update({
          heading,
          subheading: optionForm.subheading.trim() || null,
          content,
          sort_order: optionForm.sort_order,
        })
        .eq("id", optionForm.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Option updated");
    } else {
      const specOpts = options.filter((o) => o.specification_id === specId);
      const maxOrder = specOpts.reduce((m, o) => Math.max(m, o.sort_order ?? 0), 0);
      const { error } = await supabase.from("product_specification_options").insert({
        specification_id: specId,
        heading,
        subheading: optionForm.subheading.trim() || null,
        content,
        sort_order: maxOrder + 1,
      });
      if (error) { toast.error(error.message); return; }
      toast.success("Option added");
    }
    resetOptionForm();
    fetchProduct();
  };

  const deleteOption = async (optId: number) => {
    if (!confirm("Delete this option?")) return;
    const { error } = await supabase.from("product_specification_options").delete().eq("id", optId);
    if (error) { toast.error(error.message); return; }
    toast.success("Option deleted");
    fetchProduct();
  };

  // ── render ───────────────────────────────────────────────
  if (loading)
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );

  if (!product)
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Product not found.</p>
        <Link to="/admin/products" className="text-secondaryBrown hover:underline text-sm mt-2 inline-block">
          ← Back to products
        </Link>
      </div>
    );

  const hasOptions = (ft: string) => ft === "select_option" || ft === "radio_button";

  return (
    <div>
      {/* Back link */}
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <HiOutlineArrowLeft className="w-4 h-4" /> Back to products
      </Link>

      {/* Product header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Image section */}
          <div className="flex-shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(",")}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
                e.target.value = "";
              }}
            />

            {product.image_url ? (
              <div className="relative group">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-40 h-40 rounded-lg object-cover border"
                />
                <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white text-gray-800 px-2 py-1 rounded text-xs font-medium"
                    disabled={uploading}
                  >
                    Change
                  </button>
                  <button
                    onClick={removeImage}
                    className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-40 h-40 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 hover:border-secondaryBrown transition-colors"
              >
                <HiOutlinePhoto className="w-8 h-8 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {uploading ? "Uploading…" : "Upload Image"}
                </span>
              </button>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">{breadcrumb}</p>

            {editName ? (
              <div className="flex gap-2 items-center mb-2">
                <input
                  type="text"
                  value={nameVal}
                  onChange={(e) => setNameVal(e.target.value)}
                  className="border rounded px-3 py-1.5 text-lg font-bold flex-1"
                  onKeyDown={(e) => e.key === "Enter" && updateName()}
                />
                <button onClick={updateName} className="text-green-600 text-sm font-medium">Save</button>
                <button onClick={() => { setEditName(false); setNameVal(product.name); }} className="text-gray-400 text-sm">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold">{product.name}</h1>
                <button onClick={() => setEditName(true)} className="text-gray-400 hover:text-gray-600">
                  <HiOutlinePencil className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span>ID: {product.id}</span>
              {product.sku && <span>SKU: {product.sku}</span>}
              <span>{specs.length} specification{specs.length !== 1 ? "s" : ""}</span>
              {product.deleted_at && (
                <span className="text-red-500 font-medium">Deleted</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Specifications section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Specifications</h2>
          <button
            onClick={() => {
              resetSpecForm();
              setShowAddSpec(true);
            }}
            className="flex items-center gap-1.5 bg-secondaryBrown text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-opacity-90"
          >
            <HiOutlinePlus className="w-4 h-4" /> Add Spec
          </button>
        </div>

        {/* Add / Edit Spec Form */}
        {showAddSpec && (
          <div className="bg-gray-50 border rounded-lg p-4 mb-4 space-y-3">
            <h3 className="font-semibold text-sm">
              {specForm.id ? "Edit Specification" : "New Specification"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <input
                type="text"
                value={specForm.field_label}
                onChange={(e) => setSpecForm({ ...specForm, field_label: e.target.value })}
                placeholder="Field label…"
                className="border rounded-md px-3 py-2 text-sm"
              />
              <select
                value={specForm.field_type}
                onChange={(e) => setSpecForm({ ...specForm, field_type: e.target.value as FieldType })}
                className="border rounded-md px-3 py-2 text-sm"
              >
                {FIELD_TYPES.map((ft) => (
                  <option key={ft.value} value={ft.value}>{ft.label}</option>
                ))}
              </select>
              <select
                value={specForm.value_type}
                onChange={(e) => setSpecForm({ ...specForm, value_type: e.target.value as ValueType })}
                className="border rounded-md px-3 py-2 text-sm"
              >
                {VALUE_TYPES.map((vt) => (
                  <option key={vt.value} value={vt.value}>{vt.label}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={saveSpec}
                  className="bg-secondaryBrown text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90"
                >
                  {specForm.id ? "Update" : "Add"}
                </button>
                <button onClick={resetSpecForm} className="text-gray-500 text-sm hover:underline">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Spec list */}
        {specs.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">No specifications yet.</p>
        ) : (
          <div className="space-y-2">
            {specs.map((spec) => {
              const specOptions = options.filter((o) => o.specification_id === spec.id);
              // Auto-expand if just created with options type
              const shouldAutoExpand = autoExpandSpecId === spec.id;
              if (shouldAutoExpand && expandedSpec !== spec.id) {
                setTimeout(() => {
                  setExpandedSpec(spec.id);
                  setShowAddOption(spec.id);
                  setAutoExpandSpecId(null);
                }, 0);
              }
              const isExpanded = expandedSpec === spec.id || shouldAutoExpand;
              const showOpts = hasOptions(spec.field_type);

              return (
                <div key={spec.id} className="border border-gray-200 rounded-lg">
                  {/* Spec row */}
                  <div className="flex items-center gap-2 px-4 py-3">
                    {showOpts && (
                      <button
                        onClick={() => setExpandedSpec(isExpanded ? null : spec.id)}
                        className="text-gray-400 hover:text-gray-700"
                      >
                        {isExpanded ? (
                          <HiOutlineChevronDown className="w-4 h-4" />
                        ) : (
                          <HiOutlineChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    )}

                    <span className="font-medium text-sm flex-1">{spec.field_label}</span>

                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded hidden sm:inline">
                      {FIELD_TYPES.find((f) => f.value === spec.field_type)?.label}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded hidden sm:inline">
                      {spec.value_type}
                    </span>
                    <span className="text-xs text-gray-400 hidden sm:inline">#{spec.sort_order}</span>

                    {showOpts && (
                      <span className="text-xs text-gray-400">{specOptions.length} opts</span>
                    )}

                    <button
                      onClick={() => {
                        setSpecForm({
                          id: spec.id,
                          field_label: spec.field_label,
                          field_type: spec.field_type,
                          value_type: spec.value_type,
                          sort_order: spec.sort_order,
                        });
                        setShowAddSpec(true);
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      <HiOutlinePencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteSpec(spec.id)}
                      className="text-red-600 hover:underline"
                    >
                      <HiOutlineTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Options for select/radio */}
                  {showOpts && isExpanded && (
                    <div className="border-t bg-gray-50 px-4 py-3">
                      {/* Add option button */}
                      <button
                        onClick={() => {
                          resetOptionForm();
                          setShowAddOption(spec.id);
                        }}
                        className="flex items-center gap-1 text-xs text-secondaryBrown hover:underline mb-3"
                      >
                        <HiOutlinePlus className="w-3.5 h-3.5" /> Add option
                      </button>

                      {/* Add / edit option form */}
                      {showAddOption === spec.id && (
                        <div className="bg-white border rounded p-3 mb-3 space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={optionForm.content}
                              onChange={(e) =>
                                setOptionForm({ ...optionForm, content: e.target.value })
                              }
                              placeholder="Option value…"
                              className="border rounded px-2 py-1.5 text-sm flex-1"
                              onKeyDown={(e) => e.key === "Enter" && saveOption(spec.id)}
                            />
                            <button
                              onClick={() => saveOption(spec.id)}
                              className="bg-secondaryBrown text-white px-3 py-1 rounded text-xs font-medium hover:bg-opacity-90"
                            >
                              {optionForm.id ? "Update" : "Add"}
                            </button>
                            <button
                              onClick={resetOptionForm}
                              className="text-gray-500 text-xs hover:underline"
                            >
                              Cancel
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCustomizeOption((prev) => ({ ...prev, [-1]: !prev[-1] }))}
                            className="text-xs text-gray-500 hover:text-gray-700 underline"
                          >
                            {customizeOption[-1] ? "Hide" : "Customize"} heading & subheading
                          </button>
                          {customizeOption[-1] && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={optionForm.heading}
                                onChange={(e) =>
                                  setOptionForm({ ...optionForm, heading: e.target.value })
                                }
                                placeholder="Heading (optional, defaults to content)…"
                                className="border rounded px-2 py-1.5 text-sm"
                              />
                              <input
                                type="text"
                                value={optionForm.subheading}
                                onChange={(e) =>
                                  setOptionForm({ ...optionForm, subheading: e.target.value })
                                }
                                placeholder="Subheading (optional)…"
                                className="border rounded px-2 py-1.5 text-sm"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Options list */}
                      {specOptions.length === 0 ? (
                        <p className="text-xs text-gray-400">No options yet</p>
                      ) : (
                        <div className="space-y-1">
                          {specOptions.map((opt) => (
                            <div
                              key={opt.id}
                              className="flex items-center gap-2 py-1.5 px-2 bg-white rounded border text-sm"
                            >
                              <div className="flex-1">
                                <span className="font-medium">{opt.content}</span>
                                {(opt.heading !== opt.content || opt.subheading) && (
                                  <span className="text-xs text-gray-400 ml-2">
                                    {opt.heading !== opt.content && opt.heading}
                                    {opt.subheading && ` — ${opt.subheading}`}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-400">#{opt.sort_order}</span>
                              <button
                                onClick={() => {
                                  setOptionForm({
                                    id: opt.id,
                                    heading: opt.heading === opt.content ? "" : opt.heading,
                                    subheading: opt.subheading || "",
                                    content: opt.content,
                                    sort_order: opt.sort_order,
                                  });
                                  setShowAddOption(spec.id);
                                  if (opt.heading !== opt.content || opt.subheading) {
                                    setCustomizeOption((prev) => ({ ...prev, [-1]: true }));
                                  }
                                }}
                                className="text-blue-600"
                              >
                                <HiOutlinePencil className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => deleteOption(opt.id)}
                                className="text-red-600"
                              >
                                <HiOutlineTrash className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
