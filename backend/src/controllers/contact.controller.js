import Contact from '../models/Contact.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Admin: mirrors admin.py ContactAdmin (search_fields: Name, Email, Call, Question).
export const adminListContacts = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = search ? { $text: { $search: search } } : {};
  const contacts = await Contact.find(filter).sort({ createdAt: -1 });
  res.json({ contacts });
});

export const adminDeleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findByIdAndDelete(req.params.id);
  if (!contact) return res.status(404).json({ message: 'Contact not found' });
  res.status(204).send();
});

// Ports views.contactform - stores every submission, no field validation
// beyond what the model allows (original had none either).
export const createContact = asyncHandler(async (req, res) => {
  const { name, email, call, question } = req.body;
  const contact = await Contact.create({ name, email, call, question, source: 'contact' });
  res.status(201).json({ contact });
});

// Ports views.landing_form - reuses the same Contacts model as the
// contact form in the original app (see API_MAPPING.md).
export const createLead = asyncHandler(async (req, res) => {
  const { name, email, call } = req.body;
  const contact = await Contact.create({ name, email, call, source: 'landing' });
  res.status(201).json({ contact });
});
