import CrudPage from './CrudPage.jsx';

export default function AdminMemberships() {
  return (
    <CrudPage
      title="Memberships"
      endpoint="memberships"
      fields={{
        image: { type: 'image', label: 'Image' },
        tagline: { type: 'text', label: 'Tagline' },
        price: { type: 'number', label: 'Price', required: true },
        billing: { type: 'text', label: 'Billing (monthly/yearly)' },
        perks: { type: 'textarea', label: 'Perks (comma separated)' },
        savings: { type: 'number', label: 'Savings Amount' },
      }}
      transform={(item) => ({
        ...item,
        perks: Array.isArray(item.perks) ? item.perks.join(', ') : item.perks || '',
      })}
      reverseTransform={(data) => ({
        ...data,
        perks: typeof data.perks === 'string' 
          ? data.perks.split(',').map(p => p.trim()).filter(Boolean)
          : data.perks || [],
      })}
      emptyMessage="No memberships yet."
    />
  );
}
