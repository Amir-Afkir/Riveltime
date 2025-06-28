const express = require('express');
const router = express.Router();
const { deleteMyAccount } = require('../controllers/accountController.js');
const { jwtCheck, injectUser, createUserIfNotExists } = require('../middleware/auth');
const { requestPasswordReset } = require('../controllers/accountController.js');

router.delete('/delete/me', jwtCheck, injectUser, createUserIfNotExists, deleteMyAccount);
router.post('/password-reset', requestPasswordReset);

module.exports = router;