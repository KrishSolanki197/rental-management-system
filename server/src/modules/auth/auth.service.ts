


import { object } from "zod";
import prisma from "../../config/prisma.js";
import type { RegisterInput } from "./auth.validation.js";
import bcrypt from "bcrypt";

export class UserNameAlreadyExist extends Error {
  constructor() {
    super("Username is already exists");
    this.name = "UserNameAlreadyExist";
  }
}

export class EmailAlreadyExist extends Error {
  constructor() {
    super("Email is already exists");
    this.name = "EmailAlreadyExists";
  }
}

export class DefaultRoleNotFound extends Error {
  constructor() {
    super("default role 'user' is not configured");
    this.name = "DefaultRoleNotFound";
  }
}

export interface RegisterUser {
  user_id: bigint;
  username: string;
  email: string;
}

const DEFAULT_ROLE_NAME = "user";

export async function registerUser(
  input: RegisterInput,
): Promise<RegisterUser | unknown> {
  const { username, email, password, first_name, last_name } = input;

  const usernameExists = await prisma.users.findUnique({
    where: {
      username,
    },
    select: {
      user_id: true,
    },
  });

  if (usernameExists) throw new UserNameAlreadyExist();
  const emailExists = await prisma.users.findUnique({
    where: {
      email,
    },
    select: {
      user_id: true,
    },
  });
  if (emailExists) throw new EmailAlreadyExist();

  const roleExists = await prisma.roles.findUnique({
    where: {
      role_name: DEFAULT_ROLE_NAME,
    },
    select: {
      role_id: true,
    },
  });
  if (!roleExists) throw new DefaultRoleNotFound();

  const password_hash: string = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.$transaction(async (tx) => {
      const _user = await tx.users.create({
        data: {
          username,
          email,
          password_hash,
        },
      });

      await tx.profiles.create({
        data: {
          user_id: _user.user_id,
          first_name,
          last_name,
        },
      });

      await tx.customers.create({
        data: {
          user_id: _user.user_id,
        },
      });

      await tx.user_roles.create({
        data: {
          user_id: _user.user_id,
          role_id: roleExists.role_id,
        },
      });
      return _user;
    });

    const { password_hash:string, ...safe_user } = user;
    return safe_user;

  } catch (error: unknown) {
    return error;
  }
}
