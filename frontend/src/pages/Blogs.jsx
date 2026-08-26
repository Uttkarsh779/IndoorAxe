import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import Spinner from '../components/Spinner.jsx';
import BlogCard from '../components/BlogCard.jsx';

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    api
      .get('/blogs')
      .then((res) => {
        if (cancelled) return;
        setBlogs(res.data.blogs || []);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <section className="bg-brand py-16 text-center text-white">
        <h1 className="text-3xl font-bold sm:text-4xl">Blogs</h1>
        <p className="mt-3 text-sm text-gray-300">
          <span>Home</span> <span className="mx-1">→</span> <span>Blogs</span>
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        {loading && <Spinner label="Loading blogs…" />}

        {!loading && error && (
          <div className="py-16 text-center text-gray-500">
            Something went wrong while loading the blogs. Please try again later.
          </div>
        )}

        {!loading && !error && blogs.length === 0 && (
          <div className="py-16 text-center text-gray-500">No blog posts yet. Check back soon.</div>
        )}

        {!loading && !error && blogs.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <BlogCard key={blog.slug || blog._id} blog={blog} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
