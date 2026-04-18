import { useParams, Link } from "react-router-dom";
import { useProducts } from "../hooks/useData";
import { toSlug } from "../utils/slug";
import { getCategoryColor, getCategoryIcon, getCategoryImage } from "../utils/categoryMeta";
import { useState } from "react";
import toast from "react-hot-toast";

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

  if (loading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-5 py-16 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  // Find product across all categories
  let foundProduct: { id: number; name: string } | null = null;
  let foundSubCategory: { id: number; name: string } | null = null;
  let foundCategory: CategoryWithProducts | null = null;

  for (const cat of products) {
    for (const sc of cat.subCategories) {
      for (const pt of sc.productTypes) {
        if (toSlug(pt.name) === slug) {
          foundProduct = pt;
          foundSubCategory = { id: sc.id, name: sc.name };
          foundCategory = cat;
          break;
        }
      }
      if (foundProduct) break;
    }
    if (foundProduct) break;
  }

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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const quoteRequest: QuoteRequest = {
      productId: foundProduct!.id,
      productName: foundProduct!.name,
      categoryName: foundCategory!.name,
      subCategoryName: foundSubCategory!.name,
      ...formData,
    };
    console.log("Quote Request Submitted:", quoteRequest);
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
          <div className="rounded-lg overflow-hidden h-72">
            <img
              src={getCategoryImage(foundCategory.id)}
              alt={foundCategory.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="mt-6">
            <h1 className="text-3xl font-bold">{foundProduct.name}</h1>
            <p className="text-gray-500 mt-1">SKU: PT-{foundProduct.id}</p>

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

            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700 text-sm">
                <strong>B2B Pricing:</strong> Prices are customized based on
                quantity, specifications, and delivery requirements. Submit a
                quote request and our team will provide a competitive offer
                within 24 hours.
              </p>
            </div>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specifications / Requirements
              </label>
              <textarea
                name="specifications"
                rows={4}
                value={formData.specifications}
                onChange={handleChange}
                placeholder="Describe your custom specs, technical requirements, or additional details..."
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
