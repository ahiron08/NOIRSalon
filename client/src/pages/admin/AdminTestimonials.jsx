import CrudPage from './CrudPage.jsx';

export default function AdminTestimonials() {
  return (
    <CrudPage
      title="Testimonials"
      endpoint="testimonials"
      fields={{
        image: { type: 'hidden' },
        photo: { type: 'image', label: 'Photo' },
        rating: { type: 'number', label: 'Rating (1-5)', required: true },
        text: { type: 'textarea', label: 'Text', required: true },
        service: { type: 'text', label: 'Service' },
        source: { type: 'text', label: 'Source' },
      }}
      emptyMessage="No testimonials yet."
    />
  );
}
