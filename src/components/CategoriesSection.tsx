import { Link } from "react-router-dom";
import { useCategories } from "../hooks/useData";
import { toSlug } from "../utils/slug";


const CategoriesSection = () => {
  const { categories, loading } = useCategories();

  if (loading) {
    return (
      <div className="max-w-screen-2xl px-5 mx-auto mt-20">
        <h2 className="text-black text-5xl font-normal tracking-[1.56px] max-sm:text-4xl mb-12">
          Our Categories
        </h2>
        <div className="text-center py-12 text-gray-500">Loading categories...</div>
      </div>
    );
  }

  return (
    <div id="categories" className="max-w-screen-2xl px-5 mx-auto mt-8">
      <h2 className="text-black text-5xl font-normal tracking-[1.56px] max-sm:text-4xl mb-12">
        Our Categories
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/category/${toSlug(cat.name)}`}
            className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="h-40 overflow-hidden">
              <img
                src={cat.image_url || ""}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2">
                {cat.name}
              </h3>
              <span className="text-sm text-secondaryBrown font-medium group-hover:underline">
                View Products &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoriesSection;
