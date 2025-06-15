import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getProductsByArtisan, deleteProduct, ProductData } from '../../services/firestore';
import EditProductForm from '../../components/artisan/EditProductForm';

const ArtisanProducts: React.FC = () => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      if (!currentUser) {
        setError('You must be logged in to view your products');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const { products, error } = await getProductsByArtisan(currentUser.uid);
        
        if (error) {
          console.error('Error fetching products:', error);
          setError(error);
        } else {
          setProducts(products || []);
        }
      } catch (err: any) {
        console.error('Error in fetchProducts:', err);
        setError(err.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentUser]);

  const handleDeleteProduct = async (productId: string) => {
    if (!productId) {
      console.error('Cannot delete product: No product ID provided');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const { success, error } = await deleteProduct(productId);
      if (error) {
        setError(error);
      } else if (success) {
        setProducts(products.filter(p => p.id !== productId));
      }
    } catch (err: any) {
      console.error('Error deleting product:', err);
      setError(err.message || 'Failed to delete product');
    }
  };

  const handleEditProduct = (product: ProductData) => {
    setEditingProduct(product);
  };

  const handleEditSuccess = async () => {
    setEditingProduct(null);
    // Refresh the products list
    if (currentUser) {
      try {
        const { products, error } = await getProductsByArtisan(currentUser.uid);
        if (error) {
          setError(error);
        } else {
          setProducts(products || []);
        }
      } catch (err: any) {
        console.error('Error refreshing products:', err);
        setError(err.message || 'Failed to refresh products');
      }
    }
  };

  const handleEditCancel = () => {
    setEditingProduct(null);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-500">
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-primary hover:text-primary-700 underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark mb-4">My Products</h1>
        <a
          href="/artisan/products/new"
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          + Add Product
        </a>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 appearance-none relative block px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
        />
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
        >
          <option value="">All Categories</option>
          <option value="jewelry">Jewelry</option>
          <option value="home-decor">Home Decor</option>
          <option value="clothing">Clothing</option>
          <option value="art">Art</option>
          <option value="accessories">Accessories</option>
          <option value="ceramics">Ceramics</option>
          <option value="woodwork">Woodwork</option>
        </select>
      </div>

      {editingProduct ? (
        <EditProductForm
          product={editingProduct}
          onSuccess={handleEditSuccess}
          onCancel={handleEditCancel}
        />
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inventory
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-md object-cover"
                          src={product.images[0]}
                          alt={product.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-dark">{product.name}</div>
                        <div className="text-sm text-dark-500">{product.description.substring(0, 50)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-dark">{product.category}</div>
                    {product.subcategory && (
                      <div className="text-sm text-dark-500">{product.subcategory}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.discountedPrice && product.discountedPrice < product.price ? (
                      <>
                        <div className="text-sm text-primary font-bold">{product.discountedPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</div>
                        <div className="text-sm text-dark-500 line-through">{product.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</div>
                      </>
                    ) : (
                      <div className="text-sm text-dark">{product.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-dark">{product.inventory}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.inventory > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.inventory > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="text-primary hover:text-primary-700 mr-4"
                    >
                      Edit
                    </button>
                    {product.id && (
                      <button
                        onClick={() => handleDeleteProduct(product.id as string)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ArtisanProducts; 