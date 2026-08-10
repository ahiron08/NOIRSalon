import CrudPage from './CrudPage.jsx';

export default function AdminProducts() {
  return (
    <CrudPage
      title="Products"
      endpoint="products"
      fields={{
        category: { type: 'text', label: 'Category ID' },
        price: { type: 'number', label: 'Price', required: true },
        compareAtPrice: { type: 'number', label: 'Compare At Price' },
        stock: { type: 'number', label: 'Stock' },
        brand: { type: 'text', label: 'Brand' },
        sku: { type: 'text', label: 'SKU' },
        rating: { type: 'number', label: 'Rating' },
        numReviews: { type: 'number', label: 'Number of Reviews' },
        tags: { type: 'textarea', label: 'Tags (comma separated)' },
      }}
      transform={(item) => ({
        ...item,
        tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags || '',
      })}
      reverseTransform={(data) => ({
        ...data,
        tags: typeof data.tags === 'string' 
          ? data.tags.split(',').map(t => t.trim()).filter(Boolean)
          : data.tags || [],
      })}
      emptyMessage="No products yet."

    />
  );
}
