import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader.jsx';
import Section from '../components/layout/Section.jsx';
import { apiFetch } from '../services/api.js';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const json = await apiFetch(`/content/blogs/by-slug/${slug}`);
        setPost(json.data);
      } catch (e) {
        console.error('Failed to load post', e);
      }
    })();
  }, [slug]);

  if (!post) return <div className="min-h-screen bg-black" />;

  return (
    <>
      <PageHeader title={post.title} subtitle={post.category} />
      <Section>
        <article className="mx-auto max-w-3xl">
          {post.cover && (
            <div className="mb-10 aspect-[16/9] w-full bg-neutral-900">
              <img src={post.cover} alt={post.title} className="h-full w-full object-cover" />
            </div>
          )}
          <div className="flex items-center gap-6 text-xs text-noir-muted">
            <span>{post.author}</span>
            <span>•</span>
            <span>{post.readTime ? `${post.readTime} min read` : ''}</span>
            <span>•</span>
            <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
          </div>
          <div 
            className="prose prose-invert mt-10 text-noir-muted" 
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />
          <div className="mt-12">
            <Link to="/blog" className="inline-flex items-center text-noir-gold hover:text-white transition-colors">
              ← Back to Journal
            </Link>
          </div>
        </article>
      </Section>
    </>
  );
}