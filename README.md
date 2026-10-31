# FoodDelivery API

Projet d'API REST et WebSocket de livraison de repas développé avec **NestJS**, **Prisma** et **Socket.IO**, en suivant l'architecture **DDD (Domain-Driven Design)**.

## Architecture du projet

Chaque module (`auth`, `users`, `restaurants`, `menu`, `orders`, `delivery`, `payment`, `notifications`, `admin`) est organisé selon les couches DDD :
- `domain/` : entités et interfaces (classes abstraites) des repositories
- `application/` : use-cases contenant la logique métier
- `infrastructure/` : implémentation des repositories avec Prisma
- `presentation/` : contrôleurs HTTP, DTOs et gateway WebSocket

## Rôles

- `CLIENT` : consulter les restaurants, passer/modifier/annuler une commande, payer
- `RESTAURANT` : gérer son restaurant, son menu et les commandes reçues
- `LIVREUR` : consulter ses livraisons et mettre à jour le statut / la position
- `ADMIN` : gestion globale (utilisateurs, restaurants, commandes, affectation livreur, dashboard)

## Routes principales

### Auth & Users
- `POST /auth/register` : créer un compte
- `POST /auth/login` : connexion (retourne accessToken et refreshToken)
- `POST /auth/refresh` : rafraîchir le token JWT
- `GET /users/me` : profil de l'utilisateur connecté

### Restaurants & Menu
- `GET /restaurants` : lister les restaurants
- `GET /restaurants/:id` : détail d'un restaurant avec son menu
- `POST /restaurants` : créer un restaurant (`RESTAURANT` / `ADMIN`)
- `PATCH /restaurants/:id` : modifier un restaurant (`RESTAURANT` / `ADMIN`)
- `DELETE /restaurants/:id` : supprimer un restaurant (`ADMIN`)
- `POST /restaurants/:id/menu` : ajouter un plat (`RESTAURANT`)
- `PATCH /menu/:id` : modifier un plat (`RESTAURANT`)
- `DELETE /menu/:id` : supprimer un plat (`RESTAURANT`)

### Commandes (Orders)
- `POST /orders` : créer une commande (`CLIENT`)
- `GET /orders/me` : historique des commandes du client (`CLIENT`)
- `GET /orders/:id` : détail et suivi d'une commande (`CLIENT` / `ADMIN`)
- `PATCH /orders/:id` : modifier une commande avant préparation (`CLIENT`)
- `PATCH /orders/:id/cancel` : annuler une commande (`CLIENT` / `ADMIN`)

### Livraison (Delivery) & Paiement (Payment)
- `POST /delivery/assign` : affecter un livreur (`ADMIN`)
- `PATCH /delivery/:id/status` : mettre à jour le statut et la position (`LIVREUR`)
- `GET /delivery/:id` : suivi de livraison (`CLIENT`)
- `POST /payment/checkout` : simuler le paiement d'une commande (`CLIENT`)
- `GET /payment/:orderId` : vérifier le statut du paiement (`CLIENT` / `ADMIN`)

### Notifications (WebSocket) & Admin
- Événements Socket.IO : `order:statusChanged`, `delivery:assigned`, `delivery:locationUpdate`, `restaurant:newOrder`
- `GET /notifications/me` : mes notifications
- `GET /admin/dashboard` : statistiques globales (`ADMIN`)

## Installation et démarrage

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev
```

Avec Docker :
```bash
docker compose up --build
```

Documentation Swagger disponible sur : `http://localhost:3000/api/docs`
