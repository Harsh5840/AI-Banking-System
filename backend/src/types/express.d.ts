// types/express/index.d.ts

export {};

import { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface User {
      id: string;
      role: Role;
      email?: string;
      [key: string]: any;
    }

    interface Request {
      user?: User;
    }
  }
}
