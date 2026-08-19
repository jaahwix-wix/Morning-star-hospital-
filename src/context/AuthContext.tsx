import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  activeRole: UserRole;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo staff identities for easy role testing without forcing account switching
export const DEMO_PROFILES: Record<UserRole, UserProfile> = {
  doctor: {
    userId: 'demo-doctor-01',
    name: 'Dr. Alusine Koroma',
    email: 'a.koroma@morningstarhospital.sl',
    role: 'doctor',
    phone: '+232 73 929 145',
    department: 'Chief Medical Officer / Emergency Surgery',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
  },
  lab_tech: {
    userId: 'demo-lab-01',
    name: 'Sister Mariama Bah',
    email: 'm.bah@morningstarhospital.sl',
    role: 'lab_tech',
    phone: '+232 78 355 293',
    department: 'Lead Medical Laboratory Scientist / Diagnostics',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813695-15a999df1936?w=150&auto=format&fit=crop&q=80'
  },
  nurse: {
    userId: 'demo-nurse-01',
    name: 'Nurse Fatmata Sesay',
    email: 'f.sesay@morningstarhospital.sl',
    role: 'nurse',
    phone: '+232 73 929 145',
    department: 'Head of 24/7 Triage & Critical Care',
    avatarUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=150&auto=format&fit=crop&q=80'
  },
  admin: {
    userId: 'demo-admin-01',
    name: 'Hospital Director Dr. J. Bangura',
    email: 'director@morningstarhospital.sl',
    role: 'admin',
    phone: '+232 78 355 293',
    department: 'Hospital Administration & Quality Care',
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80'
  },
  patient: {
    userId: 'demo-patient-01',
    name: 'Samuel Kamara',
    email: 's.kamara@example.com',
    role: 'patient',
    phone: '+232 76 412 889',
    department: 'Inpatient (ICU-02)',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(DEMO_PROFILES.doctor);
  const [activeRole, setActiveRole] = useState<UserRole>('doctor');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const data = userSnap.data() as UserProfile;
            setUserProfile(data);
            setActiveRole(data.role || 'doctor');
          } else {
            // New user registration in Firestore
            const newProfile: UserProfile = {
              userId: user.uid,
              name: user.displayName || 'Medical Staff Member',
              email: user.email || '',
              role: 'doctor',
              phone: '+232 73 929 145',
              department: 'General Clinical Care',
              avatarUrl: user.photoURL || undefined,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
            setActiveRole('doctor');
          }
        } catch (err) {
          console.warn('Could not sync user profile with Firestore, using default profile:', err);
          // Fallback to default doctor profile
          setUserProfile(DEMO_PROFILES.doctor);
        }
      } else {
        // Keep default demo profile active for seamless UX preview
        setUserProfile(DEMO_PROFILES[activeRole]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeRole]);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      // If popup fails or is blocked in iframe, keep demo profile working
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
      setCurrentUser(null);
      setUserProfile(DEMO_PROFILES[activeRole]);
    } catch (err) {
      console.error('Sign Out error:', err);
    }
  };

  const switchRole = (role: UserRole) => {
    setActiveRole(role);
    setUserProfile(DEMO_PROFILES[role]);
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!userProfile) return;
    const updated = { ...userProfile, ...data, updatedAt: new Date().toISOString() };
    setUserProfile(updated);
    if (currentUser) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), updated, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        activeRole,
        signInWithGoogle,
        signOut,
        switchRole,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
