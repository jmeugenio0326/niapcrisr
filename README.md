# NIA PCRISR

NIA PCRISR is a React + Firebase Realtime Database app for managing PC (IAR) and RIS identifiers.

## Run locally

```bash
npm install
npm run dev
```

The Firebase project configuration is in `src/firebase.js`. The app intentionally uses the username as the key under `users/{username}` and stores records under `records/{username}/PC` and `records/{username}/RIS`.

## Realtime Database data shape

```json
{
  "users": {
    "sample.user": {
      "name": "Sample User",
      "role": "Records officer",
      "passcode": "1234"
    }
  },
  "records": {
    "sample.user": {
      "PC": {},
      "RIS": {}
    }
  }
}
```

The administrator is stored at `users/admin` with passcode `1234`. After signing in, use **Add people** to create name-only directory entries under `people/{name}`. PC and RIS are enabled by default for every directory person.

## Build

```bash
npm test
npm run build
```

## GitHub Pages deployment

Every push to `main` runs the tests, creates a production build, and deploys `dist` through GitHub Pages.

After enabling **Settings → Pages → Source: GitHub Actions** in the repository, the app is available at:

```text
https://jmeugenio0326.github.io/niapcrisr/
```

The Vite base path is configured for the repository name, so assets load correctly from the GitHub Pages subpath.
