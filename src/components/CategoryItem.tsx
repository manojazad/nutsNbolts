import { Link } from "react-router-dom";
import { getCategoryImage } from "../utils/categoryMeta";

interface CategoryItemProps {
  id: number;
  name: string;
  slug: string;
}

const CategoryItem = ({ id, name, slug }: CategoryItemProps) => {
  return (
    <Link
      to={`/category/${slug}`}
      className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
    >
      <div className="h-40 overflow-hidden">
        <img
          src={getCategoryImage(id)}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2">
          {name}
        </h3>
      </div>
      <div className="bg-white p-3 text-center">
        <span className="text-sm text-gray-600 group-hover:text-black transition-colors">
          View Products &rarr;
        </span>
      </div>
    </Link>
  );
};

export default CategoryItem;
