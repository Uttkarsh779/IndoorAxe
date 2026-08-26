import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import showcaseProjects from '../data/showcaseProjects.js';

export default function Showcase() {
  const { id } = useParams();
  const project = showcaseProjects[id];

  const [activeImage, setActiveImage] = useState(0);

  if (!project) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-brand">Project not found</h1>
        <p className="mt-3 text-gray-500">
          The project you're looking for doesn't exist or may have been removed.
        </p>
        <Link to="/" className="mt-6 inline-block font-semibold text-brand hover:underline">
          ← Back to Home
        </Link>
      </div>
    );
  }

  const images = project.images && project.images.length > 0 ? project.images : [];
  const heroImage = images[activeImage] || images[0];

  return (
    <div>
      <section className="bg-brand py-16 text-center text-white">
        <h1 className="px-4 text-3xl font-bold sm:text-4xl">{project.title}</h1>
        <p className="mt-3 text-sm text-gray-300">
          <Link to="/">Home</Link> <span className="mx-1">→</span>{' '}
          <span>Project Details</span>
        </p>
      </section>

      <article className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            {heroImage && (
              <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={heroImage}
                  alt={project.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {images.length > 1 && (
              <div className="mt-4 flex gap-3">
                {images.map((src, index) => (
                  <button
                    key={src + index}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`h-16 w-16 overflow-hidden rounded-md border-2 transition-colors ${
                      index === activeImage ? 'border-brand-accent' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={src}
                      alt={`${project.title} thumbnail ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="pb-4 text-xl font-bold text-brand sm:text-2xl">{project.title}</h3>
            <p className="text-gray-600">{project.summary}</p>

            <div className="mt-6 flex flex-row gap-8 border-t border-gray-100 pt-6 text-sm">
              <ul className="space-y-2 font-semibold text-brand">
                <li>Location</li>
                <li>Rating</li>
                <li>Client</li>
              </ul>
              <ul className="space-y-2 text-gray-600">
                <li>{project.location}</li>
                <li aria-label={`${project.rating} out of ${project.ratingOutOf} stars`}>
                  {'★'.repeat(project.rating)}
                  <span className="text-gray-300">
                    {'★'.repeat(project.ratingOutOf - project.rating)}
                  </span>
                </li>
                <li>{project.client}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-100 pt-10">
          {project.description.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-4 leading-relaxed text-gray-700">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-4">
          <Link to="/" className="font-semibold text-brand hover:underline">
            ← Back to Home
          </Link>
        </div>
      </article>
    </div>
  );
}
