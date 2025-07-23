// controllers/battleController.js
import express from 'express';
import battleService from '../services/battleService.js';
import Battle from '../models/battleModel.js'; // Added import for Battle model

const router = express.Router();


/**
 * @swagger
 * /battles:
 *   get:
 *     summary: Obtiene el historial completo de batallas del usuario autenticado
 *     tags: [Batallas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todas las batallas
 *       401:
 *         description: No autenticado
 */
router.get('/battles', async (req, res) => {
  try {
    // Obtiene todas las batallas usando el servicio
    const battles = await battleService.getBattleHistory();
    // Filtra cada batalla para mostrar solo los campos relevantes y ocultar _id y __v
    const battlesFiltered = battles.map(battle => ({
      // id entero generado por el backend
      id: battle.id,
      // userId del usuario dueño de la batalla
      userId: battle.userId,
      // equipos de héroes y villanos
      teams: battle.teams,
      // Si existen, incluye los siguientes campos (para batallas por equipos)
      userSide: battle.userSide,
      firstHero: battle.firstHero,
      firstVillain: battle.firstVillain,
      current: battle.current,
      // Puedes agregar aquí otros campos que sí quieras mostrar
      // winner: battle.winner, etc.
    }));
    // Devuelve la respuesta filtrada
    res.status(200).json(battlesFiltered);
  } catch (error) {
    // Si ocurre un error, responde con error 500
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /battles/{battleId}:
 *   get:
 *     summary: Obtiene una batalla específica por su ID (solo si pertenece al usuario autenticado)
 *     tags: [Batallas]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Batalla no encontrada
 */
router.get('/battles/:battleId', async (req, res) => {
  try {
    const { battleId } = req.params;
    // Buscar batalla que pertenezca al usuario autenticado
    const battle = await battleService.getBattleById(parseInt(battleId), req.userId);
    
    if (!battle) {
      return res.status(404).json({ error: 'Batalla no encontrada o no tienes acceso a ella' });
    }
    
    res.status(200).json(battle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /battles/team:
 *   post:
 *     summary: Crea una batalla por equipos (3 héroes vs 3 villanos)
 *     tags: [Batallas]
 *     security:
 *       - bearerAuth: []
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
 *         description: |
 *           Batalla por equipos creada exitosamente. 
 *           
 *           **Sistema de combate 3v3:**
 *           - Combate por turnos con contraataques automáticos de la IA
 *           - Cambio automático de personaje cuando uno muere
 *           - Seguimiento detallado de HP antes y después de cada ataque
 *           
 *           **Posibles resultados de batalla:**
 *           - `winner: "heroes"` - Los héroes eliminan a todos los villanos
 *           - `winner: "villains"` - Los villanos eliminan a todos los héroes
 *           - `winner: "empate"` - Ambos equipos son eliminados simultáneamente
 *           - `winner: null` - La batalla está en progreso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BattleState'
 *       401:
 *         description: No autenticado
 */
router.post('/battles/team', async (req, res) => {
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

/**
 * @swagger
 * /battles/{id}/attack:
 *   post:
 *     summary: Realiza un ataque en una batalla por equipos (con contraataque automático de la IA)
 *     tags: [Batallas]
 *     security:
 *       - bearerAuth: []
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
 *                 description: ID del personaje que ataca. Debe ser el personaje activo según el turno actual.
 *               attackType:
 *                 type: string
 *                 description: Tipo de ataque (ej. "basico", "critico", "especial").
 *                 example: "basico"
 *     responses:
 *       200:
 *         description: |
 *           Acción realizada exitosamente. La respuesta incluye:
 *           - El ataque del jugador
 *           - El contraataque automático de la IA (si queda viva)
 *           - Cambio automático de personaje activo si el actual muere
 *           - Estado actualizado completo de la batalla
 *           - Detección automática de empate cuando ambos equipos son eliminados
 *           
 *           **Posibles resultados de batalla:**
 *           - `winner: "heroes"` - Los héroes ganan
 *           - `winner: "villains"` - Los villanos ganan  
 *           - `winner: "empate"` - Ambos equipos fueron eliminados simultáneamente
 *           - `winner: null` - La batalla aún continúa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 battle:
 *                   $ref: '#/components/schemas/BattleState'
 *       400:
 *         description: Petición inválida (ej. turno incorrecto, personaje no válido, falta un parámetro).
 *       404:
 *         description: Batalla no encontrada.
 */
router.post('/battles/:id/attack', async (req, res) => {
  try {
    const { id } = req.params;
    const { attacker: attackerId, attackType } = req.body;

    if (attackerId === undefined || !attackType) {
      return res.status(400).json({ error: 'Se requiere el ID del "attacker" y el "attackType".' });
    }

    const result = await battleService.performAttack(Number(id), Number(attackerId), attackType);
    res.status(200).json({ battle: result });
  } catch (error) {
    if (error.message.includes('no encontrada')) {
      return res.status(404).json({ error: error.message });
    }
    // Errores de lógica de negocio (turno incorrecto, etc.)
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /battle/:id:
 *   get:
 *     summary: Obtiene el registro completo de una batalla por equipos (solo si pertenece al usuario autenticado)
 *     tags: [Batallas]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Batalla no encontrada
 */
router.get('/battle/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Buscar batalla que pertenezca al usuario autenticado
    const battle = await battleService.getBattleById(Number(id), req.userId);
    if (!battle) return res.status(404).json({ error: 'Batalla no encontrada o no tienes acceso a ella' });
    res.status(200).json(battle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Endpoint protegido: obtener batallas del usuario autenticado
export const getBattlesByUser = async (req, res) => {
  try {
    // Busca batallas en MongoDB donde el userId coincida con el del token
    const battles = await Battle.find({ userId: req.userId });
    res.json(battles);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener batallas del usuario' });
  }
};

export default router;
