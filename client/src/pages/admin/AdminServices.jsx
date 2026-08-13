import CrudPage from './CrudPage.jsx';

export default function AdminServices() {
  return (
    <CrudPage
      title="Services"
      endpoint="services"
      fields={{
        category: { type: 'text', label: 'Category ID' },
        price: { type: 'number', label: 'Price', required: true },
        offerPrice: { type: 'number', label: 'Offer Price' },
        duration: { type: 'number', label: 'Duration (min)', required: true, integer: true, min: 1, minMessage: 'at least 1 minute' },
        benefits: { type: 'textarea', label: 'Benefits (comma separated)' },
        suitableFor: { type: 'text', label: 'Suitable For' },
        showOnHome: { type: 'checkbox', label: 'Show on Home', default: false },
      }}
      transform={(item) => ({
        ...item,
        benefits: Array.isArray(item.benefits) ? item.benefits.join(', ') : item.benefits || '',
      })}
      reverseTransform={(data) => ({
        ...data,
        benefits: typeof data.benefits === 'string' 
          ? data.benefits.split(',').map(b => b.trim()).filter(Boolean)
          : data.benefits || [],
      })}
      emptyMessage="No services yet."

    />
  );
}
