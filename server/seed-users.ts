import { db } from "./db";
import { users } from "@shared/schema";
import bcrypt from "bcryptjs";

export async function seedUsers() {
  try {
    // Verificar si ya existen usuarios
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      console.log("Users already exist, skipping seed");
      return;
    }

    // Crear usuarios de prueba
    const testUsers = [
      {
        username: "admin",
        email: "admin@gcelectric.us",
        password: await bcrypt.hash("admin123", 10),
        fullName: "Carlos Mendoza",
        role: "manager" as const,
        isActive: true,
      },
      {
        username: "supervisor",
        email: "supervisor@gcelectric.us", 
        password: await bcrypt.hash("super123", 10),
        fullName: "María González",
        role: "manager" as const,
        isActive: true,
      },
      {
        username: "trabajador",
        email: "trabajador@gcelectric.us",
        password: await bcrypt.hash("trabajo123", 10),
        fullName: "José Rodríguez",
        role: "crew" as const,
        isActive: true,
      }
    ];

    for (const user of testUsers) {
      await db.insert(users).values(user);
    }

    console.log("✅ Test users created successfully:");
    console.log("👨‍💼 Admin: admin / admin123");
    console.log("👩‍💼 Supervisor: supervisor / super123");
    console.log("👷‍♂️ Trabajador: trabajador / trabajo123");
    
  } catch (error) {
    console.error("Error creating test users:", error);
    // Continue despite user creation errors to prevent deployment failure
    console.log("Continuing despite user creation error...");
  }
}