const { Client, User, Sale } = require('../models');

const canWrite  = (req) => req.user.role !== 'viewer';
const canDelete = (req) => req.user.role === 'admin';
const isOwner   = (req, record) => {
  if (req.user.role === 'admin' || req.user.role === 'manager') return true;
  return String(record.owner_id) === String(req.user.id);
};

const getAllClients = async (req, res) => {
  try {
    const role = req.user.role;
    let where = {};
    if (role === 'commercial') where = { owner_id: req.user.id };

    const clients = await Client.findAll({
      where,
      include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'team_id'] }],
      order: [['created_at', 'DESC']],
    });

    let result = clients;
    if (role === 'manager' || role === 'viewer') {
      result = clients.filter(c =>
        String(c.creator?.team_id) === String(req.user.team_id)
      );
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClientById = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name'] },
        { model: Sale, as: 'sales' },
      ],
    });
    if (!client) return res.status(404).json({ message: 'Client not found.' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createClient = async (req, res) => {
  try {
    if (!canWrite(req)) return res.status(403).json({ message: 'Viewers cannot create clients.' });
    const { name, email, phone, company, address, status, notes } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Name and email are required.' });
    const client = await Client.create({
      name, email, phone, company, address, status, notes,
      created_by: req.user.id,
      owner_id:   req.user.id,
    });
    res.status(201).json(client);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError')
      return res.status(400).json({ message: 'A client with this email already exists.' });
    res.status(500).json({ message: error.message });
  }
};

const updateClient = async (req, res) => {
  try {
    if (!canWrite(req)) return res.status(403).json({ message: 'Viewers cannot edit clients.' });
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found.' });
    if (!isOwner(req, client)) return res.status(403).json({ message: 'You can only edit your own clients.' });
    const { name, email, phone, company, address, status, notes } = req.body;
    await client.update({ name, email, phone, company, address, status, notes });
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteClient = async (req, res) => {
  try {
    if (!canDelete(req)) return res.status(403).json({ message: 'Only admins can delete clients.' });
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found.' });
    await client.destroy();
    res.json({ message: 'Client deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllClients, getClientById, createClient, updateClient, deleteClient };