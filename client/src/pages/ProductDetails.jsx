import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader.jsx';
import Section from '../components/layout/Section.jsx';
import { BookButton } from '../components/Buttons.jsx';

export default function ProductDetails() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/v1/content/products/by-slug/${slug}`);
        const json = await res.json();
        setProduct(json.data);
      } catch (e) {
        console.error('Failed to load product', e);
      }
    })();
  }, [slug]);

  if (!product) return <div className="min-h-screen bg-black" />;

  return (
    <>
      <PageHeader title={product.name} subtitle="Product Details" />
      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="aspect-[3/4] w-full bg-neutral-900 relative overflow-hidden">
            {product.image && (
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            )}
          </div>
          <div>
            <h3 className="font-display text-3xl text-white">{product.name}</h3>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-noir-muted">{product.brand}</p>
            <p className="mt-4 text-noir-muted">{product.description}</p>
            <div className="mt-6 flex items-center gap-6">
              <div>
                <span className="text-noir-gold text-2xl">₹{product.price}</span>
                {product.compareAtPrice > product.price && (
                  <span className="ml-3 text-noir-muted line-through">₹{product.compareAtPrice}</span>
                )}
              </div>
              {product.rating > 0 && (
                <div className="text-sm text-noir-gold">★ {product.rating} ({product.numReviews || 0} reviews)</div>
              )}
            </div>
            <div className="mt-6 flex items-center gap-4">
              <label className="text-xs uppercase tracking-wider text-noir-muted">Qty</label>
              <div className="flex items-center border border-white/15">
                <button 
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-4 py-2 text-white hover:text-noir-gold transition-colors"
                >
                  −
                </button>
                <span className="px-4 py-2 text-white">{qty}</span>
                <button 
                  onClick={() => setQty(qty + 1)}
                  className="px-4 py-2 text-white hover:text-noir-gold transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            {product.stock > 0 ? (
              <div className="mt-8"><BookButton label="Add to Cart" href={`/products/${product.slug}`} delay={0} /></div>
            ) : (
              <span className="mt-8 inline-block text-xs uppercase tracking-wider text-noir-muted">Out of Stock</span>
            )}
            <div className="mt-8 border-t border-white/10 pt-8">
              <h4 className="text-xs uppercase tracking-[0.25em] text-noir-muted mb-4">Product Details</h4>
              <ul className="space-y-2 text-sm text-noir-muted">
                <li>SKU: {product.sku || 'N/A'}</li>
                <li>Category: {product.category?.name || 'N/A'}</li>
                <li>Availability: {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</li>
              </ul>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}