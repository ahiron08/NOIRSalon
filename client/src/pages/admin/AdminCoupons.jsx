import CrudPage from './CrudPage.jsx';

export default function AdminCoupons() {
  return (
    <CrudPage
      title="Coupons"
      endpoint="coupons"
      fields={{
        image: { type: 'hidden' },
        name: { type: 'hidden' },
        code: { type: 'text', label: 'Code', required: true },
        type: { type: 'text', label: 'Type (percent/fixed)' },
        value: { type: 'number', label: 'Value', required: true },
        minOrder: { type: 'number', label: 'Minimum Order' },
        usageLimit: { type: 'number', label: 'Usage Limit' },
        perUserLimit: { type: 'number', label: 'Per User Limit' },
      }}
      emptyMessage="No coupons yet."
    />
  );
}
