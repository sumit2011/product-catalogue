import { Link } from "wouter";
import { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  showActions?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export function ProductCard({ product, showActions = true, onEdit, onDelete }: ProductCardProps) {
  const defaultImage = "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f";

  const getStockStatusClass = (status: string) => {
    switch (status) {
      case "in_stock":
        return "bg-green-100 text-green-800";
      case "low_stock":
        return "bg-yellow-100 text-yellow-800";
      case "out_of_stock":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden group">
      <div className="aspect-w-1 aspect-h-1 bg-gray-100">
        <img 
          src={product.imageUrl || defaultImage} 
          alt={product.name} 
          className="w-full h-44 object-contain p-4 group-hover:scale-105 transition-transform duration-300" 
        />
      </div>
      <div className="p-4 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-700">{product.name}</h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-1">{product.description || 'No description'}</p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-lg font-medium text-gray-900">₹{product.price.toLocaleString()}</p>
          <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getStockStatusClass(product.stockStatus)}`}>
            {formatStatus(product.stockStatus)}
          </span>
        </div>
        
        {showActions && (
          <div className="mt-3 flex justify-between items-center">
            {onEdit && onDelete ? (
              <>
                <button 
                  onClick={() => onEdit(product)} 
                  className="text-primary-700 text-sm font-medium flex items-center hover:text-primary-800"
                >
                  <i className="ri-edit-line mr-1"></i> Edit
                </button>
                <button 
                  onClick={() => onDelete(product)}
                  className="text-red-600 text-sm font-medium flex items-center hover:text-red-700"
                >
                  <i className="ri-delete-bin-line mr-1"></i> Delete
                </button>
              </>
            ) : (
              <Link href={`/products/${product.id}`}>
                <a className="text-primary-700 text-sm font-medium flex items-center hover:text-primary-800">
                  View Details <i className="ri-arrow-right-line ml-1"></i>
                </a>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
