import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import { Input, Textarea } from '../components/Input.jsx';
import Button from '../components/Button.jsx';

const initialForm = { name: '', email: '', call: '', question: '' };

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/contacts', form);
      setSuccess(true);
      setForm(initialForm);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Something went wrong sending your message. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Banner */}
      <section className="bg-brand py-16 text-center text-white">
        <h1 className="text-3xl font-bold sm:text-4xl">Contact Us</h1>
        <p className="mt-3 text-sm text-gray-300">
          <Link to="/" className="hover:text-brand-accent">
            Home
          </Link>{' '}
          <span className="mx-1">→</span> Contact Us
        </p>
      </section>

      {/* Map */}
      <div className="h-[380px] w-full">
        <iframe
          title="IndoorAxe Metal Pvt Ltd location"
          src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14973.953316210362!2d85.7608018!3d20.2385726!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a19a8633842dd0b%3A0x7e6e4fdfe692afcd!2sIndoor%20Axe%20Metal%20pvt.%20ltd.!5e0!3m2!1sen!2sin!4v1699444839077!5m2!1sen!2sin"
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Contact details */}
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <img src="/images/icon-location.png" alt="" className="h-10 w-10 object-contain" />
              <div>
                <p className="font-semibold text-brand">IndoorAxe Metals Pvt Ltd, Bhubaneswar, Odisha</p>
                <p className="text-sm text-gray-500">MIG-281, Kalinga Vihar, Patrapada, Bhubaneswar, Odisha 751019</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <img src="/images/icon-call.png" alt="" className="h-10 w-10 object-contain" />
              <div>
                <p className="font-semibold text-brand">+91 88954 93966</p>
                <p className="text-sm text-gray-500">Mon to Sat 9am to 6 pm</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <img src="/images/icon-mail.png" alt="" className="h-10 w-10 object-contain" />
              <div>
                <p className="font-semibold text-brand">info@indooraxe.in</p>
                <p className="text-sm text-gray-500">Send us your query anytime!</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div>
            {success ? (
              <div className="rounded-md border border-green-200 bg-green-50 p-6 text-green-800">
                <p className="font-semibold">Thanks for reaching out!</p>
                <p className="mt-1 text-sm">
                  Your message has been received. Our team will get back to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Name"
                  name="name"
                  placeholder="Enter Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  placeholder="Enter Email-ID"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  name="call"
                  placeholder="Enter Phone Number"
                  value={form.call}
                  onChange={handleChange}
                  required
                />
                <Textarea
                  label="Message"
                  name="question"
                  placeholder="Enter Message"
                  rows={4}
                  value={form.question}
                  onChange={handleChange}
                  required
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" variant="primary" disabled={submitting} className="w-full">
                  {submitting ? 'Submitting…' : 'Submit'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
