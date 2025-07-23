// Importa jsonwebtoken para verificar el token JWT
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js'; // Importa el modelo de usuario

// Middleware para proteger rutas usando JWT
const authMiddleware = async function (req, res, next) {
  // Obtiene el token del header Authorization
  const authHeader = req.headers['authorization'];
  console.log('Authorization header recibido:', authHeader); // Log para depuración
  const token = authHeader && authHeader.split(' ')[1]; // Formato: Bearer <token>
  console.log('Token extraído:', token); // Log para depuración

  // Si no hay token, rechaza la petición
  if (!token) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }

  try {
    // Verifica el token usando el secreto del .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded JWT:', decoded); // Log para depuración
    // Verifica que el usuario exista en la base de datos
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ mensaje: 'Usuario no válido o inexistente' });
    }
    // Adjunta el userId decodificado al objeto req para usarlo después
    req.userId = decoded.userId;
    next(); // Continúa con la siguiente función
  } catch (error) {
    // Si el token no es válido, rechaza la petición
    console.log('Error al verificar el token:', error.message); // Log para depuración
    return res.status(403).json({ mensaje: 'Token inválido o expirado' });
  }
};

export default authMiddleware; 