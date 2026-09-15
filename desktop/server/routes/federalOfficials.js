const express = require('express');
const { authenticate } = require('../middleware/auth');
const { federalOfficialSchema, updateFederalOfficialSchema } = require('../schemas/federalOfficial');
const db = require('../db');

const router = express.Router();

router.get('/', authenticate, (_req, res) => {
  try {
    const data = db.getAllFederalOfficials();
    res.json(data);
  } catch (err) {
    console.error('Error fetching federal officials:', err);
    res.status(500).json({ error: 'Impossible de charger les cadres fédéraux' });
  }
});

router.get('/:id', authenticate, (req, res) => {
  try {
    const data = db.getFederalOfficialById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Cadre fédéral introuvable' });
    res.json(data);
  } catch (err) {
    console.error('Error fetching federal official:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/', authenticate, (req, res) => {
  const validation = federalOfficialSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Données invalides', details: validation.error.format() });
  }

  try {
    const official = db.createFederalOfficial(validation.data);
    res.status(201).json(official);
  } catch (err) {
    console.error('Error creating federal official:', err);
    res.status(500).json({ error: 'Impossible de créer le cadre fédéral' });
  }
});

router.put('/:id', authenticate, (req, res) => {
  const validation = updateFederalOfficialSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Données invalides', details: validation.error.format() });
  }

  try {
    db.updateFederalOfficial(req.params.id, validation.data);
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating federal official:', err);
    res.status(500).json({ error: 'Impossible de modifier le cadre fédéral' });
  }
});

router.delete('/:id', authenticate, (req, res) => {
  try {
    db.deleteFederalOfficial(req.params.id);
    res.status(204).end();
  } catch (err) {
    console.error('Error deleting federal official:', err);
    res.status(500).json({ error: 'Impossible de supprimer le cadre fédéral' });
  }
});

module.exports = router;
