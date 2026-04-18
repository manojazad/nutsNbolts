import { useParams, Link } from "react-router-dom";
import { useProducts } from "../hooks/useData";
import { toSlug } from "../utils/slug";
import {
  getCategoryIcon,
  getCategoryImage,
} from "../utils/categoryMeta";
import { useState } from "react";
import ProductItem from "../components/ProductItem";

/* ── Skeleton loader ── */
const SkeletonPulse = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const CategorySkeleton = () => (
  <div className="max-w-screen-2xl mx-auto px-5 max-[400px]:px-3 py-4">
    {/* banner skeleton */}
    <div className="flex gap-6 my-6">
      <SkeletonPulse className="w-40 h-40 sm:w-48 sm:h-48 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-3 py-2">
        <SkeletonPulse className="h-8 w-2/3" />
        <SkeletonPulse className="h-4 w-1/3" />
        <SkeletonPulse className="h-4 w-1/2" />
      </div>
    </div>
    {/* breadcrumb */}
    <div className="flex gap-2 mb-6">
      <SkeletonPulse className="h-4 w-12" />
      <SkeletonPulse className="h-4 w-4" />
      <SkeletonPulse className="h-4 w-32" />
    </div>
    {/* filter pills */}
    <div className="flex gap-2 mb-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonPulse key={i} className="h-9 w-24 rounded-full" />
      ))}
    </div>
    {/* section title */}
    <SkeletonPulse className="h-6 w-44 mb-4" />
    {/* product cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="border border-gray-100 rounded-lg p-4 space-y-3">
          <div className="flex gap-3">
            <SkeletonPulse className="h-10 w-10 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonPulse className="h-4 w-full" />
              <SkeletonPulse className="h-3 w-2/3" />
            </div>
          </div>
          <SkeletonPulse className="h-3 w-20" />
          <SkeletonPulse className="h-9 w-full rounded" />
        </div>
      ))}
    </div>
  </div>
);

/* ── Main component ── */
const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { products, loading } = useProducts();
  const [activeSubCat, setActiveSubCat] = useState<number | null>(null);

  if (loading) return <CategorySkeleton />;

  const category = products.find((c) => toSlug(c.name) === slug);

  if (!category) {
    return (
      <div className="max-w-screen-2xl mx-auto px-5 py-24 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-3xl font-bold mb-3">Category Not Found</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          The category you are looking for doesn't exist or may have been removed.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-secondaryBrown text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    );
  }

  const totalProducts = category.subCategories.reduce(
    (sum, sc) => sum + sc.productTypes.length,
    0
  );

  const filteredSubCategories = activeSubCat
    ? category.subCategories.filter((sc) => sc.id === activeSubCat)
    : category.subCategories;

  return (
    <div className="max-w-screen-2xl mx-auto px-5 max-[400px]:px-3 pb-16">
      {/* ── Hero Banner ── */}
      <div className="flex gap-4 my-5 items-center">
        {/* Image — hidden on mobile */}
        <div className="hidden sm:block w-36 h-36 md:w-44 md:h-44 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
          <img
            src={getCategoryImage(category.id)}
            alt={category.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl sm:text-3xl">
              {getCategoryIcon(category.id)}
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              {category.name}
            </h1>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm">
            {category.subCategories.length} subcategories &middot; {totalProducts} products
          </p>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-lg hidden sm:block">
            Browse our full range of {category.name.toLowerCase()} products. Select a subcategory or request a quote on any item.
          </p>
        </div>
      </div>

      {/* ── Breadcrumb ── */}
      <nav className="text-xs sm:text-sm text-gray-400 mb-4 flex items-center gap-1.5">
        <Link to="/" className="hover:text-secondaryBrown transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{category.name}</span>
      </nav>

      {/* ── Subcategory Filter ── */}
      <div className="mb-6">
        {/* Mobile: compact select dropdown */}
        <div className="sm:hidden">
          <select
            value={activeSubCat ?? ""}
            onChange={(e) =>
              setActiveSubCat(e.target.value ? Number(e.target.value) : null)
            }
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-secondaryBrown focus:border-transparent outline-none"
          >
            <option value="">All Subcategories ({totalProducts})</option>
            {category.subCategories.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.name} ({sc.productTypes.length})
              </option>
            ))}
          </select>
        </div>

        {/* Desktop: pill buttons */}
        <div className="hidden sm:block">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-lg font-bold">Browse by Subcategory</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {category.subCategories.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveSubCat(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                activeSubCat === null
                  ? "bg-secondaryBrown text-white border-secondaryBrown shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              All ({totalProducts})
            </button>
            {category.subCategories.map((sc) => (
              <button
                key={sc.id}
                onClick={() =>
                  setActiveSubCat(activeSubCat === sc.id ? null : sc.id)
                }
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  activeSubCat === sc.id
                    ? "bg-secondaryBrown text-white border-secondaryBrown shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {sc.name}
                <span className="ml-1.5 opacity-70">({sc.productTypes.length})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Product Sections ── */}
      {filteredSubCategories.map((sc) => (
        <section key={sc.id} className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-5 rounded-full bg-secondaryBrown" />
            <h3 className="text-base sm:text-xl font-bold text-gray-900">{sc.name}</h3>
            <span className="text-xs text-gray-400">
              {sc.productTypes.length}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {sc.productTypes.map((pt) => (
              <ProductItem
                key={pt.id}
                productId={pt.id}
                productName={pt.name}
                categoryId={category.id}
                categoryName={category.name}
                subCategoryName={sc.name}
                slug={toSlug(pt.name)}
              />
            ))}
          </div>
        </section>
      ))}

      {filteredSubCategories.length === 0 && (
        <div className="py-16 text-center text-gray-400">
          <div className="text-4xl mb-3">📭</div>
          <p>No products found in this subcategory.</p>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
