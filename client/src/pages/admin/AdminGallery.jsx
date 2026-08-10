import CrudPage from './CrudPage.jsx';

export default function AdminGallery() {
  return (
    <CrudPage
      title="Gallery"
      endpoint="gallery"
      fields={{
        name: { type: 'hidden' },
        title: { type: 'text', label: 'Title' },
        mediaType: {
          type: 'select',
          label: 'Media type',
          options: [
            { value: 'image', label: 'Image (Instagram post / photo)' },
            { value: 'reel', label: 'Reel (short video)' },
          ],
        },
        category: { type: 'text', label: 'Category' },
        image: { type: 'image', label: 'Image / Poster' },
        reelUrl: { type: 'text', label: 'Reel / Video URL (for reels)' },
        source: {
          type: 'select',
          label: 'Where it shows',
          options: [
            { value: 'upload', label: 'Portfolio gallery' },
            { value: 'instagram', label: 'Instagram feed section' },
          ],
        },
        permalink: { type: 'text', label: 'Instagram permalink (optional)' },
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
      emptyMessage="No gallery items yet."
    />
  );
}