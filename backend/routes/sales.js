const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getAllSales, getSaleById, createSale, updateSale, deleteSale, getSalesStats } = require('../controllers/saleController');

router.use(protect);
router.get('/stats',              getSalesStats);
router.get('/',                   getAllSales);
router.get('/:id',                getSaleById);
router.post('/',                  createSale);
router.put('/:id',                updateSale);
router.delete('/:id',             adminOnly, deleteSale);

router.get('/:id/comments', async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const [rows] = await sequelize.query(`
      SELECT c.*, u.name as author_name
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.sale_id = :saleId
      ORDER BY c.created_at ASC
    `, { replacements: { saleId: req.params.id }, type: sequelize.QueryTypes.SELECT });
    const results = Array.isArray(rows) ? rows : [rows].filter(Boolean);
    res.json(results.map(r => ({ ...r, author: { name: r.author_name } })));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/comments', async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Content required.' });
    await sequelize.query(`
      INSERT INTO comments (sale_id, author_id, content) VALUES (:saleId, :authorId, :content)
    `, { replacements: { saleId: req.params.id, authorId: req.user.id, content } });
    res.status(201).json({ message: 'Comment added.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
