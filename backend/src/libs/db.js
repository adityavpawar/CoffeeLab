// import { prismaClient } from "../generated/prisma/index.js"

// const globalForPrisma  = globalThis;

// export const db = globalForPrisma || new prismaClient();

// if(process.env.NODE_ENV != "production") globalForPrisma = db


import pkg from "../generated/prisma/index.js";  // Import as default (CommonJS)
const { PrismaClient } = pkg;                   // Destructure PrismaClient

// Use a global instance to avoid creating multiple connections in dev
const globalForPrisma = globalThis;

export const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
