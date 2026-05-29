import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Credenciais fornecidas pelo usuário para o projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDknHdCQdLMvNn8NApB7IrGkJ1NbnjJ2FA",
  authDomain: "impactocopy-a59f8.firebaseapp.com",
  projectId: "impactocopy-a59f8",
  storageBucket: "impactocopy-a59f8.firebasestorage.app",
  messagingSenderId: "769563562951",
  appId: "1:769563562951:web:2c7d8934d04b78d8c03fe2",
  measurementId: "G-1DEH0EW2TE"
};

// Inicializa o app Firebase
const app = initializeApp(firebaseConfig);

// Inicializa e exporta serviços de Autenticação e Firestore
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;
