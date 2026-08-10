import CrudPage from './CrudPage.jsx';

export default function AdminVideos() {
  return (
    <CrudPage
      title="Videos"
      endpoint="videos"
      fields={{
        image: { type: 'hidden' },
        name: { type: 'hidden' },
        title: { type: 'text', label: 'Title', required: true },
        description: { type: 'textarea', label: 'Description' },
        url: { type: 'text', label: 'External URL (YouTube/Vimeo)' },
        file: { type: 'text', label: 'Video URL/Path' },
        thumbnail: { type: 'image', label: 'Thumbnail' },
      }}
      emptyMessage="No videos yet."
    />
  );
}
