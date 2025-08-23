# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Fonctionnement de l'application

Kounfit est une plateforme complète qui connecte intelligemment trois types d'utilisateurs : les **Clients**, les **Traiteurs** et les **Livreurs**, le tout supervisé par des **Administrateurs**.

### 1. Inscription et Rôles

*   **Choix du rôle :** Tout commence par une page d'inscription unique où l'utilisateur choisit son rôle (Client, Traiteur ou Livreur).
*   **Processus en deux étapes :**
    *   **Étape 1 :** L'utilisateur crée son compte avec un nom, un email et un mot de passe.
    *   **Étape 2 :** Il est ensuite redirigé vers un formulaire spécifique à son rôle pour compléter son profil (objectifs nutritionnels pour le client, nom du restaurant pour le traiteur, etc.).
*   **Approbation des partenaires :** Les comptes des **Traiteurs** et **Livreurs** sont mis "en attente". Ils ne peuvent pas accéder à leur interface tant qu'un **Administrateur** n'a pas manuellement approuvé leur compte. Pendant cette période, s'ils tentent de se connecter, ils sont redirigés vers une page leur expliquant que leur compte est en cours de validation.

### 2. L'Interface Client

*   **Objectif principal :** Aider les clients à atteindre leurs objectifs nutritionnels (perte de poids, maintien, etc.).
*   **Tableau de bord (`/home`) :** Affiche un résumé des calories et des macros consommées pour la journée par rapport à leurs objectifs personnels, qui sont calculés automatiquement lors de l'inscription.
*   **Plan de repas quotidien :** Le client peut ajouter des repas (petit-déjeuner, déjeuner, etc.) à son plan du jour. Ces repas sont choisis parmi une liste de plats proposés par les traiteurs inscrits sur la plateforme.
*   **Panier et Commande (`/shopping-list`) :** Les repas ajoutés au plan du jour apparaissent automatiquement dans le panier. Le client peut alors passer une commande, qui est envoyée aux traiteurs concernés.
*   **Profil personnalisable (`/profile`) :** Le client peut mettre à jour ses informations personnelles, ses objectifs et ses données physiques, ce qui recalcule automatiquement ses besoins nutritionnels.

### 3. L'Interface Traiteur

*   **Objectif principal :** Gérer les repas et les commandes.
*   **Ajout de repas avec IA (`/caterer/add-meal`) :** Le traiteur peut simplement taper le nom d'un plat (ex: "Couscous au poulet"). L'IA analyse ce nom et génère automatiquement une description marketing, une liste d'ingrédients estimée et un calcul complet des calories et des macros. Le traiteur peut ensuite ajuster ces informations, fixer un prix et ajouter une photo avant de publier le repas.
*   **Gestion des commandes (`/caterer`) :** Il peut voir les nouvelles commandes, les marquer comme "en préparation" puis "prêtes pour la livraison". Chaque changement de statut envoie une notification au client.
*   **Statistiques (`/caterer/stats`) :** Un tableau de bord visuel lui montre son chiffre d'affaires, les repas les plus populaires et les mieux notés.

### 4. L'Interface Administrateur

*   **Supervision totale :** L'administrateur a une vue d'ensemble de toute l'activité.
*   **Gestion des utilisateurs :** Il peut voir la liste des traiteurs, leur chiffre d'affaires et supprimer un partenaire si nécessaire.
*   **Suivi des commandes :** Il peut consulter toutes les commandes passées sur la plateforme et les filtrer par région.
*   **Gestion des rôles (`/admin/manage`) :** C'est ici que l'administrateur approuve les nouveaux comptes de traiteurs et de livreurs. Il peut également assigner le rôle d'administrateur à d'autres utilisateurs.
