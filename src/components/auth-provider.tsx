"use client";

import React, { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import type { UserProfile } from '@/lib/definitions';
import Cookies from 'js-cookie';
import { auth, db } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("[AuthProvider] Initializing auth listener...");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("[AuthProvider] Auth state changed:", user ? `User: ${user.uid}` : "No user");
      setLoading(true);
      if (user) {
        setUser(user);
        try {
          console.log("[AuthProvider] Fetching user profile from Firestore...");
          let userProfile: UserProfile | null = null;
          
          // Try to find by UID first
          let userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (!userDoc.exists()) {
            console.log("[AuthProvider] Not found by UID, searching by email...");
            // Search by email if not found by UID
            const q = query(collection(db, 'users'), where('correo', '==', user.email!));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
              userDoc = querySnapshot.docs[0];
              console.log("[AuthProvider] Found user by email");
            } else {
              // Try searching with 'email' field
              const q2 = query(collection(db, 'users'), where('email', '==', user.email!));
              const querySnapshot2 = await getDocs(q2);
              if (!querySnapshot2.empty) {
                userDoc = querySnapshot2.docs[0];
                console.log("[AuthProvider] Found user by email field");
              }
            }
          }
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            console.log("[AuthProvider] User profile found:", data);
            
            userProfile = {
              uid: user.uid,
              nombre: data.nombre || data.name || user.displayName || "Usuario",
              correo: data.correo || data.email || user.email || "",
              rol: data.rol || data.role || "cliente",
              imagen_perfil: data.imagen_perfil || data.profilePicture,
            };
            
            setUserProfile(userProfile);
          } else {
            console.log("[AuthProvider] No user profile in Firestore, creating from auth data");
            // Create a basic profile from auth data if document doesn't exist
            userProfile = {
              uid: user.uid,
              nombre: user.displayName || "Usuario",
              correo: user.email || "",
              rol: "cliente",
            };
            setUserProfile(userProfile);
          }
          const token = await user.getIdToken();
          Cookies.set('session', token, { expires: 1 });
          console.log("[AuthProvider] Session cookie set");
        } catch (error) {
            console.error("[AuthProvider] Error fetching user profile:", error);
            // Set a basic profile even if Firestore fails
            const userProfile: UserProfile = {
              uid: user.uid,
              nombre: user.displayName || "Usuario",
              correo: user.email || "",
              rol: "cliente",
            };
            setUserProfile(userProfile);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        Cookies.remove('session');
        console.log("[AuthProvider] User logged out");
      }
      console.log("[AuthProvider] Auth loading complete");
      setLoading(false);
    });

    return () => {
      console.log("[AuthProvider] Cleaning up auth listener");
      unsubscribe();
    };
  }, []);

  const value = { user, userProfile, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
