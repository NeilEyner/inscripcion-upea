import postgres from "postgres";

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error("DATABASE_URL no está definida en las variables de entorno.");
}

// Singleton para evitar múltiples conexiones en desarrollo (hot-reload de Next.js)
const globalForDb = globalThis as unknown as { db: ReturnType<typeof postgres> };

export const db =
  globalForDb.db ??
  postgres(connectionString, {
    max: 10,             // máximo de conexiones en el pool
    idle_timeout: 30,    // segundos antes de cerrar una conexión inactiva
    connect_timeout: 10, // segundos máximo para establecer conexión
    transform: {
      // Convierte snake_case de Postgres a camelCase en JS automáticamente
      column: postgres.toCamel,
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
}