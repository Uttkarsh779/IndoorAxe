import { Link } from 'react-router-dom';
import Card from './Card.jsx';

export default function ProductCard({ product }) {
  const image = product.images?.main;
  return (
    <Card className="flex flex-col overflow-hidden transition hover:shadow-md">
      <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {image ? (
          <img src={image} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">No image</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand-accent">{product.productType}</span>
        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
        {product.startPriceWritten && <p className="text-sm text-gray-500">{product.startPriceWritten}</p>}
        {product.startPrice && <p className="text-sm font-medium text-gray-700">Starting ₹{product.startPrice}</p>}
        <Link to={`/products/${product.slug}`} className="mt-auto text-sm font-semibold text-brand hover:underline">
          View details →
        </Link>
      </div>
    </Card>
  );
}
