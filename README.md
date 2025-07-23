# 🦸‍♂️ API de Superhéroes

Una API REST completa para gestionar superhéroes, villanos y batallas épicas entre ellos.

## 🚀 Características

- **CRUD completo** para superhéroes y villanos
- **Sistema de batallas** con lógica de poder y aleatoriedad
- **Historial de batallas** persistente
- **Documentación automática** con Swagger
- **Validaciones** robustas
- **Arquitectura MVC** limpia

## 📋 Requisitos

- Node.js 18+
- npm o yarn

## 🛠️ Instalación

```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd api-superheroes

# Instalar dependencias
npm install

# Iniciar el servidor
npm start

# O para desarrollo con auto-reload
npm run dev
```

## Instalación de dependencias necesarias para MongoDB y JWT

```bash
npm install mongoose dotenv jsonwebtoken
```

## Variables de entorno
Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```
MONGODB_URI=mongodb+srv://uzielisaac28:J0nolN2H2vOHo4qQ@cluster0.pbysfka.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=mi_super_secreto_jwt_2024
```

## Seguridad y autenticación
- Todos los endpoints de batallas están protegidos con JWT.
- El token debe enviarse en el header `Authorization` como: `Bearer <token>`.
- Cada usuario solo puede ver y manipular sus propias batallas.

## 🌐 Endpoints

### Superhéroes
- `GET /api/heroes` - Listar todos los héroes
- `GET /api/heroes/:id` - Obtener héroe por ID
- `POST /api/heroes` - Crear nuevo héroe
- `PUT /api/heroes/:id` - Actualizar héroe
- `DELETE /api/heroes/:id` - Eliminar héroe

### Villanos
- `GET /api/villains` - Listar todos los villanos
- `GET /api/villains/:id` - Obtener villano por ID
- `POST /api/villains` - Crear nuevo villano
- `PUT /api/villains/:id` - Actualizar villano
- `DELETE /api/villains/:id` - Eliminar villano

### Batallas
- `POST /api/battle/:heroId/:villainId` - Realizar batalla
- `GET /api/battles` - Ver historial de batallas
- `GET /api/battles/:battleId` - Ver batalla específica

## 📊 Estructura de Datos

### Superhéroe
```json
{
  "id": 1,
  "name": "Clark Kent",
  "alias": "Superman",
  "city": "Metrópolis",
  "team": "Liga de la Justicia",
  "power": 95
}
```

### Villano
```json
{
  "id": 1,
  "name": "Lex Luthor",
  "alias": "Lex Luthor",
  "city": "Metrópolis",
  "team": "Ninguno",
  "power": 85
}
```

### Batalla
```json
{
  "id": 1703123456789,
  "timestamp": "2023-12-21T10:30:45.123Z",
  "hero": {
    "id": 1,
    "name": "Clark Kent",
    "alias": "Superman",
    "power": 95,
    "finalPower": 98.5
  },
  "villain": {
    "id": 1,
    "name": "Lex Luthor",
    "alias": "Lex Luthor",
    "power": 85,
    "finalPower": 87.2
  },
  "winner": { /* datos del ganador */ },
  "loser": { /* datos del perdedor */ },
  "message": "El ganador es: Superman (Clark Kent)",
  "powerDifference": "11.30",
  "isCloseBattle": false
}
```

## 🎮 Cómo usar

### 1. Iniciar el servidor
```bash
npm start
```

### 2. Ver documentación
Abre tu navegador en: `http://localhost:3001/api-docs`

### 3. Ejemplo de batalla
```bash
curl -X POST http://localhost:3001/api/battle/1/1
```

## 🔧 Tecnologías

- **Express.js** - Framework web
- **Swagger** - Documentación automática
- **fs-extra** - Manejo de archivos JSON
- **express-validator** - Validaciones

## 📁 Estructura del Proyecto

```
api-superheroes/
├── app.js                 # Punto de entrada
├── package.json           # Dependencias
├── swaggerConfig.js       # Configuración Swagger
├── superheroes.json       # Datos de héroes
├── villains.json          # Datos de villanos
├── 📄 battles.json        # Historial de batallas
├── controllers/           # Controladores
│   ├── heroController.js
│   ├── villainController.js
│   └── battleController.js
├── services/             # Lógica de negocio
│   ├── heroService.js
│   ├── villainService.js
│   └── battleService.js
├── repositories/         # Acceso a datos
└── models/              # Modelos de datos
```

## 🎯 Funcionalidades Destacadas

### Sistema de Batallas
- **Lógica de poder**: Cada personaje tiene un nivel de poder base
- **Factor aleatorio**: Se añade aleatoriedad para batallas más emocionantes
- **Historial persistente**: Todas las batallas se guardan automáticamente
- **Batallas cerradas**: Identifica cuando una batalla fue muy reñida

### Validaciones
- Verificación de existencia de personajes
- Validación de tipos de datos
- Manejo de errores robusto

### Documentación
- Swagger UI automático
- Ejemplos de uso
- Códigos de respuesta detallados

## 🚀 Próximas Mejoras

- [ ] Autenticación y autorización
- [ ] Base de datos (PostgreSQL/MongoDB)
- [ ] Tests unitarios y de integración
- [ ] Rate limiting
- [ ] Logging avanzado
- [ ] Docker containerization
- [ ] CI/CD pipeline

## 📝 Licencia

ISC License 