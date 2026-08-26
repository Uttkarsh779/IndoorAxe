import Testimonial from '../models/Testimonial.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { publicUrlFor } from '../middleware/upload.js';

export const listTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find().sort({ createdAt: -1 });
  res.json({ testimonials });
});

export const createTestimonial = asyncHandler(async (req, res) => {
  const { name, comment } = req.body;
  const file = req.file;
  const testimonial = await Testimonial.create({
    name,
    comment,
    image: file ? publicUrlFor('Testimonials', file.filename) : '',
  });
  res.status(201).json({ testimonial });
});

export const updateTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) return res.status(404).json({ message: 'Testimonial not found' });
  const { name, comment } = req.body;
  if (name !== undefined) testimonial.name = name;
  if (comment !== undefined) testimonial.comment = comment;
  if (req.file) testimonial.image = publicUrlFor('Testimonials', req.file.filename);
  await testimonial.save();
  res.json({ testimonial });
});

export const deleteTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
  if (!testimonial) return res.status(404).json({ message: 'Testimonial not found' });
  res.status(204).send();
});
