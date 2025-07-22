import express from 'express';
const router = express.Router();
import { deleteMyAccount, requestPasswordReset } from '../controllers/accountController.js';
import { jwtCheck, injectUser, createUserIfNotExists } from '../middleware/auth.js';

router.delete('/delete/me', jwtCheck, injectUser, createUserIfNotExists, deleteMyAccount);
router.post('/password-reset', requestPasswordReset);

export default router;