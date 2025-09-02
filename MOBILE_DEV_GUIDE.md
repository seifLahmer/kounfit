
# Guide du Développeur Mobile pour Kounfit

## 1. Introduction à l'Architecture

Bienvenue dans le projet Kounfit ! Cette application est construite sur une architecture hybride puissante utilisant **Next.js** pour la logique web et l'interface utilisateur, et **Capacitor** pour "envelopper" cette application web dans une coquille native pour Android et iOS.

- **Cœur de l'application** : Next.js (React)
- **Wrapper Natif** : Capacitor

Cela signifie que près de 99% du code que vous écrirez se trouvera dans le répertoire `/src` et sera du TypeScript/React. Les projets natifs (`/android` et `/ios`) servent principalement à configurer l'application et à intégrer des plugins natifs.

---

## 2. Structure du Projet

Voici les répertoires les plus importants que vous devez connaître :

- **`/` (Racine)** :
  - `capacitor.config.ts` : Fichier de configuration principal pour Capacitor (ID de l'app, nom, plugins).
  - `package.json` : Définit les dépendances et les scripts du projet.
  - `next.config.ts` : Configuration de Next.js.

- **`/src`** : **C'est ici que vous passerez le plus de temps.**
  - `/src/app` : Le cœur de l'application Next.js, avec toutes les pages et les composants de l'interface.
  - `/src/lib` : Contient la logique métier, notamment les services pour interagir avec Firebase.
  - `/src/components` : Composants React réutilisables.

- **`/android`** : Le projet natif Android.
  - Vous ouvrirez ce dossier dans **Android Studio** pour construire et lancer l'application sur un émulateur ou un appareil Android.

- **`/ios`** : Le projet natif iOS.
  - Vous ouvrirez ce dossier dans **Xcode** pour construire et lancer l'application sur un simulateur ou un appareil iOS.

- **`/public`** : Contient les assets statiques comme les images et le `manifest.json` pour la PWA.

---

## 3. Flux de Développement Mobile

Pour tester vos modifications sur un appareil mobile (émulateur ou physique), suivez impérativement ce processus :

**Étape 1 : Installer les dépendances** (uniquement la première fois)
```bash
npm install
```

**Étape 2 : Faire des modifications**
Modifiez le code comme d'habitude dans le répertoire `/src`.

**Étape 3 : Construire l'application web**
Capacitor a besoin d'une version "statique" de votre application Next.js. Cette commande la génère dans le dossier `/out`.
```bash
npm run build
```

**Étape 4 : Synchroniser avec les plateformes natives**
Cette commande est **CRUCIALE**. Elle copie le build web (`/out`) dans les projets natifs Android et iOS et met à jour les plugins.
```bash
npx cap sync
```

**Étape 5 : Lancer dans l'IDE Natif**
Ouvrez la plateforme de votre choix pour lancer l'application.
```bash
# Pour Android
npx cap open android

# Pour iOS
npx cap open ios
```
Une fois dans Android Studio ou Xcode, vous pouvez lancer l'application sur votre appareil ou émulateur/simulateur.

**Important :** Chaque fois que vous faites une modification dans `/src`, vous devez répéter les étapes 3 et 4 (`build` & `sync`) pour la voir apparaître sur le mobile.

---

## 4. Concepts Clés

### Logique et Interface (Single Codebase)

L'avantage de cette architecture est que vous n'écrivez la logique qu'une seule fois. Une modification dans un composant React dans `/src/app` sera répercutée sur le web, Android et iOS simultanément après un `build` et `sync`.

### Backend : Firebase

L'application utilise Firebase comme backend pour :
- **Authentication** : Gère l'inscription et la connexion des utilisateurs.
- **Firestore** : Base de données NoSQL pour stocker les profils utilisateurs, les repas, les commandes, etc.
- **Storage** : Pour héberger les images (photos de profil, images des repas).

Toute la logique d'interaction avec Firebase est centralisée dans les fichiers de service situés dans `/src/lib/services`.

### Accès aux fonctionnalités natives (Plugins Capacitor)

Pour utiliser des fonctionnalités natives du téléphone (caméra, géolocalisation, authentification native), nous utilisons les plugins Capacitor.

**Exemple avec l'authentification native (déjà implémentée) :**
Le plugin `@capacitor-firebase/authentication` est utilisé dans `src/app/login/page.tsx` pour permettre la connexion via Google et Apple de manière native sur mobile.

```typescript
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

if (Capacitor.isNativePlatform()) {
    // Utilise le SDK natif pour se connecter
    const result = await FirebaseAuthentication.signInWithGoogle();
    // ...
} else {
    // Utilise le SDK web standard
    await signInWithRedirect(auth, googleProvider);
}
```

### Publication sur les Stores

Le processus général est le suivant :

1.  **Générer une version signée** :
    -   **Android** : Depuis Android Studio, utilisez l'option `Build > Generate Signed Bundle / APK` pour créer un fichier `.aab`. Cela nécessite un fichier "keystore" que vous devez créer une seule fois et conserver précieusement.
    -   **iOS** : Depuis Xcode, "Archivez" le projet et suivez les étapes pour le distribuer sur l'App Store Connect.

2.  **Mise en ligne** :
    -   Connectez-vous à votre [Google Play Console](https://play.google.com/console) ou [App Store Connect](https://appstoreconnect.apple.com/).
    -   Créez une nouvelle version de l'application.
    -   Remplissez toutes les informations requises (description, captures d'écran, politique de confidentialité).
    -   Uploadez votre fichier `.aab` (Android) ou votre build archivé (iOS).
    -   Envoyez à la validation.

Ce guide devrait vous fournir une base solide pour commencer à développer sur la version mobile de Kounfit. Bonne chance !
