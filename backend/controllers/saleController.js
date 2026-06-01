const { Sale, Client, User } = require('../models');

const getAllSales = async (req, res) => {
  try {
    const sales = await Sale.findAll({
      include: [
        { model: Client, as: 'client',  attributes: ['id', 'name', 'company'] },
        { model: User,   as: 'creator', attributes: ['id', 'name'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch sales.', error: error.message });
  }
};

const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id, {
      include: [
        { model: Client, as: 'client',  attributes: ['id', 'name', 'company', 'email'] },
        { model: User,   as: 'creator', attributes: ['id', 'name'] },
      ],
    });
    if (!sale) return res.status(404).json({ message: 'Sale not found.' });
    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch sale.', error: error.message });
  }
};

const createSale = async (req, res) => {
  try {
    const { title, client_id, amount, status, description, deal_date } = req.body;
    if (!title || !client_id)
      return res.status(400).json({ message: 'Title and client are required.' });
    const clientExists = await Client.findByPk(client_id);
    if (!clientExists) return res.status(404).json({ message: 'Client not found.' });
    const sale = await Sale.create({ title, client_id, amount: amount || 0, status: status || 'pending', description, deal_date, created_by: req.user.id });
    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create sale.', error: error.message });
  }
};

const updateSale = async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale not found.' });
    const { title, client_id, amount, status, description, deal_date } = req.body;
    await sale.update({ title, client_id, amount, status, description, deal_date });
    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update sale.', error: error.message });
  }
};

const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale not found.' });
    await sale.destroy();
    res.json({ message: 'Sale deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete sale.', error: error.message });
  }
};

const getSalesStats = async (req, res) => {
  try {
    const { fn, col } = require('sequelize');
    const stats = await Sale.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count'], [fn('SUM', col('amount')), 'total']],
      group: ['status'],
      raw: true,
    });
    const totalClients = await Client.count();
    res.json({ stats, totalClients });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats.', error: error.message });
  }
};

module.exports = { getAllSales, getSaleById, createSale, updateSale, deleteSale, getSalesStats };
