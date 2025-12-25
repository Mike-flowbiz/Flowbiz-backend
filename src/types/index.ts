// Shared types that can be used in both client and server components
// This avoids importing from @prisma/client in client components

export enum UserRole {
  ADMIN = 'ADMIN',
  CONTRACTOR = 'CONTRACTOR',
  CLIENT = 'CLIENT',
}

