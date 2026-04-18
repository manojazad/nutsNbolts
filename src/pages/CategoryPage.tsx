import { useParams, Link } from "react-router-dom";
import { useProducts } from "../hooks/useData";
import { toSlug } from "../utils/slug";
import { getCategoryColor, getCategoryIcon } from "../utils/categoryMeta";
import { useState } from "react";
import ProductItem from "../components/ProductItem";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { products, loading } = useProducts();
  const [activeSubCat, setActiveSubCat] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-5 py-16 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  const category = products.find((c) => toSlug(c.name) === slug);

  if (!category) {
    return (
      <div className="max-w-screen-2xl mx-auto px-5 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Category Not Found</h1>
        <p className="text-gray-600 mb-8">
          The category you are looking for does not exist.
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

  const filteredSubCategories = activeSubCat
    ? category.subCategories.filter((sc) => sc.id === activeSubCat)
    : category.subCategories;

  return (
    <div className="max-w-screen-2xl mx-auto px-5 max-[400px]:px-3">
      {/* Category Header */}
      <div
        className="rounded-lg text-white p-8 my-6 flex items-center gap-5"
        style={{ backgroundColor: getCategoryColor(category.id) }}
      >
        <span className="text-5xl">{getCategoryIcon(category.id)}</span>
        <div>
          <h1 className="text-4xl font-bold max-sm:text-2xl">{category.name}</h1>
          <p className="text-white/80 mt-2">
            {category.subCategories.length} subcategories &middot;{" "}
            {category.subCategories.reduce(
              (sum, sc) => sum + sc.productTypes.length,
              0
            )}{" "}
            products
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-black">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-black">{category.name}</span>
      </nav>

      {/* Subcategory Filter */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-3">Subcategories</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSubCat(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeSubCat === null
                ? "bg-secondaryBrown text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {category.subCategories.map((sc) => (
            <button
              key={sc.id}
              onClick={() =>
                setActiveSubCat(activeSubCat === sc.id ? null : sc.id)
              }
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeSubCat === sc.id
                  ? "bg-secondaryBrown text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {sc.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredSubCategories.map((sc) => (
        <div key={sc.id} className="mb-10">
          <h3 className="text-2xl font-semibold mb-4 border-b pb-2">
            {sc.name}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
        </div>
      ))}
    </div>
  );
};

export default CategoryPage;
