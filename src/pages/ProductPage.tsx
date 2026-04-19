import { useParams, Link } from "react-router-dom";
import { useProducts } from "../hooks/useData";
import { toSlug } from "../utils/slug";
import { getCategoryColor, getCategoryIcon } from "../utils/categoryMeta";
import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";

// ── Spec types ──
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

/* ── Skeleton loader ── */
const Pulse = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const ProductSkeleton = () => (
  <div className="max-w-screen-2xl mx-auto px-5 max-[400px]:px-3 pb-16">
    <div className="flex gap-2 my-4">
      <Pulse className="h-4 w-10" />
      <Pulse className="h-4 w-4" />
      <Pulse className="h-4 w-24" />
      <Pulse className="h-4 w-4" />
      <Pulse className="h-4 w-32" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <Pulse className="aspect-square max-h-80 rounded-lg" />
        <Pulse className="h-8 w-3/4" />
        <Pulse className="h-4 w-24" />
        <div className="border-t pt-4 space-y-2">
          <Pulse className="h-4 w-full" />
          <Pulse className="h-4 w-full" />
          <Pulse className="h-4 w-2/3" />
        </div>
        <Pulse className="h-20 rounded-lg" />
      </div>
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <Pulse className="h-7 w-44" />
        <Pulse className="h-10 w-full rounded-md" />
        <Pulse className="h-24 w-full rounded-md" />
        <Pulse className="h-px w-full" />
        <Pulse className="h-6 w-32" />
        <div className="grid grid-cols-2 gap-4">
          <Pulse className="h-10 rounded-md" />
          <Pulse className="h-10 rounded-md" />
          <Pulse className="h-10 rounded-md" />
          <Pulse className="h-10 rounded-md" />
        </div>
        <Pulse className="h-12 w-full rounded-md" />
      </div>
    </div>
  </div>
);

/* ── Main component ── */
const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { products, loading } = useProducts();

  const [formData, setFormData] = useState({
    quantity: 1,
    specifications: "",
    contactName: "",
    companyName: "",
    email: "",
    phone: "",
    deliveryLocation: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Product specifications
  const [specs, setSpecs] = useState<SpecRow[]>([]);
  const [specOptions, setSpecOptions] = useState<SpecOptionRow[]>([]);
  const [specValues, setSpecValues] = useState<Record<number, string>>({});

  // Find product across all categories (memoized so hooks below can depend on id)
  const { foundProduct, foundSubCategory, foundCategory } = useMemo(() => {
    let fp: { id: number; name: string; image_url?: string | null } | null = null;
    let fsc: { id: number; name: string } | null = null;
    let fc: CategoryWithProducts | null = null;
    for (const cat of products) {
      for (const sc of cat.subCategories) {
        for (const pt of sc.productTypes) {
          if (toSlug(pt.name) === slug) {
            fp = pt; fsc = { id: sc.id, name: sc.name }; fc = cat;
            break;
          }
        }
        if (fp) break;
      }
      if (fp) break;
    }
    return { foundProduct: fp, foundSubCategory: fsc, foundCategory: fc };
  }, [products, slug]);

  const productId = foundProduct?.id ?? 0;

  // Fetch specs for this product
  useEffect(() => {
    if (!productId) return;
    async function fetchSpecs() {
      const { data: specData } = await supabase
        .from("product_specifications")
        .select("*")
        .eq("product_id", productId)
        .order("sort_order")
        .order("id");
      const fetched = specData || [];
      setSpecs(fetched);

      const specIds = fetched.map((s: SpecRow) => s.id);
      if (specIds.length > 0) {
        const { data: optData } = await supabase
          .from("product_specification_options")
          .select("*")
          .in("specification_id", specIds)
          .order("sort_order")
          .order("id");
        setSpecOptions(optData || []);
      } else {
        setSpecOptions([]);
      }
    }
    fetchSpecs();
  }, [productId]);

  if (loading) return <ProductSkeleton />;

  if (!foundProduct || !foundCategory || !foundSubCategory) {
    return (
      <div className="max-w-screen-2xl mx-auto px-5 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-8">
          The product you are looking for does not exist.
        </p>
        <Link
          to="/"
          className="bg-secondaryBrown text-white px-6 py-3 rounded hover:bg-opacity-90"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (formData.quantity < 1) newErrors.quantity = "Quantity must be at least 1";
    if (!formData.contactName.trim()) newErrors.contactName = "Name is required";
    if (!formData.companyName.trim())
      newErrors.companyName = "Company name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    // Validate specs – all are mandatory
    for (const spec of specs) {
      const val = (specValues[spec.id] || "").trim();
      if (!val) {
        newErrors[`spec_${spec.id}`] = `${spec.field_label} is required`;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Build specifications string from spec values + freeform text
    const specLines = specs
      .map((s) => `${s.field_label}: ${specValues[s.id] || ""}`)
      .filter((l) => l.includes(": ") && !l.endsWith(": "));
    const allSpecs = [
      ...specLines,
      formData.specifications ? `Additional: ${formData.specifications}` : "",
    ].filter(Boolean).join("\n");

    const { error } = await supabase.from("quote_requests").insert({
      product_type_id: foundProduct!.id,
      product_name: foundProduct!.name,
      category_name: foundCategory!.name,
      subcategory_name: foundSubCategory!.name,
      quantity: formData.quantity,
      specifications: allSpecs,
      contact_name: formData.contactName,
      company_name: formData.companyName,
      email: formData.email,
      phone: formData.phone,
      delivery_location: formData.deliveryLocation,
    });

    if (error) {
      toast.error("Failed to submit quote request. Please try again.");
      console.error(error);
      return;
    }

    toast.success("Quote request submitted successfully!");
    setSubmitted(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? parseInt(value) || 0 : value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  if (submitted) {
    return (
      <div className="max-w-screen-2xl mx-auto px-5 py-16 text-center">
        <div className="max-w-lg mx-auto bg-green-50 border border-green-200 rounded-lg p-8">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-3xl font-bold mb-4 text-green-800">
            Quote Request Submitted
          </h1>
          <p className="text-green-700 mb-6">
            Your quote request for <strong>{foundProduct.name}</strong> has been
            submitted. Our sales team will contact you shortly with a custom quote.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={`/category/${toSlug(foundCategory.name)}`}
              className="bg-secondaryBrown text-white px-6 py-3 rounded hover:bg-opacity-90"
            >
              Continue Browsing
            </Link>
            <Link
              to="/"
              className="border border-secondaryBrown text-secondaryBrown px-6 py-3 rounded hover:bg-gray-50"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const PLACEHOLDER_IMAGE = "https://gynvfilnfwxbvnkbatpa.supabase.co/storage/v1/object/public/products/placeholder.jpeg";

  return (
    <div className="max-w-screen-2xl mx-auto px-5 max-[400px]:px-3 pb-16">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 my-4">
        <Link to="/" className="hover:text-black">Home</Link>
        <span className="mx-2">/</span>
        <Link to={`/category/${toSlug(foundCategory.name)}`} className="hover:text-black">
          {foundCategory.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-black">{foundProduct.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Product Info */}
        <div>
          <div className="mt-2">
            <h1 className="text-3xl font-bold">{foundProduct.name}</h1>

            <div className="mt-4 border-t pt-4">
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-gray-500">Category</span>
                <span className="font-medium flex items-center gap-2">
                  <span
                    className="inline-flex items-center justify-center w-6 h-6 rounded text-sm"
                    style={{ backgroundColor: `${getCategoryColor(foundCategory.id)}18` }}
                  >
                    {getCategoryIcon(foundCategory.id)}
                  </span>
                  {foundCategory.name}
                </span>
                <span className="text-gray-500">Subcategory</span>
                <span className="font-medium">{foundSubCategory.name}</span>
                <span className="text-gray-500">Product Type</span>
                <span className="font-medium">{foundProduct.name}</span>
              </div>
            </div>
          </div>
          <div className="rounded-lg h-[500px]">
            <img
              src={foundProduct.image_url || PLACEHOLDER_IMAGE}
              alt={foundProduct.name}
              className="w-full h-full object-cover mt-4"
            />
          </div>
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700 text-sm">
                <strong>B2B Pricing:</strong> Prices are customized based on
                quantity, specifications, and delivery requirements. Submit a
                quote request and our team will provide a competitive offer
                within 24 hours.
              </p>
            </div>
        </div>

        {/* Right: RFQ Form */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Request a Quote</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-secondaryBrown focus:border-transparent"
              />
              {errors.quantity && (
                <p className="text-red-600 text-xs mt-1">{errors.quantity}</p>
              )}
            </div>

            {/* Dynamic product specifications */}
            {specs.length > 0 && (
              <>
                <hr className="my-4" />
                <h3 className="text-lg font-semibold">Product Specifications</h3>
                {specs.map((spec) => {
                  const opts = specOptions.filter((o) => o.specification_id === spec.id);
                  const errKey = `spec_${spec.id}`;

                  if (spec.field_type === "fixed_text") {
                    return (
                      <div key={spec.id}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {spec.field_label} *
                        </label>
                        <input
                          type={spec.value_type === "number" ? "number" : "text"}
                          value={specValues[spec.id] || ""}
                          onChange={(e) => {
                            setSpecValues((prev) => ({ ...prev, [spec.id]: e.target.value }));
                            if (errors[errKey]) setErrors((prev) => { const n = { ...prev }; delete n[errKey]; return n; });
                          }}
                          className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-secondaryBrown focus:border-transparent"
                          placeholder={`Enter ${spec.field_label.toLowerCase()}…`}
                        />
                        {errors[errKey] && <p className="text-red-600 text-xs mt-1">{errors[errKey]}</p>}
                      </div>
                    );
                  }

                  if (spec.field_type === "select_option") {
                    return (
                      <div key={spec.id}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {spec.field_label} *
                        </label>
                        <select
                          value={specValues[spec.id] || ""}
                          onChange={(e) => {
                            setSpecValues((prev) => ({ ...prev, [spec.id]: e.target.value }));
                            if (errors[errKey]) setErrors((prev) => { const n = { ...prev }; delete n[errKey]; return n; });
                          }}
                          className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-secondaryBrown focus:border-transparent"
                        >
                          <option value="">Select {spec.field_label.toLowerCase()}…</option>
                          {opts.map((opt) => (
                            <option key={opt.id} value={opt.content}>
                              {opt.content}
                              {opt.heading && opt.heading !== opt.content ? ` (${opt.heading})` : ""}
                              {opt.subheading ? ` — ${opt.subheading}` : ""}
                            </option>
                          ))}
                        </select>
                        {errors[errKey] && <p className="text-red-600 text-xs mt-1">{errors[errKey]}</p>}
                      </div>
                    );
                  }

                  // radio_button
                  return (
                    <div key={spec.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {spec.field_label} *
                      </label>
                      <div className="space-y-2 mt-1">
                        {opts.map((opt) => (
                          <label
                            key={opt.id}
                            className={`flex items-start gap-3 p-3 border rounded-md cursor-pointer transition-colors ${
                              specValues[spec.id] === opt.content
                                ? "border-secondaryBrown bg-secondaryBrown/5"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`spec_${spec.id}`}
                              value={opt.content}
                              checked={specValues[spec.id] === opt.content}
                              onChange={(e) => {
                                setSpecValues((prev) => ({ ...prev, [spec.id]: e.target.value }));
                                if (errors[errKey]) setErrors((prev) => { const n = { ...prev }; delete n[errKey]; return n; });
                              }}
                              className="mt-0.5 accent-secondaryBrown"
                            />
                            <div>
                              <span className="text-sm font-medium">{opt.content}</span>
                              {opt.heading && opt.heading !== opt.content && (
                                <span className="text-xs text-gray-500 ml-1">({opt.heading})</span>
                              )}
                              {opt.subheading && (
                                <p className="text-xs text-gray-400">{opt.subheading}</p>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                      {errors[errKey] && <p className="text-red-600 text-xs mt-1">{errors[errKey]}</p>}
                    </div>
                  );
                })}
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Specifications / Requirements
              </label>
              <textarea
                name="specifications"
                rows={3}
                value={formData.specifications}
                onChange={handleChange}
                placeholder="Any additional specs, technical requirements, or details..."
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-secondaryBrown focus:border-transparent"
              />
            </div>

            <hr className="my-4" />
            <h3 className="text-lg font-semibold">Contact Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-secondaryBrown focus:border-transparent"
                />
                {errors.contactName && (
                  <p className="text-red-600 text-xs mt-1">{errors.contactName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-secondaryBrown focus:border-transparent"
                />
                {errors.companyName && (
                  <p className="text-red-600 text-xs mt-1">{errors.companyName}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-secondaryBrown focus:border-transparent"
                />
                {errors.email && (
                  <p className="text-red-600 text-xs mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-secondaryBrown focus:border-transparent"
                />
                {errors.phone && (
                  <p className="text-red-600 text-xs mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Location
              </label>
              <input
                type="text"
                name="deliveryLocation"
                value={formData.deliveryLocation}
                onChange={handleChange}
                placeholder="City, State or full address"
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-secondaryBrown focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-secondaryBrown text-white py-3 rounded-md text-lg font-medium hover:bg-opacity-90 transition-colors mt-4"
            >
              Request Quote
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
