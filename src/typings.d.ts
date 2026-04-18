interface Category {
  id: number;
  name: string;
}

interface ProductType {
  id: number;
  name: string;
}

interface SubCategory {
  id: number;
  name: string;
  productTypes: ProductType[];
}

interface CategoryWithProducts extends Category {
  subCategories: SubCategory[];
}

interface QuoteRequest {
  productId: number;
  productName: string;
  categoryName: string;
  subCategoryName: string;
  quantity: number;
  specifications: string;
  contactName: string;
  companyName: string;
  email: string;
  phone: string;
  deliveryLocation: string;
}
