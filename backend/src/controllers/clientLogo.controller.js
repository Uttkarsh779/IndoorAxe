import ClientLogo from '../models/ClientLogo.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { publicUrlFor } from '../middleware/upload.js';

export const listClientLogos = asyncHandler(async (req, res) => {
  const clientLogos = await ClientLogo.find().sort({ createdAt: -1 });
  res.json({ clientLogos });
});

export const createClientLogo = asyncHandler(async (req, res) => {
  const file = req.file;
  const clientLogo = await ClientLogo.create({ image: file ? publicUrlFor('Client', file.filename) : '' });
  res.status(201).json({ clientLogo });
});

export const updateClientLogo = asyncHandler(async (req, res) => {
  const clientLogo = await ClientLogo.findById(req.params.id);
  if (!clientLogo) return res.status(404).json({ message: 'Client logo not found' });
  if (req.file) clientLogo.image = publicUrlFor('Client', req.file.filename);
  await clientLogo.save();
  res.json({ clientLogo });
});

export const deleteClientLogo = asyncHandler(async (req, res) => {
  const clientLogo = await ClientLogo.findByIdAndDelete(req.params.id);
  if (!clientLogo) return res.status(404).json({ message: 'Client logo not found' });
  res.status(204).send();
});
