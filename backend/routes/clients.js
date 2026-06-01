const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getAllClients, getClientById, createClient, updateClient, deleteClient } = require('../controllers/clientController');

router.use(protect);
router.get('/',       getAllClients);
router.get('/:id',    getClientById);
router.post('/',      createClient);
router.put('/:id',    updateClient);
router.delete('/:id', adminOnly, deleteClient);

module.exports = router;
