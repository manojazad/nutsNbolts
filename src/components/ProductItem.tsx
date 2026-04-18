import { Link } from "react-router-dom";
import { getCategoryColor, getCategoryIcon } from "../utils/categoryMeta";

interface ProductItemProps {
  productId: number;
  productName: string;
  categoryId: number;
  categoryName: string;
  subCategoryName: string;
  slug: string;
}

const ProductItem = ({
  productId,
  productName,
  categoryId,
  slug,
  subCategoryName,
}: ProductItemProps) => {
  return (
    <Link
      to={`/product/${slug}`}
      className="bg-white rounded-lg border border-gray-200 hover:border-secondaryBrown hover:shadow-md transition-all flex flex-col p-4 group"
    >
      <div className="flex items-start gap-3 mb-3">
        <span
          className="text-2xl w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${getCategoryColor(categoryId)}18` }}
        >
          {getCategoryIcon(categoryId)}
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-gray-900 leading-tight group-hover:text-secondaryBrown transition-colors">
            {productName}
          </h3>
          <p className="text-xs text-gray-500 mt-1">{subCategoryName}</p>
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-3">SKU: PT-{productId}</p>
      <div className="mt-auto">
        <span className="block w-full text-center bg-secondaryBrown text-white py-2 rounded text-sm font-medium group-hover:bg-opacity-90 transition-colors">
          Get Quote
        </span>
      </div>
    </Link>
  );
};

export default ProductItem;
