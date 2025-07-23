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
        Hero: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Superman' },
            alias: { type: 'string', example: 'Clark Kent' },
            power: { type: 'number', example: 100 },
            level: { type: 'number', example: 1 },
            defense: { type: 'number', example: 50 }
          }
        },
        Villain: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 101 },
            name: { type: 'string', example: 'Joker' },
            alias: { type: 'string', example: 'Joker' },
            power: { type: 'number', example: 90 },
            level: { type: 'number', example: 1 },
            defense: { type: 'number', example: 40 }
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
  apis: ['./controllers/*.js', './routes/*.js'],
};

export default options;
