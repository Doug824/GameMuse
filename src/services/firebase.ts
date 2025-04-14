import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, UserCredential, User } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { Game } from './api';


const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Define types for collections
export interface GameCollection {
    id: string;
    name: string;
    description: string;
    games: Game[];
    userId: string;
    createdAt: number;
    updatedAt: number;
}

export interface UserProfile {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    createdAt: number;
}

// Authentication functions
export const signInWithGoogle = (): Promise<UserCredential> => {
    return signInWithPopup(auth, googleProvider);
};

export const logOut = (): Promise<void> => {
    return signOut(auth);
};

// Get current user
export const getCurrentUser = (): User | null => {
    return auth.currentUser;
};

// User profile functions
export const createUserProfile = async (user: User): Promise<void> => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        const userProfile: UserProfile = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: Date.now()
        };
        
        await setDoc(userRef, userProfile);
    }
};

// Collection functions
export const getUserCollections = async (userId: string): Promise<GameCollection[]> => {
    const collectionsQuery = query(collection(db, 'collections'), where('userId', '==', userId));
    const querySnapshot = await getDocs(collectionsQuery);
    
    const collections: GameCollection[] = [];
    querySnapshot.forEach((doc) => {
        collections.push(doc.data() as GameCollection);
    });
    
    return collections;
};

export const createCollection = async (collection: Omit<GameCollection, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const collectionRef = doc(collection(db, 'collections'));
    const newCollection: GameCollection = {
    ...collection,
    id: collectionRef.id,
    createdAt: Date.now(),
    updatedAt: Date.now()
    };
    
    await setDoc(collectionRef, newCollection);
    return collectionRef.id;
};

export const updateCollection = async (collectionId: string, data: Partial<GameCollection>): Promise<void> => {
    const collectionRef = doc(db, 'collections', collectionId);
    await updateDoc(collectionRef, {
        ...data,
        updatedAt: Date.now()
    });
};

export const deleteCollection = async (collectionId: string): Promise<void> => {
    const collectionRef = doc(db, 'collections', collectionId);
    await deleteDoc(collectionRef);
};

export const addGameToCollection = async (collectionId: string, game: Game): Promise<void> => {
    const collectionRef = doc(db, 'collections', collectionId);
    const collectionSnap = await getDoc(collectionRef);
    
    if (collectionSnap.exists()) {
        const collection = collectionSnap.data() as GameCollection;
        const games = collection.games || [];
        
        // Check if game already exists in collection
        const gameExists = games.some(g => g.id === game.id);
        
        if (!gameExists) {
        await updateDoc(collectionRef, {
            games: [...games, game],
            updatedAt: Date.now()
        });
        }
    }
};

export const removeGameFromCollection = async (collectionId: string, gameId: number): Promise<void> => {
    const collectionRef = doc(db, 'collections', collectionId);
    const collectionSnap = await getDoc(collectionRef);
    
    if (collectionSnap.exists()) {
        const collection = collectionSnap.data() as GameCollection;
        const updatedGames = collection.games.filter(game => game.id !== gameId);
        
        await updateDoc(collectionRef, {
        games: updatedGames,
        updatedAt: Date.now()
        });
    }
};

export { auth, db };