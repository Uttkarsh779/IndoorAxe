import { Link } from 'react-router-dom';
import Card from './Card.jsx';

export default function BlogCard({ blog }) {
  return (
    <Card className="flex flex-col overflow-hidden transition hover:shadow-md">
      <div className="aspect-[16/9] w-full overflow-hidden bg-gray-100">
        {blog.thumbnail ? (
          <img src={blog.thumbnail} alt={blog.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">No image</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-lg font-semibold text-gray-900">{blog.title}</h3>
        <p className="text-xs text-gray-400">{new Date(blog.createdOn).toLocaleDateString()}</p>
        <Link to={`/blogs/${blog.slug}`} className="mt-auto text-sm font-semibold text-brand hover:underline">
          Read more →
        </Link>
      </div>
    </Card>
  );
}
