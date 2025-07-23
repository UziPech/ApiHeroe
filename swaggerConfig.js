const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Superheroes API',
      version: '1.0.2',
      description: 'Una API sencilla de Superhéroes con Express. Permite registrar usuarios, iniciar sesión, simular batallas 3v3 entre equipos de héroes y villanos, y crear duelos 1v1 aleatorios.',
    },
    servers: [
      {
        url: 'https://apiheroe.vercel.app',
        description: 'Servidor de producción en Vercel'
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        // Esquemas para CREACIÓN de personajes (solo campos que proporciona el usuario)
        HeroCreate: {
          type: 'object',
          required: ['name', 'alias'],
          properties: {
            name: { type: 'string', example: 'Superman', description: 'Nombre del héroe' },
            alias: { type: 'string', example: 'Clark Kent', description: 'Identidad secreta del héroe' },
            city: { type: 'string', example: 'Metropolis', description: 'Ciudad del héroe (opcional)' },
            team: { type: 'string', example: 'Justice League', description: 'Equipo del héroe (opcional)' }
          }
        },
        VillainCreate: {
          type: 'object',
          required: ['name', 'alias'],
          properties: {
            name: { type: 'string', example: 'Joker', description: 'Nombre del villano' },
            alias: { type: 'string', example: 'Joker', description: 'Identidad secreta del villano' },
            city: { type: 'string', example: 'Gotham City', description: 'Ciudad del villano (opcional)' },
            team: { type: 'string', example: 'Legion of Doom', description: 'Equipo del villano (opcional)' }
          }
        },
        // Esquemas para RESPUESTA de personajes (con todos los campos de la base de datos)
        Hero: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1, description: 'ID único asignado automáticamente por el sistema' },
            name: { type: 'string', example: 'Superman' },
            alias: { type: 'string', example: 'Clark Kent' },
            power: { type: 'number', example: 85, description: 'Poder generado aleatoriamente (1-100)' },
            city: { type: 'string', example: 'Metropolis', description: 'Ciudad del héroe' },
            team: { type: 'string', example: 'Justice League', description: 'Equipo del héroe' }
          }
        },
        Villain: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 101, description: 'ID único asignado automáticamente por el sistema' },
            name: { type: 'string', example: 'Joker' },
            alias: { type: 'string', example: 'Joker' },
            power: { type: 'number', example: 78, description: 'Poder generado aleatoriamente (1-100)' },
            city: { type: 'string', example: 'Gotham City', description: 'Ciudad del villano' },
            team: { type: 'string', example: 'Legion of Doom', description: 'Equipo del villano' }
          }
        },
        CharacterState: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Superman' },
            alias: { type: 'string', example: 'Clark Kent' },
            power: { type: 'number', example: 100 },
            level: { type: 'number', example: 1 },
            defense: { type: 'number', example: 50 },
            maxDefense: { type: 'number', example: 50 },
            hp: { type: 'number', example: 80 }
          }
        },
        BattleState: {
          type: 'object',
          properties: {
            current: {
              type: 'object',
              properties: {
                side: { type: 'string', example: 'heroes' },
                hero: { type: 'number', example: 1 },
                villain: { type: 'number', example: 101 }
              }
            },
            nextTurn: {
              type: 'object',
              nullable: true,
              properties: {
                attacker: {
                  type: 'object',
                  properties: {
                    id: { type: 'number', example: 101 },
                    team: { type: 'string', example: 'villains' },
                    name: { type: 'string', example: 'Joker' },
                    alias: { type: 'string', example: 'Joker' }
                  }
                },
                defender: {
                  type: 'object',
                  nullable: true,
                  properties: {
                    id: { type: 'number', example: 1 },
                    team: { type: 'string', example: 'heroes' },
                    name: { type: 'string', example: 'Superman' },
                    alias: { type: 'string', example: 'Superman' }
                  }
                }
              }
            },
            defeated: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' },
                  alias: { type: 'string' },
                  team: { type: 'string' }
                }
              }
            },
            actions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  attacker: { type: 'number' },
                  attackerName: { type: 'string' },
                  attackerTeam: { type: 'string' },
                  defender: { type: 'number' },
                  defenderName: { type: 'string' },
                  defenderTeam: { type: 'string' },
                  attackType: { type: 'string' },
                  damage: { type: 'number' },
                  defenderHpBefore: { type: 'number' },
                  defenderHpAfter: { type: 'number' },
                  isDefeated: { type: 'boolean' }
                }
              }
            },
            winner: { 
              type: 'string', 
              nullable: true, 
              example: null, 
              enum: ['heroes', 'villains', 'empate', null],
              description: 'Resultado de la batalla: "heroes" si ganan los héroes, "villains" si ganan los villanos, "empate" si ambos equipos son eliminados, o null si la batalla continúa'
            },
            finished: { type: 'boolean', example: false },
            teams: {
              type: 'object',
              properties: {
                heroes: {
                  type: 'array',
                  items: { '$ref': '#/components/schemas/CharacterState' }
                },
                villains: {
                  type: 'array',
                  items: { '$ref': '#/components/schemas/CharacterState' }
                }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './controllers/heroController.js',
    './controllers/villainController.js', 
    './controllers/userController.js',
    './controllers/battleController.js',
    './controllers/duelController.js',
    './routes/battleRoutes.js',
    './routes/duelRoutes.js'
  ],
};

export default options;
