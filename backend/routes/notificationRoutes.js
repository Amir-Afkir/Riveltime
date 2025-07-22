import express from 'express';
import notificationController from '../controllers/notificationController.js';
const router = express.Router();

// GET toutes les notifications de l'utilisateur
router.get('/', notificationController.getAllNotifications);

// POST une nouvelle notification
router.post('/', notificationController.createNotification);

// PATCH → marquer comme lue
router.patch('/:id/read', notificationController.markAsRead);

export default router;