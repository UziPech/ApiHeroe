import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const healthCheck = async () => {
  console.log('🔍 Iniciando verificación de salud del sistema...\n');
  
  // Verificar variables de entorno
  console.log('📋 Verificando variables de entorno:');
  const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
  
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar}: Configurado`);
    } else {
      console.log(`❌ ${envVar}: NO configurado`);
    }
  }
  
  // Verificar conexión a MongoDB
  console.log('\n🗄️ Verificando conexión a MongoDB:');
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB: Conectado exitosamente');
    
    // Verificar colecciones
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📊 Colecciones disponibles:', collections.map(c => c.name).join(', '));
    
    await mongoose.disconnect();
  } catch (error) {
    console.log('❌ MongoDB: Error de conexión');
    console.log('   Error:', error.message);
  }
  
  console.log('\n🎯 Verificación completada');
};

healthCheck().catch(console.error); 