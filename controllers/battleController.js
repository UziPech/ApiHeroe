// controllers/battleController.js
import express from 'express';
import battleService from '../services/battleService.js';

const router = express.Router();

/**
 * @swagger
 * /battle/duel/{heroId}/{villainId}:
 *   post:
 *     summary: Enfrenta a un héroe contra un villano y determina al ganador
 *     tags: [Batallas]
 *     parameters:
 *       - in: path
 *         name: heroId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del héroe
 *       - in: path
 *         name: villainId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del villano
 *     responses:
 *       201:
 *         description: Resultado de la batalla
 *       400:
 *         description: Error al realizar la batalla
 *       404:
 *         description: Héroe o villano no encontrado
 */
router.post('/battle/duel/:heroId/:villainId', async (req, res) => {
  try {
    const { heroId, villainId } = req.params;
    const battle = await battleService.fight(parseInt(heroId), parseInt(villainId));
    res.status(201).json(battle);
  } catch (error) {
    if (error.message.includes('no encontrado')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

/**
 * @swagger
 * /battles:
 *   get:
 *     summary: Obtiene el historial completo de batallas
 *     tags: [Batallas]
 *     responses:
 *       200:
 *         description: Lista de todas las batallas
 */
router.get('/battles', async (req, res) => {
  try {
    const battles = await battleService.getBattleHistory();
    res.status(200).json(battles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /battles/{battleId}:
 *   get:
 *     summary: Obtiene una batalla específica por su ID
 *     tags: [Batallas]
 *     parameters:
 *       - in: path
 *         name: battleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la batalla
 *     responses:
 *       200:
 *         description: Detalles de la batalla
 *       404:
 *         description: Batalla no encontrada
 */
router.get('/battles/:battleId', async (req, res) => {
  try {
    const { battleId } = req.params;
    const battle = await battleService.getBattleById(parseInt(battleId));
    
    if (!battle) {
      return res.status(404).json({ error: 'Batalla no encontrada' });
    }
    
    res.status(200).json(battle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /battle/team:
 *   post:
 *     summary: Crea una batalla por equipos (3 héroes vs 3 villanos)
 *     tags: [Batallas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               heroes:
 *                 type: array
 *                 items:
 *                   type: integer
 *               villains:
 *                 type: array
 *                 items:
 *                   type: integer
 *               userSide:
 *                 type: string
 *                 enum: [heroes, villains]
 *               firstHero:
 *                 type: integer
 *               firstVillain:
 *                 type: integer
 *               heroConfig:
 *                 type: object
 *                 description: Configuración personalizada de niveles y defensa para héroes
 *               villainConfig:
 *                 type: object
 *                 description: Configuración personalizada de niveles y defensa para villanos

 *     responses:
 *       201:
 *         description: Batalla creada
 */
router.post('/battle/team', async (req, res) => {
  try {
    const { heroes, villains, userSide, firstHero, firstVillain, heroConfig, villainConfig } = req.body;
    const battle = await battleService.createTeamBattle({ 
      heroes, 
      villains, 
      userSide, 
      firstHero, 
      firstVillain,
      heroConfig,
      villainConfig
    });
    res.status(201).json(battle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /battle/{id}/attack:
 *   post:
 *     summary: Realiza un ataque en una batalla por equipos
 *     tags: [Batallas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la batalla
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               attacker:
 *                 type: integer
 *               defender:
 *                 type: integer
 *               attackType:
 *                 type: string
 *                 enum: [basico, especial, critico]
 *                 description: Tipo de ataque a realizar (Básico, Especial, Crítico)
 *     responses:
 *       200:
 *         description: Acción realizada
 */
router.post('/battle/:id/attack', async (req, res) => {
  try {
    const { id } = req.params;
    const { attacker, defender, attackType } = req.body;
    const result = await battleService.teamAttack(Number(id), attacker, defender, attackType);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /battle/{id}:
 *   get:
 *     summary: Obtiene el registro completo de una batalla por equipos
 *     tags: [Batallas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la batalla
 *     responses:
 *       200:
 *         description: Registro de la batalla
 */
router.get('/battle/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const battle = await battleService.getTeamBattleById(Number(id));
    if (!battle) return res.status(404).json({ error: 'Batalla no encontrada' });
    res.status(200).json(battle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
