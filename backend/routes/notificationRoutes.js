const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// GET toutes les notifications de l'utilisateur
router.get('/', notificationController.getAllNotifications);

// POST une nouvelle notification
router.post('/', notificationController.createNotification);

// PATCH → marquer comme lue
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;