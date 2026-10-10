"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AccessLevel } from "@/types";

interface UserProfileState {
  id: string;
  name: string;
  role: string;
  department: string;
  location: string;
}

interface UserContextType {
  user: UserProfileState;
  accessLevel: AccessLevel;
  isHRAdmin: boolean;
  toggleRole: () => void;
  setAccessLevel: (level: AccessLevel) => void;
}

const DEFAULT_USER: UserProfileState = {
  id: "user_001",
  name: "Naufal",
  role: "Backend Engineer",
  department: "Engineering",
  location: "Jakarta",
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user] = useState<UserProfileState>(DEFAULT_USER);
  const [accessLevel, setAccessLevelState] = useState<AccessLevel>("EMPLOYEE");

  useEffect(() => {
    const savedLevel = localStorage.getItem("dayone_access_level") as AccessLevel;
    if (savedLevel === "EMPLOYEE" || savedLevel === "HR_ADMIN") {
      setAccessLevelState(savedLevel);
    }
  }, []);

  const setAccessLevel = (level: AccessLevel) => {
    setAccessLevelState(level);
    localStorage.setItem("dayone_access_level", level);
  };

  const toggleRole = () => {
    const next = accessLevel === "EMPLOYEE" ? "HR_ADMIN" : "EMPLOYEE";
    setAccessLevel(next);
  };

  const isHRAdmin = accessLevel === "HR_ADMIN" || accessLevel === "SYSTEM";

  return (
    <UserContext.Provider
      value={{
        user,
        accessLevel,
        isHRAdmin,
        toggleRole,
        setAccessLevel,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
