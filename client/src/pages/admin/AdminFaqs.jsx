import CrudPage from './CrudPage.jsx';

export default function AdminFaqs() {
  return (
    <CrudPage
      title="FAQs"
      endpoint="faqs"
      fields={{
        image: { type: 'hidden' },
        name: { type: 'hidden' },
        question: { type: 'text', label: 'Question', required: true },
        answer: { type: 'textarea', label: 'Answer', required: true },
        category: { type: 'text', label: 'Category' },
        order: { type: 'number', label: 'Order' },
      }}
      emptyMessage="No FAQs yet."
    />
  );
}
