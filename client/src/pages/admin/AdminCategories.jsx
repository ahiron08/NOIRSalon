import CrudPage from './CrudPage.jsx';

export default function AdminCategories() {
  return (
    <CrudPage
      title="Categories"
      endpoint="categories"
      fields={{
        type: { type: 'text', label: 'Type (service/product/gallery/blog)' },
        description: { type: 'textarea', label: 'Description' },
        image: { type: 'image', label: 'Image' },
        icon: { type: 'text', label: 'Icon' },
        showOnHome: { type: 'checkbox', label: 'Show on Home', default: false },
      }}
      emptyMessage="No categories yet."
    />
  );
}
