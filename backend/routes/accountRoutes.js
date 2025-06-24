const express = require('express');
const router = express.Router();
const { deleteMyAccount } = require('../controllers/accountController.js');
const { jwtCheck, injectUser } = require('../middleware/auth');

router.delete('/delete/me', jwtCheck, injectUser, deleteMyAccount);

module.exports = router;