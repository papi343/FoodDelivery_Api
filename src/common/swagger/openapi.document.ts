export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'FoodDelivery API',
    description:
      'API REST & WebSocket de livraison de repas (type Uber Eats / Glovo) construite avec NestJS et une architecture Domain-Driven Design (DDD).',
    version: '1.0.0',
  },
  servers: [{ url: 'http://localhost:3000', description: 'Local Dev Server' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Créer un compte (Public)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nom', 'email', 'password'],
                properties: {
                  nom: { type: 'string', example: 'Jean Dupont' },
                  email: { type: 'string', example: 'client@food.com' },
                  password: { type: 'string', example: 'password123' },
                  role: {
                    type: 'string',
                    enum: ['CLIENT', 'RESTAURANT', 'LIVREUR', 'ADMIN'],
                    example: 'CLIENT',
                  },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Compte créé + JWT tokens' } },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Connexion, retourne JWT access & refresh tokens (Public)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'client@food.com' },
                  password: { type: 'string', example: 'password123' },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Connexion réussie' } },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Rafraîchir le token JWT',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                  refreshToken: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Nouveaux tokens générés' } },
      },
    },
    '/restaurants': {
      get: {
        tags: ['Restaurants'],
        summary: 'Lister les restaurants (Public)',
        responses: { '200': { description: 'Liste des restaurants' } },
      },
      post: {
        tags: ['Restaurants'],
        summary: 'Créer un restaurant (RESTAURANT / ADMIN)',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Restaurant créé' } },
      },
    },
    '/restaurants/{id}': {
      get: {
        tags: ['Restaurants'],
        summary: 'Détail du restaurant + menu (Public)',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: { '200': { description: 'Détail restaurant et menu' } },
      },
      patch: {
        tags: ['Restaurants'],
        summary: 'Modifier infos / disponibilité (RESTAURANT / ADMIN)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: { '200': { description: 'Restaurant mis à jour' } },
      },
      delete: {
        tags: ['Restaurants'],
        summary: 'Supprimer un restaurant (ADMIN)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: { '200': { description: 'Restaurant supprimé' } },
      },
    },
    '/restaurants/{id}/menu': {
      get: {
        tags: ['Menu'],
        summary: 'Lister le menu d’un restaurant (Public)',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: { '200': { description: 'Menu du restaurant' } },
      },
      post: {
        tags: ['Menu'],
        summary: 'Ajouter un plat au menu (RESTAURANT)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: { '201': { description: 'Plat ajouté' } },
      },
    },
    '/menu/{id}': {
      patch: {
        tags: ['Menu'],
        summary: 'Modifier un plat (RESTAURANT)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: { '200': { description: 'Plat modifié' } },
      },
      delete: {
        tags: ['Menu'],
        summary: 'Retirer un plat (RESTAURANT)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: { '200': { description: 'Plat supprimé' } },
      },
    },
    '/orders': {
      post: {
        tags: ['Commandes'],
        summary: 'Créer une commande (CLIENT)',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Commande créée' } },
      },
    },
    '/orders/me': {
      get: {
        tags: ['Commandes'],
        summary: 'Historique des commandes du client (CLIENT)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Historique commandes' } },
      },
    },
    '/orders/{id}': {
      get: {
        tags: ['Commandes'],
        summary: 'Suivre une commande (CLIENT / ADMIN)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: { '200': { description: 'Détail commande' } },
      },
      patch: {
        tags: ['Commandes'],
        summary: 'Modifier une commande avant préparation (CLIENT)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: { '200': { description: 'Commande modifiée' } },
      },
    },
    '/orders/{id}/cancel': {
      patch: {
        tags: ['Commandes'],
        summary: 'Annuler une commande (CLIENT / ADMIN)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: { '200': { description: 'Commande annulée' } },
      },
    },
    '/delivery/assign': {
      post: {
        tags: ['Livraison'],
        summary: 'Affecter un livreur à une commande (ADMIN / SYSTEM)',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Livreur affecté' } },
      },
    },
    '/delivery/{id}/status': {
      patch: {
        tags: ['Livraison'],
        summary: 'Mettre à jour le statut et la position de livraison (LIVREUR)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: { '200': { description: 'Statut livraison mis à jour' } },
      },
    },
    '/delivery/{id}': {
      get: {
        tags: ['Livraison'],
        summary: 'Suivi de livraison (CLIENT)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: { '200': { description: 'Détail livraison' } },
      },
    },
    '/payment/checkout': {
      post: {
        tags: ['Paiement'],
        summary: 'Simuler un paiement (CLIENT)',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Paiement traité' } },
      },
    },
    '/payment/{orderId}': {
      get: {
        tags: ['Paiement'],
        summary: 'Statut du paiement d’une commande (CLIENT / ADMIN)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'orderId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: { '200': { description: 'Détail paiement' } },
      },
    },
    '/admin/dashboard': {
      get: {
        tags: ['Admin'],
        summary: 'Tableau de bord global (ADMIN)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Statistiques globales' } },
      },
    },
  },
};
