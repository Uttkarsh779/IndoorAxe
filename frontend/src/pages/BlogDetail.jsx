import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios.js';
import Spinner from '../components/Spinner.jsx';

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setBlog(null);

    api
      .get(`/blogs/${slug}`)
      .then((res) => {
        if (cancelled) return;
        setBlog(res.data.blog || null);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return <Spinner label="Loading blog…" />;
  }

  if (notFound || !blog) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-brand">Blog not found</h1>
        <p className="mt-3 text-gray-500">The blog post you're looking for doesn't exist or may have been removed.</p>
        <Link to="/blogs" className="mt-6 inline-block font-semibold text-brand hover:underline">
          ← Back to Blogs
        </Link>
      </div>
    );
  }

  const heroImage = blog.banner || blog.thumbnail;
  const formattedDate = blog.createdOn
    ? new Date(blog.createdOn).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div>
      <section className="bg-brand py-16 text-center text-white">
        <h1 className="px-4 text-3xl font-bold sm:text-4xl">{blog.title}</h1>
        <p className="mt-3 text-sm text-gray-300">
          <Link to="/">Home</Link> <span className="mx-1">→</span> <Link to="/blogs">Blogs</Link>{' '}
          <span className="mx-1">→</span> <span>{blog.title}</span>
        </p>
      </section>

      <article className="mx-auto max-w-4xl px-4 py-12">
        {heroImage && (
          <div className="mb-8 aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-100">
            <img src={heroImage} alt={blog.title} className="h-full w-full object-cover" />
          </div>
        )}

        <div className="mb-6 flex items-center gap-4 text-sm text-gray-400">
          <span>Indoor Axe</span>
          {formattedDate && (
            <>
              <span>•</span>
              <span>{formattedDate}</span>
            </>
          )}
        </div>

        <div
          className="max-w-none text-gray-700 leading-relaxed [&_a]:text-brand [&_a]:underline [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-brand [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-brand [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold [&_img]:my-4 [&_img]:rounded-lg [&_li]:ml-5 [&_ol]:mb-4 [&_ol]:list-decimal [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </article>
    </div>
  );
}
