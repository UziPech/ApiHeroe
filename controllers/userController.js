import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const router = express.Router();

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: Error de validación
 *
 * /users/login:
 *   post:
 *     summary: Inicia sesión y obtiene un token JWT
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token JWT generado
 *       400:
 *         description: Credenciales inválidas
 */
// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }
    if (typeof password !== 'string' || password.length < 12) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 12 caracteres.' });
    }
    // Verifica si el usuario o email ya existen
    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      return res.status(400).json({ error: 'El usuario o email ya existe.' });
    }
    // Hashea la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Crea el usuario
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ mensaje: 'Usuario registrado correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario.' });
  }
});

// Login de usuario
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
    }
    // Busca el usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Credenciales inválidas.' });
    }
    // Compara la contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Credenciales inválidas.' });
    }
    // Genera el token JWT
    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
});

export default router; 