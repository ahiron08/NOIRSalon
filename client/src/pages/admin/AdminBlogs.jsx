import CrudPage from './CrudPage.jsx';

export default function AdminBlogs() {
  return (
    <CrudPage
      title="Blogs"
      endpoint="blogs"
      fields={{
        image: { type: 'hidden' },
        name: { type: 'hidden' },
        title: { type: 'text', label: 'Title', required: true },
        excerpt: { type: 'textarea', label: 'Excerpt' },
        content: { type: 'textarea', label: 'Content', required: true },
        cover: { type: 'image', label: 'Cover Image' },
        category: { type: 'text', label: 'Category' },
        tags: { type: 'textarea', label: 'Tags (comma separated)' },
        author: { type: 'text', label: 'Author' },
        authorImage: { type: 'image', label: 'Author Image' },
        readTime: { type: 'number', label: 'Read Time (min)' },
        status: { type: 'text', label: 'Status (draft/published)' },
        publishedAt: { type: 'text', label: 'Published At (YYYY-MM-DD)' },
        metaTitle: { type: 'text', label: 'Meta Title' },
        metaDescription: { type: 'textarea', label: 'Meta Description' },
      }}
      emptyMessage="No blog posts yet."
    />
  );
}
