import express from "express";
import { check, validationResult } from 'express-validator';
import heroService from "../services/heroService.js";
import Hero from "../models/heroModel.js";

const router = express.Router();

/**
 * @swagger
 * /heroes:
 *   post:
 *     summary: Crea un nuevo héroe
 *     tags: [Heroes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HeroCreate'
 *     responses:
 *       201:
 *         description: Héroe creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hero'
 *       400:
 *         description: Error de validación - nombre y alias son requeridos
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /heroes:
 *   get:
 *     summary: Obtiene todos los héroes
 *     tags: [Héroes]
 *     responses:
 *       200:
 *         description: Lista de héroes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Hero'
 */
router.get("/heroes", async (req, res) => {
    try {
        const heroes = await heroService.getAllHeroes();
        res.json(heroes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/heroes",
    [
        check('name').not().isEmpty().withMessage('El nombre es requerido'),
        check('alias').not().isEmpty().withMessage('El alias es requerido')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }
        try {
            const { name, alias, city, team } = req.body;
            // Obtener el último ID para generar uno nuevo (incremental automático)
            const lastHero = await Hero.findOne().sort({ id: -1 });
            const newId = lastHero ? lastHero.id + 1 : 1;
            
            // Generar poder aleatorio entre 1 y 100
            const randomPower = Math.floor(Math.random() * 100) + 1;
            
            // Crear nuevo héroe usando el modelo de Mongoose
            const newHero = new Hero({
                id: newId,
                name,
                alias,
                power: randomPower,
                city: city || '',
                team: team || ''
            });
            const addedHero = await newHero.save();
            res.status(201).json(addedHero);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

/**
 * @swagger
 * /heroes/{id}:
 *   put:
 *     summary: Actualiza un héroe existente
 *     tags: [Héroes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Hero'
 *     responses:
 *       200:
 *         description: Héroe actualizado
 *       404:
 *         description: Héroe no encontrado
 */
router.put("/heroes/:id", async (req, res) => {
    const id = req.params.id;
    // Validar que el id sea un número positivo
    if (isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({ error: 'El id debe ser un número positivo.' });
    }
    try {
        const updatedHero = await heroService.updateHero(id, req.body);
        res.json(updatedHero);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

/**
 * @swagger
 * /heroes/{id}:
 *   delete:
 *     summary: Elimina un héroe
 *     tags: [Héroes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Héroe eliminado
 *       404:
 *         description: Héroe no encontrado
 */
router.delete('/heroes/:id', async (req, res) => {
    const id = req.params.id;
    // Validar que el id sea un número positivo
    if (isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({ error: 'El id debe ser un número positivo.' });
    }
    try {
        const result = await heroService.deleteHero(id);
        res.json(result);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

/**
 * @swagger
 * /heroes/city/{city}:
 *   get:
 *     summary: Busca héroes por ciudad
 *     tags: [Héroes]
 *     parameters:
 *       - in: path
 *         name: city
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de héroes de la ciudad
 */
router.get('/heroes/city/:city', async (req, res) => {
    const city = req.params.city;
    // Validar si es un número
    if (!isNaN(city)) {
        return res.status(400).json({ error: 'Solo se acepta texto relacionado a ciudades.' });
    }
    // Validar si es texto válido (solo letras y espacios)
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(city)) {
        return res.status(400).json({ error: 'Escriba bien el nombre de la ciudad.' });
    }
    try {
        const heroes = await heroService.findHeroesByCity(city);
        if (heroes.length === 0) {
            return res.status(404).json({ error: 'Esa ciudad no se ha agregado.' });
        }
        res.json(heroes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Hero:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         alias:
 *           type: string
 *         city:
 *           type: string
 *         team:
 *           type: string
 */

export default router;
