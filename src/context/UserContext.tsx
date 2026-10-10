"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AccessLevel } from "@/types";

export interface UserProfileState {
  id: string;
  name: string;
  role: string;
  department: string;
  location: string;
}

export const DEMO_EMPLOYEES: UserProfileState[] = [
  {
    id: "user_001",
    name: "Naufal",
    role: "Backend Engineer",
    department: "Engineering",
    location: "Jakarta",
  },
  {
    id: "user_002",
    name: "Afif",
    role: "Product Designer",
    department: "Design",
    location: "Jakarta",
  },
];

export const HR_ADMIN_USER: UserProfileState = {
  id: "hr_admin_001",
  name: "HR Admin",
  role: "People Operations Lead",
  department: "People Operations",
  location: "Jakarta",
};

interface UserContextType {
  user: UserProfileState;
  inspectedEmployee: UserProfileState;
  availableEmployees: UserProfileState[];
  accessLevel: AccessLevel;
  isHRAdmin: boolean;
  setEmployee: (userId: string) => void;
  setInspectedEmployee: (userId: string) => void;
  toggleRole: () => void;
  setAccessLevel: (level: AccessLevel) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [accessLevel, setAccessLevelState] = useState<AccessLevel>("EMPLOYEE");
  const [activeEmployeeId, setActiveEmployeeId] = useState<string>("user_001");
  const [inspectedEmployeeId, setInspectedEmployeeId] = useState<string>("user_001");

  useEffect(() => {
    const savedLevel = localStorage.getItem("dayone_access_level") as AccessLevel;
    if (savedLevel === "EMPLOYEE" || savedLevel === "HR_ADMIN") {
      setAccessLevelState(savedLevel);
    }
    const savedEmployeeId = localStorage.getItem("dayone_active_employee");
    if (savedEmployeeId && DEMO_EMPLOYEES.some((e) => e.id === savedEmployeeId)) {
      setActiveEmployeeId(savedEmployeeId);
      setInspectedEmployeeId(savedEmployeeId);
    }
  }, []);

  const setAccessLevel = (level: AccessLevel) => {
    setAccessLevelState(level);
    localStorage.setItem("dayone_access_level", level);
  };

  const setEmployee = (userId: string) => {
    const found = DEMO_EMPLOYEES.find((e) => e.id === userId);
    if (found) {
      setActiveEmployeeId(found.id);
      setInspectedEmployeeId(found.id);
      setAccessLevel("EMPLOYEE");
      localStorage.setItem("dayone_active_employee", found.id);
    }
  };

  const setInspectedEmployee = (userId: string) => {
    const found = DEMO_EMPLOYEES.find((e) => e.id === userId);
    if (found) {
      setInspectedEmployeeId(found.id);
    }
  };

  const toggleRole = () => {
    const next = accessLevel === "EMPLOYEE" ? "HR_ADMIN" : "EMPLOYEE";
    setAccessLevel(next);
  };

  const isHRAdmin = accessLevel === "HR_ADMIN" || accessLevel === "SYSTEM";

  const currentEmployee =
    DEMO_EMPLOYEES.find((e) => e.id === activeEmployeeId) || DEMO_EMPLOYEES[0];
  const inspectedEmployee =
    DEMO_EMPLOYEES.find((e) => e.id === inspectedEmployeeId) || DEMO_EMPLOYEES[0];

  const user = isHRAdmin ? HR_ADMIN_USER : currentEmployee;

  return (
    <UserContext.Provider
      value={{
        user,
        inspectedEmployee,
        availableEmployees: DEMO_EMPLOYEES,
        accessLevel,
        isHRAdmin,
        setEmployee,
        setInspectedEmployee,
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
