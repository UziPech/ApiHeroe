import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { getBattlesByUser } from '../controllers/battleController.js';
import battleService from '../services/battleService.js';

const router = express.Router();

// Aplica el middleware solo a las rutas protegidas
router.use(authMiddleware);

// Endpoint para obtener batallas del usuario autenticado
router.get('/', getBattlesByUser);

// Endpoint para crear batallas por equipos (protegido)
router.post('/team', async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  try {
    const { heroes, villains, userSide, firstHero, firstVillain, heroConfig, villainConfig } = req.body;
    const userId = req.userId;
    const battle = await battleService.createTeamBattle({ 
      heroes, 
      villains, 
      userSide, 
      firstHero, 
      firstVillain,
      heroConfig,
      villainConfig
    }, userId);
    res.status(201).json(battle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Endpoint para ataque en batalla por equipos (protegido)
router.post('/:id/attack', async (req, res) => {
  try {
    const { id } = req.params;
    const { attacker, attackType } = req.body;
    const userId = req.userId || 'anonymous';
    const result = await battleService.performAttack(Number(id), Number(attacker), attackType);
    res.status(200).json({ battle: result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Endpoint para consultar una batalla por su id (protegido)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const battle = await battleService.getBattleById(Number(id), userId);
    if (!battle) return res.status(404).json({ error: 'Batalla no encontrada' });
    res.status(200).json(battle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 