// Importa mongoose para la conexión a MongoDB
import mongoose from 'mongoose';
// Importa dotenv para cargar variables de entorno
import dotenv from 'dotenv';
dotenv.config();

// Obtiene la URI de MongoDB desde las variables de entorno
const mongoURI = process.env.MONGODB_URI;

// Función para conectar a MongoDB Atlas
const connectDB = async () => {
  try {
    // Intenta conectar a MongoDB Atlas
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,        // Usa el nuevo parser de URL
      useUnifiedTopology: true      // Usa el nuevo motor de topología
    });
    // Si la conexión es exitosa, muestra este mensaje
    console.log('MongoDB Atlas conectado');
  } catch (error) {
    // Si ocurre un error, muestra el error en consola y termina la app
    console.error('Error al conectar a MongoDB Atlas:', error.message);
    process.exit(1);
  }
};

// Exporta la función de conexión
export default connectDB; 