import { firebaseConfig } from "./firebaseConfig";
import type { FirebaseApp } from "firebase/app";
import type * as FirebaseAuthModule from "firebase/auth";
import type {
  Auth,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";

export type FirebaseAuthBundle = {
  firebaseApp: FirebaseApp;
  auth: Auth;
  authModule: typeof FirebaseAuthModule;
  googleProvider: GoogleAuthProvider;
  githubProvider: GithubAuthProvider;
};

let bundle: FirebaseAuthBundle | null = null;
let bundlePromise: Promise<FirebaseAuthBundle> | null = null;

export const loadFirebaseAuth = (): Promise<FirebaseAuthBundle> => {
  if (bundle) return Promise.resolve(bundle);
  if (!bundlePromise) {
    bundlePromise = Promise.all([
      import("firebase/app"),
      import("firebase/auth"),
    ]).then(([{ initializeApp }, authModule]) => {
      const firebaseApp = initializeApp(firebaseConfig);
      const auth = authModule.getAuth(firebaseApp);
      bundle = {
        firebaseApp,
        auth,
        authModule,
        googleProvider: new authModule.GoogleAuthProvider(),
        githubProvider: new authModule.GithubAuthProvider(),
      };
      return bundle;
    });
  }
  return bundlePromise;
};

export const scheduleFirebaseAuthPreload = (): void => {
  if (typeof window === "undefined" || bundle || bundlePromise) return;
  const runPreload = () => {
    void loadFirebaseAuth();
  };
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(runPreload);
  } else {
    window.setTimeout(runPreload, 1500);
  }
};
