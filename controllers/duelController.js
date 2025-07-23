import express from "express";
import { check, validationResult } from 'express-validator';
import duelService from "../services/duelService.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     DuelResult:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           example: 1
 *         userId:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *           description: "ObjectId del usuario de MongoDB"
 *         heroId:
 *           type: number
 *           example: 1
 *         villainId:
 *           type: number
 *           example: 2
 *         heroName:
 *           type: string
 *           example: "Clark Kent"
 *         heroAlias:
 *           type: string
 *           example: "Superman"
 *         villainName:
 *           type: string
 *           example: "Lex Luthor"
 *         villainAlias:
 *           type: string
 *           example: "Lex Luthor"
 *         winnerId:
 *           type: number
 *           example: 1
 *         winnerType:
 *           type: string
 *           enum: [hero, villain]
 *           example: "hero"
 *         winnerName:
 *           type: string
 *           example: "Clark Kent"
 *         winnerAlias:
 *           type: string
 *           example: "Superman"
 *         loserId:
 *           type: number
 *           example: 2
 *         loserType:
 *           type: string
 *           enum: [hero, villain]
 *           example: "villain"
 *         loserName:
 *           type: string
 *           example: "Lex Luthor"
 *         loserAlias:
 *           type: string
 *           example: "Lex Luthor"
 *         randomFactor:
 *           type: number
 *           example: 0.742
 *         message:
 *           type: string
 *           example: "¡Superman (Clark Kent) ganó el duelo contra Lex Luthor (Lex Luthor)!"
 *         timestamp:
 *           type: string
 *           format: date-time
 *     DuelStats:
 *       type: object
 *       properties:
 *         totalDuels:
 *           type: number
 *           example: 10
 *         heroWins:
 *           type: number
 *           example: 6
 *         villainWins:
 *           type: number
 *           example: 4
 *         heroWinRate:
 *           type: number
 *           example: 60
 *         villainWinRate:
 *           type: number
 *           example: 40
 */

/**
 * @swagger
 * /duels:
 *   post:
 *     summary: Crear un duelo 1v1 aleatorio entre un héroe y un villano
 *     tags: [Duelos 1v1]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - heroId
 *               - villainId
 *             properties:
 *               heroId:
 *                 type: number
 *                 example: 1
 *                 description: ID del héroe
 *               villainId:
 *                 type: number
 *                 example: 2
 *                 description: ID del villano
 *     responses:
 *       201:
 *         description: Duelo creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DuelResult'
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Héroe o villano no encontrado
 */
router.post("/duels",
    authMiddleware,
    [
        check('heroId').isNumeric().withMessage('heroId debe ser un número'),
        check('villainId').isNumeric().withMessage('villainId debe ser un número')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }

        try {
            const { heroId, villainId } = req.body;
            const userId = req.userId.toString(); // Convertir ObjectId a string

            const duelResult = await duelService.createRandomDuel(
                parseInt(heroId), 
                parseInt(villainId), 
                userId
            );

            res.status(201).json(duelResult);
        } catch (error) {
            if (error.message.includes('no encontrado')) {
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    });

/**
 * @swagger
 * /duels:
 *   get:
 *     summary: Obtener historial de duelos del usuario autenticado
 *     tags: [Duelos 1v1]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de duelos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DuelResult'
 *       401:
 *         description: No autenticado
 */
router.get("/duels", authMiddleware, async (req, res) => {
    try {
        const userId = req.userId.toString(); // Convertir ObjectId a string
        const duels = await duelService.getDuelHistory(userId);
        res.json(duels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /duels/{id}:
 *   get:
 *     summary: Obtener un duelo específico del usuario autenticado
 *     tags: [Duelos 1v1]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del duelo
 *     responses:
 *       200:
 *         description: Detalles del duelo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DuelResult'
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Duelo no encontrado
 */
router.get("/duels/:id", authMiddleware, async (req, res) => {
    try {
        const duelId = parseInt(req.params.id);
        const userId = req.userId.toString(); // Convertir ObjectId a string
        
        const duel = await duelService.getDuelById(duelId, userId);
        
        if (!duel) {
            return res.status(404).json({ error: 'Duelo no encontrado' });
        }
        
        res.json(duel);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /duels/stats:
 *   get:
 *     summary: Obtener estadísticas de duelos del usuario autenticado
 *     tags: [Duelos 1v1]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de duelos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DuelStats'
 *       401:
 *         description: No autenticado
 */
router.get("/duels/stats", authMiddleware, async (req, res) => {
    try {
        const userId = req.userId.toString(); // Convertir ObjectId a string
        const stats = await duelService.getDuelStats(userId);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
