import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createProduct, ProductData } from '../services/firestore';

interface AddProductFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onSuccess, onCancel }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    inventory: '',
    isCustomizable: false,
    materials: '',
    occasion: '',
    tags: '',
    images: [] as string[]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // TODO: Implement image upload to Firebase Storage
    // Remove placeholder URLs, only add uploaded image URLs
    // You should implement actual upload logic here, e.g. using uploadMultipleImages
    // For now, do nothing or show an error if not implemented
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      const productData: ProductData = {
        id: '', // This will be set by Firestore
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        artisanId: currentUser.uid,
        inventory: parseInt(formData.inventory),
        attributes: {},
        tags: formData.tags.split(',').map(tag => tag.trim()),
        isCustomizable: formData.isCustomizable,
        images: formData.images,
        materials: formData.materials ? formData.materials.split(',').map(m => m.trim()) : undefined,
        occasion: formData.occasion || undefined,
        currency: 'USD',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const { error } = await createProduct(productData);
      
      if (error) {
        setError(error.message);
      } else {
        onSuccess();
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create product');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 relative">
      <button
        onClick={onCancel}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
        aria-label="Close form"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <h2 className="text-2xl font-bold text-dark mb-6">Add New Product</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-dark-700">
            Product Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-12 px-4"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-dark-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-4"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-dark-700">
              Price (₹)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-12 px-4"
            />
          </div>

          <div>
            <label htmlFor="inventory" className="block text-sm font-medium text-dark-700">
              Inventory
            </label>
            <input
              type="number"
              id="inventory"
              name="inventory"
              required
              min="0"
              value={formData.inventory}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-12 px-4"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-dark-700">
              Category
            </label>
            <select
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-12 px-4"
            >
              <option value="">Select a category</option>
              <option value="Home & Living">Home & Living</option>
              <option value="Jewelry">Jewelry</option>
              <option value="Art">Art</option>
              <option value="Candles">Candles</option>
              <option value="Clothing">Clothing</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>

          <div>
            <label htmlFor="subcategory" className="block text-sm font-medium text-dark-700">
              Subcategory (Optional)
            </label>
            <input
              type="text"
              id="subcategory"
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-12 px-4"
            />
          </div>
        </div>

        <div>
          <label htmlFor="materials" className="block text-sm font-medium text-dark-700">
            Materials (comma-separated)
          </label>
          <input
            type="text"
            id="materials"
            name="materials"
            value={formData.materials}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-12 px-4"
          />
        </div>

        <div>
          <label htmlFor="occasion" className="block text-sm font-medium text-dark-700">
            Occasion (Optional)
          </label>
          <input
            type="text"
            id="occasion"
            name="occasion"
            value={formData.occasion}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-12 px-4"
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-dark-700">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-12 px-4"
          />
        </div>

        <div>
          <label htmlFor="images" className="block text-sm font-medium text-dark-700">
            Product Images
          </label>
          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {[...formData.images].reverse().map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md"
                  />
                </div>
              ))}
            </div>
          )}
          <input
            type="file"
            id="images"
            name="images"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="mt-1 block w-full text-sm text-dark-500
              file:mr-4 file:py-3 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-primary-50 file:text-primary
              hover:file:bg-primary-100
              h-12"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isCustomizable"
            name="isCustomizable"
            checked={formData.isCustomizable}
            onChange={handleChange}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="isCustomizable" className="ml-2 block text-sm text-dark-700">
            This product can be customized
          </label>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-dark-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductForm; 