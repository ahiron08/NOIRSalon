import CrudPage from './CrudPage.jsx';

export default function AdminGiftCards() {
  return (
    <CrudPage
      title="Gift Cards"
      endpoint="giftcards"
      fields={{
        image: { type: 'hidden' },
        name: { type: 'hidden' },
        code: { type: 'text', label: 'Code', required: true },
        amount: { type: 'number', label: 'Amount', required: true },
        balance: { type: 'number', label: 'Balance', required: true },
        currency: { type: 'text', label: 'Currency', default: 'INR' },
        expiresAt: { type: 'text', label: 'Expires At (YYYY-MM-DD)' },
        active: { type: 'checkbox', label: 'Active', default: true },
      }}
      emptyMessage="No gift cards yet."
    />
  );
}
