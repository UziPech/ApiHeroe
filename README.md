# 🦸‍♂️ Superheroes API by Uziel Isaac

Una API REST completa para gestionar superhéroes, villanos y crear batallas épicas. Incluye sistema de batallas 3v3 por equipos, duelos 1v1 aleatorios y autenticación JWT con seguridad por usuario.

## 🚀 Características

- **Sistema de batallas 3v3** con combate por turnos y contraataques de IA
- **Duelos 1v1 aleatorios** entre héroes y villanos
- **CRUD completo** para superhéroes y villanos
- **Autenticación JWT** con seguridad por usuario
- **Historial de batallas** privado por usuario
- **Documentación automática** con Swagger UI
- **Base de datos MongoDB** con modelos Mongoose
- **Detección de empates** cuando ambos equipos son eliminados
- **Arquitectura MVC** limpia y modular

## 📋 Requisitos

- Node.js 18+
- MongoDB (local o Atlas)
- npm o yarn

## 🛠️ Instalación

```bash
# Clonar el repositorio
git clone https://github.com/UziPech/ApiHeroe.git
cd SUPERHEROES-backend-y-frontend

# Instalar dependencias
npm install

# Configurar variables de entorno (ver sección Variables de entorno)

# Importar datos iniciales (opcional)
node scripts/importCharacters.js

# Iniciar el servidor
npm start
```

## 📦 Dependencias principales

```bash
npm install express mongoose dotenv jsonwebtoken bcryptjs express-validator swagger-jsdoc swagger-ui-express
```

## 🔐 Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/superheroes
JWT_SECRET=tu_super_secreto_jwt_muy_largo_y_seguro_2024
PORT=3000
NODE_ENV=development
```

## 🛡️ Seguridad y Autenticación

- **JWT Authentication**: Todos los endpoints de batallas y duelos están protegidos
- **Aislamiento por usuario**: Cada usuario solo puede ver sus propias batallas
- **Token Bearer**: Envía el token en el header `Authorization: Bearer <token>`
- **Contraseñas hasheadas**: bcryptjs con salt de 10 rounds

## 🌐 Endpoints de la API

### 👤 Autenticación y Usuarios
- `POST /api/users/register` - Registro de nuevo usuario
- `POST /api/users/login` - Inicio de sesión (obtiene JWT token)

### 🦸‍♂️ Superhéroes
- `GET /api/heroes` - Listar todos los héroes
- `GET /api/heroes/:id` - Obtener héroe por ID
- `POST /api/heroes` - Crear nuevo héroe
- `PUT /api/heroes/:id` - Actualizar héroe
- `DELETE /api/heroes/:id` - Eliminar héroe

### 🦹‍♂️ Villanos
- `GET /api/villains` - Listar todos los villanos
- `GET /api/villains/:id` - Obtener villano por ID
- `POST /api/villains` - Crear nuevo villano
- `PUT /api/villains/:id` - Actualizar villano
- `DELETE /api/villains/:id` - Eliminar villano

### ⚔️ Batallas 3v3 (Requiere autenticación)
- `POST /api/battle/:heroId/:villainId` - Crear batalla entre equipos
- `GET /api/battles` - Ver historial personal de batallas
- `GET /api/battles/:battleId` - Ver batalla específica

### 🥊 Duelos 1v1 (Requiere autenticación)
- `POST /api/duels/random` - Crear duelo aleatorio entre héroe y villano
- `GET /api/duels` - Ver historial personal de duelos
- `GET /api/duels/:duelId` - Ver duelo específico

## 📊 Estructura de Datos

### 👤 Usuario
```json
{
  "_id": "ObjectId",
  "username": "uziel_gamer",
  "email": "uziel@example.com",
  "password": "hashed_password"
}
```

### 🦸‍♂️ Superhéroe
```json
{
  "_id": "ObjectId",
  "id": 1,
  "name": "Clark Kent",
  "alias": "Superman",
  "city": "Metrópolis",
  "team": "Liga de la Justicia",
  "power": 95
}
```

### 🦹‍♂️ Villano
```json
{
  "_id": "ObjectId",
  "id": 1,
  "name": "Lex Luthor",
  "alias": "Lex Luthor",
  "city": "Metrópolis",
  "team": "Ninguno",
  "power": 85
}
```

### ⚔️ Batalla 3v3
```json
{
  "_id": "ObjectId",
  "battleId": "battle_12345",
  "userId": "ObjectId_del_usuario",
  "timestamp": "2024-07-22T10:30:45.123Z",
  "heroTeam": [
    {
      "id": 1,
      "name": "Superman",
      "power": 95,
      "hp": 100,
      "isAlive": true
    }
  ],
  "villainTeam": [
    {
      "id": 1,
      "name": "Lex Luthor", 
      "power": 85,
      "hp": 100,
      "isAlive": false
    }
  ],
  "winner": "heroes",
  "isEmpate": false,
  "battleLog": [
    "Superman ataca a Lex Luthor por 25 de daño",
    "Lex Luthor contraataca por 18 de daño"
  ]
}
```

### 🥊 Duelo 1v1
```json
{
  "_id": "ObjectId",
  "duelId": "duel_67890",
  "userId": "ObjectId_del_usuario",
  "timestamp": "2024-07-22T11:15:30.456Z",
  "hero": {
    "id": 2,
    "name": "Wonder Woman",
    "power": 90
  },
  "villain": {
    "id": 3,
    "name": "Joker",
    "power": 75
  },
  "winner": "villain",
  "message": "¡Joker gana por suerte en este duelo aleatorio!"
}
```

## 🎮 Guía de Uso

### 1. Iniciar el servidor
```bash
npm start
# Servidor corriendo en http://localhost:3000
```

### 2. Ver documentación interactiva
Abre tu navegador en: `http://localhost:3000/api-docs`

### 3. Registrarse y obtener token
```bash
# Registro
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username": "uziel", "email": "uziel@test.com", "password": "123456"}'

# Login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "uziel@test.com", "password": "123456"}'
```

### 4. Ejemplos de batallas (con token)
```bash
# Batalla 3v3 entre equipos
curl -X POST http://localhost:3000/api/battle/1/1 \
  -H "Authorization: Bearer TU_TOKEN_AQUI"

# Duelo 1v1 aleatorio
curl -X POST http://localhost:3000/api/duels/random \
  -H "Authorization: Bearer TU_TOKEN_AQUI"

# Ver historial de batallas
curl -X GET http://localhost:3000/api/battles \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## 🔧 Tecnologías

- **Express.js** - Framework web backend
- **MongoDB + Mongoose** - Base de datos NoSQL
- **JWT (jsonwebtoken)** - Autenticación y autorización
- **bcryptjs** - Hash de contraseñas
- **Swagger UI** - Documentación interactiva de la API
- **express-validator** - Validaciones robustas

## 📁 Estructura del Proyecto

```
SUPERHEROES-backend-y-frontend/
├── app.js                    # Punto de entrada principal
├── package.json              # Dependencias y scripts
├── swaggerConfig.js          # Configuración Swagger/OpenAPI
├── .env                      # Variables de entorno (no incluido)
├── battles.json             # Archivo JSON de respaldo
├── superheroes.json         # Datos iniciales de héroes  
├── villains.json            # Datos iniciales de villanos
├── config/
│   └── db.js                # Configuración MongoDB
├── controllers/             # Controladores MVC
│   ├── battleController.js  # Lógica de batallas 3v3
│   ├── duelController.js    # Lógica de duelos 1v1
│   ├── heroController.js    # CRUD de héroes
│   ├── userController.js    # Autenticación
│   └── villainController.js # CRUD de villanos
├── middlewares/
│   └── authMiddleware.js    # Middleware JWT
├── models/                  # Modelos Mongoose
│   ├── battleModel.js       # Esquema de batallas
│   ├── duelModel.js         # Esquema de duelos
│   ├── heroModel.js         # Esquema de héroes
│   ├── userModel.js         # Esquema de usuarios
│   └── villainModel.js      # Esquema de villanos
├── repositories/            # Capa de acceso a datos
│   ├── battleRepository.js
│   ├── heroRepository.js
│   └── villainRepository.js
├── routes/                  # Definición de rutas
│   ├── battleRoutes.js      # Rutas de batallas
│   └── duelRoutes.js        # Rutas de duelos
├── scripts/                 # Scripts de utilidad
│   ├── importBattles.js     # Importar datos de batallas
│   └── importCharacters.js  # Importar héroes y villanos
├── services/                # Lógica de negocio
│   ├── battleService.js     # Algoritmo de batalla 3v3
│   ├── duelService.js       # Algoritmo de duelo 1v1
│   ├── heroService.js       # Servicios de héroes
│   └── villainService.js    # Servicios de villanos
└── public/                  # Archivos estáticos
    ├── index.html           # Página principal
    └── main.js              # JavaScript frontend
```

## 🎯 Funcionalidades Destacadas

### 🥊 Sistema de Batallas 3v3
- **Combate por turnos**: Los personajes atacan uno por uno automáticamente
- **HP y supervivencia**: Cada personaje tiene 100 HP, cuando llega a 0 muere
- **Contraataques de IA**: Los enemigos contraatacan después de recibir daño
- **Cambio automático**: Cuando un personaje muere, el siguiente toma su lugar
- **Detección de empates**: Si ambos equipos son eliminados, se declara empate
- **Log detallado**: Registro completo de todos los ataques y eventos

### 🎲 Sistema de Duelos 1v1  
- **Selección aleatoria**: Elige aleatoriamente un héroe y un villano
- **Victoria por suerte**: El ganador se decide por probabilidad 50/50
- **Módulo independiente**: No afecta el sistema de batallas 3v3
- **Historial separado**: Los duelos se guardan independientemente

### 🔐 Seguridad Robusta
- **Autenticación JWT**: Tokens seguros con expiración
- **Contraseñas hasheadas**: bcrypt con salt para máxima seguridad
- **Aislamiento por usuario**: Cada usuario solo ve sus propios datos
- **Middleware de protección**: Verificación automática en rutas protegidas

### 📊 Base de Datos MongoDB
- **Modelos Mongoose**: Esquemas bien definidos y validados
- **Escalabilidad**: Preparado para manejar miles de batallas
- **Índices optimizados**: Búsquedas rápidas por usuario y fechas
- **Transacciones**: Operaciones atómicas para consistencia

### 📚 Documentación Completa
- **Swagger UI interactivo**: Prueba endpoints directamente
- **Ejemplos de código**: Requests y responses de ejemplo
- **Autenticación integrada**: Interfaz para probar con tokens JWT
- **Esquemas detallados**: Documentación completa de todos los modelos

## 🚀 Despliegue en Producción

### Configuración para Render/Heroku
La aplicación está lista para despliegue con:
- **Puerto dinámico**: `process.env.PORT || 3000`
- **Variables de entorno**: Configuración segura para producción
- **Swagger adaptativo**: URLs automáticas según el entorno
- **Scripts npm**: `start` y `dev` configurados

### Variables de entorno requeridas en producción:
```env
MONGODB_URI=tu_mongodb_atlas_uri
JWT_SECRET=tu_jwt_secret_muy_seguro
NODE_ENV=production
```

## 🔄 Scripts Disponibles

```bash
npm start          # Iniciar servidor en producción
npm run dev        # Iniciar servidor en desarrollo  
node scripts/importCharacters.js  # Importar datos iniciales
```

## 🧪 Testing y Validación

### Endpoints para probar:
1. **Registro/Login**: Crear usuario y obtener token
2. **CRUD Básico**: Listar héroes y villanos
3. **Batalla 3v3**: Crear batalla entre equipos
4. **Duelo 1v1**: Duelo aleatorio
5. **Historial**: Ver batallas anteriores

### Códigos de respuesta:
- `200` - Operación exitosa
- `201` - Recurso creado
- `400` - Error de validación
- `401` - No autorizado
- `404` - Recurso no encontrado
- `500` - Error interno del servidor

## 📈 Próximas Mejoras

- [ ] ✅ Sistema de batallas 3v3 completo
- [ ] ✅ Duelos 1v1 aleatorios
- [ ] ✅ Autenticación JWT robusta
- [ ] ✅ Base de datos MongoDB
- [ ] ✅ Documentación Swagger completa
- [ ] ✅ Despliegue en producción
- [ ] 🔄 Tests unitarios y de integración
- [ ] 🔄 Rate limiting y protección DDoS
- [ ] 🔄 Logging avanzado con Winston
- [ ] 🔄 Métricas y monitoreo
- [ ] 🔄 WebSockets para batallas en tiempo real
- [ ] 🔄 Torneos y clasificaciones

## 👨‍💻 Autor

**Uziel Isaac**
- GitHub: [@UziPech](https://github.com/UziPech)
- Proyecto: [ApiHeroe](https://github.com/UziPech/ApiHeroe)

## 📝 Licencia

ISC License - Libre para uso personal y comercial. 