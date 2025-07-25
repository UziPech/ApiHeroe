import express from "express";
import { check, validationResult } from 'express-validator';
import villainService from "../services/villainService.js";
import Villain from "../models/villainModel.js";

const router = express.Router();

/**
 * @swagger
 * /villains:
 *   get:
 *     summary: Obtiene todos los villanos
 *     tags: [Villanos]
 *     responses:
 *       200:
 *         description: Lista de villanos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Villain'
 */
router.get("/villains", async (req, res) => {
    try {
        const villains = await villainService.getAllVillains();
        res.json(villains);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /villains:
 *   post:
 *     summary: Crea un nuevo villano
 *     tags: [Villanos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               alias:
 *                 type: string
 *               city:
 *                 type: string
 *               team:
 *                 type: string
 *           example:
 *             name: "Joker"
 *             alias: "Joker"
 *             city: "Gotham City"
 *             team: "Legion of Doom"
 *     responses:
 *       201:
 *         description: Villano creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Villano creado correctamente"
 *                 villain:
 *                   $ref: '#/components/schemas/Villain'
 *       400:
 *         description: Error de validación o personaje duplicado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Ya existe un villano con ese nombre o alias."
 *     x-note:
 *       description: "No se permite duplicar villanos con el mismo nombre o alias."
 */
router.post("/villains",
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
            // Obtener el último ID para generar uno nuevo
            const lastVillain = await Villain.findOne().sort({ id: -1 });
            const newId = lastVillain ? lastVillain.id + 1 : 1;
            
            // Crear nuevo villano usando el modelo de Mongoose
            const newVillain = new Villain({
                id: newId,
                name,
                alias,
                city: city || '',
                team: team || '',
                power: 50 // Valor por defecto para power
            });
            const addedVillain = await newVillain.save();
            res.status(201).json(addedVillain);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

/**
 * @swagger
 * /villains/{id}:
 *   put:
 *     summary: Actualiza un villano existente
 *     tags: [Villanos]
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
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               alias:
 *                 type: string
 *               city:
 *                 type: string
 *               team:
 *                 type: string
 *             example:
 *               name: "Joker"
 *               alias: "Joker"
 *               city: "Gotham City"
 *               team: "Legion of Doom"
 *     responses:
 *       200:
 *         description: Villano actualizado
 *       404:
 *         description: Villano no encontrado
 */
router.put("/villains/:id", async (req, res) => {
    const id = req.params.id;
    // Validar que el id sea un número positivo
    if (isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({ error: 'El id debe ser un número positivo.' });
    }
    try {
        const updatedVillain = await villainService.updateVillain(id, req.body);
        res.json(updatedVillain);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

/**
 * @swagger
 * /villains/{id}:
 *   delete:
 *     summary: Elimina un villano
 *     tags: [Villanos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Villano eliminado
 *       404:
 *         description: Villano no encontrado
 */
router.delete('/villains/:id', async (req, res) => {
    const id = req.params.id;
    // Validar que el id sea un número positivo
    if (isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({ error: 'El id debe ser un número positivo.' });
    }
    try {
        const result = await villainService.deleteVillain(id);
        res.json(result);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

/**
 * @swagger
 * /villains/city/{city}:
 *   get:
 *     summary: Busca villanos por ciudad
 *     tags: [Villanos]
 *     parameters:
 *       - in: path
 *         name: city
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de villanos de la ciudad
 */
router.get('/villains/city/:city', async (req, res) => {
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
        const villains = await villainService.findVillainsByCity(city);
        if (villains.length === 0) {
            return res.status(404).json({ error: 'Esa ciudad no se ha agregado.' });
        }
        res.json(villains);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Villain:
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
