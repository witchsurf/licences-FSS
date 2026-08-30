import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { federalOfficialSchema, updateFederalOfficialSchema } from '../schemas/federalOfficial.js';

const router = express.Router();

router.get('/', authenticate, async (_req, res) => {
  const { data, error } = await supabase.from('federal_officials').select('*').order('createdAt', { ascending: false });
  if (error) return res.status(500).json({ error: 'Impossible de charger les cadres fédéraux' });
  res.json(data);
});

router.get('/:id', authenticate, async (req, res) => {
  const { data, error } = await supabase.from('federal_officials').select('*').eq('id', req.params.id).single();
  if (error || !data) return res.status(404).json({ error: 'Cadre fédéral introuvable' });
  res.json(data);
});

router.post('/', authenticate, async (req, res) => {
  const validation = federalOfficialSchema.safeParse(req.body);
  if (!validation.success) return res.status(400).json({ error: 'Données invalides', details: validation.error.format() });
  const { data: id, error: idError } = await supabase.rpc('generate_next_federal_official_id');
  if (idError) return res.status(500).json({ error: 'Impossible de générer le numéro de carte' });
  const official = { ...validation.data, id, createdAt: Date.now() };
  const { error } = await supabase.from('federal_officials').insert(official);
  if (error) return res.status(500).json({ error: 'Impossible de créer le cadre fédéral' });
  res.status(201).json(official);
});

router.put('/:id', authenticate, async (req, res) => {
  const validation = updateFederalOfficialSchema.safeParse(req.body);
  if (!validation.success) return res.status(400).json({ error: 'Données invalides', details: validation.error.format() });
  const { error } = await supabase.from('federal_officials').update(validation.data).eq('id', req.params.id);
  if (error) return res.status(500).json({ error: 'Impossible de modifier le cadre fédéral' });
  res.json({ success: true });
});

router.delete('/:id', authenticate, async (req, res) => {
  const { error } = await supabase.from('federal_officials').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: 'Impossible de supprimer le cadre fédéral' });
  res.status(204).end();
});

export default router;
