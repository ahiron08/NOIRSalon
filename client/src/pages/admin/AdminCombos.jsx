import CrudPage from './CrudPage.jsx';

export default function AdminCombos() {
  return (
    <CrudPage
      title="Combos"
      endpoint="combos"
      fields={{
        tagline: { type: 'text', label: 'Tagline' },
        description: { type: 'textarea', label: 'Description' },
        image: { type: 'image', label: 'Image' },
        originalPrice: { type: 'number', label: 'Original Price', required: true },
        offerPrice: { type: 'number', label: 'Offer Price', required: true },
        estimatedDuration: { type: 'number', label: 'Duration (min)' },
        features: { type: 'textarea', label: 'Features (comma separated)' },
        showOnHome: { type: 'checkbox', label: 'Show on Home', default: false },
      }}
      transform={(item) => ({
        ...item,
        features: Array.isArray(item.features) ? item.features.join(', ') : item.features || '',
      })}
      reverseTransform={(data) => ({
        ...data,
        features: typeof data.features === 'string' 
          ? data.features.split(',').map(f => f.trim()).filter(Boolean)
          : data.features || [],
      })}
      emptyMessage="No combos yet."
    />
  );
}
