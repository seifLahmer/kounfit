# Kounfit - Plateforme de Nutrition Intelligente

Kounfit est une application complète qui connecte intelligemment trois types d'utilisateurs : les **Clients**, les **Traiteurs** et les **Livreurs**, le tout supervisé par des **Administrateurs**.

## Fonctionnement de l'application

### 1. Inscription et Rôles

*   **Choix du rôle :** Tout commence par une page d'inscription unique où l'utilisateur choisit son rôle (Client, Traiteur ou Livreur).
*   **Processus en deux étapes :**
    *   **Étape 1 :** L'utilisateur crée son compte avec un nom, un email et un mot de passe.
    *   **Étape 2 :** Il est ensuite redirigé vers un formulaire spécifique à son rôle pour compléter son profil (objectifs nutritionnels pour le client, nom du restaurant pour le traiteur, type de véhicule pour le livreur, etc.).
*   **Approbation des partenaires :** Les comptes des **Traiteurs** et **Livreurs** sont mis "en attente". Ils ne peuvent pas accéder à leur interface tant qu'un **Administrateur** n'a pas manuellement approuvé leur compte. S'ils tentent de se connecter, ils sont redirigés vers une page leur expliquant que leur compte est en cours de validation.

### 2. L'Interface Client

*   **Objectif principal :** Aider les clients à atteindre leurs objectifs nutritionnels (perte de poids, maintien, etc.).
*   **Tableau de bord (`/home`) :** Affiche un résumé des calories et des macros consommées pour la journée par rapport à leurs objectifs personnels, qui sont calculés automatiquement lors de l'inscription et ajustables depuis le profil.
*   **Plan de repas quotidien :** Le client peut ajouter des repas (petit-déjeuner, déjeuner, etc.) à son plan du jour. Ces repas sont choisis parmi une liste de plats proposés par les traiteurs de **la même région que le client**.
*   **Panier et Commande (`/shopping-list`) :** Les repas ajoutés au plan du jour apparaissent automatiquement dans le panier. Le client peut alors passer une commande, qui est envoyée aux traiteurs concernés.
*   **Profil personnalisable (`/profile`) :** Le client peut mettre à jour ses informations personnelles, ses objectifs et ses données physiques, ce qui recalcule automatiquement ses besoins nutritionnels. Les modifications sont sauvegardées automatiquement.
*   **Favoris (`/meal-plans`) :** Une page dédiée où le client retrouve tous les repas qu'il a marqués comme favoris.

### 3. L'Interface Traiteur

*   **Objectif principal :** Gérer les repas et les commandes de sa région.
*   **Tableau de bord (`/caterer`) :** Il peut voir les nouvelles commandes des clients de sa région, les marquer comme "en préparation" puis "prêtes pour la livraison" en assignant un livreur.
*   **Ajout de repas avec IA (`/caterer/add-meal`) :** Le traiteur peut simplement taper le nom d'un plat (ex: "Couscous au poulet"). L'IA génère automatiquement une description, une liste d'ingrédients et un calcul des calories/macros. Le traiteur peut ajuster ces informations, fixer un prix et ajouter une photo avant de publier le repas.
*   **Statistiques (`/caterer/stats`) :** Un tableau de bord visuel lui montre son chiffre d'affaires, les repas les plus populaires et les mieux notés.
*   **Profil (`/caterer/profile`) :** Permet au traiteur de modifier le nom de son restaurant et de gérer sa liste de livreurs préférés. Les modifications sont enregistrées automatiquement.

### 4. L'Interface Livreur

*   **Objectif principal :** Gérer les livraison dans sa zone géographique.
*   **Tableau de bord (`/delivery`) :** Le livreur voit toutes les commandes de sa région qui lui ont été assignées et qui sont prêtes. Il peut les marquer comme "livrées" une fois la livraison effectuée.
*   **Portefeuille (`/delivery/wallet`) :** Affiche le chiffre d'affaires total (basé sur 7 DT par livraison) et l'historique de toutes les commandes livrées.
*   **Profil (`/delivery/profile`) :** Permet au livreur de mettre à jour son nom et son type de véhicule. Les modifications sont enregistrées automatiquement.

### 5. L'Interface Administrateur

*   **Supervision totale :** L'administrateur a une vue d'ensemble de toute l'activité.
*   **Gestion des utilisateurs :** Il peut voir la liste des traiteurs et des livreurs, leur statut (approuvé, en attente, rejeté) et leurs informations de base.
*   **Suivi des commandes :** Il peut consulter toutes les commandes passées sur la plateforme et les filtrer par région.
*   **Gestion des comptes (`/admin`) :** C'est ici que l'administrateur approuve ou rejette les nouveaux comptes de traiteurs et de livreurs.

## Structure du Projet Détaillée

Comprendre la structure des dossiers est essentiel pour naviguer et contribuer efficacement au projet.

-   **`/src`** : **Le Cœur de l'Application.** C'est ici que se trouve 95% du code. Il contient toute la logique de l'application web construite avec Next.js et React, incluant les pages, les composants, la logique métier (`/lib`) et l'intégration de l'IA (`/ai`).

-   **`/public`** : **Assets Statiques.** Contient tous les fichiers qui doivent être accessibles directement via une URL, comme les images (logos, illustrations), les polices de caractères, et le `manifest.json` qui configure la Progressive Web App (PWA).

-   **`/android`** & **`/ios`** : **Projets Mobiles Natifs.** Ces dossiers sont les projets natifs générés par Capacitor. Vous les ouvrez respectivement dans Android Studio (pour Android) et Xcode (pour iOS) pour compiler, tester sur des appareils/émulateurs, et publier les applications sur les stores.

-   **`/out`** : **Build de l'Application.** Lorsque vous exécutez la commande `npm run build`, Next.js compile votre application en une version statique optimisée. Le résultat est stocké dans ce dossier `/out`. C'est ce contenu que Capacitor copie ensuite dans les projets `/android` et `/ios`.

-   **`/node_modules`** : **Dépendances du Projet.** Dossier standard géré par `npm` qui contient toutes les librairies et paquets externes dont le projet a besoin pour fonctionner (React, Next.js, Firebase, etc.).

-   **`/dataconnect`** : **Configuration de Data Connect.** Ce dossier contient le schéma de votre base de données (`.gql`) et la configuration qui permet à votre code de communiquer de manière sécurisée et fortement typée avec votre base de données Firestore.

-   **`/.next`**, **`/.firebase`**, **`/.idx`** : **Dossiers de Cache et de Configuration.** Ces dossiers sont généralement générés et gérés automatiquement par vos outils de développement. `/.next` est utilisé par Next.js pour le cache de développement, `/.firebase` par les outils Firebase, et `/.idx` par l'environnement de développement Project IDX. Vous n'aurez pas besoin de les modifier manuellement.

-   **`/workspace`** : **Dossier Racine de l'Environnement.** Dans certains environnements de développement comme Project IDX, c'est simplement le nom du dossier racine qui contient l'ensemble de votre projet.
