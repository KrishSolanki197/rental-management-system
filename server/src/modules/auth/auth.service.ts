import { string, success, unknown } from "zod";
import prisma from "../../config/prisma.js";
import type { RegisterInput, loginInput } from "./auth.validation.js";
import bcrypt from "bcrypt";
import { registerAlert, 
  loginAlert} from "../../utils/mail.js";

export class UserNameAlreadyExist extends Error {
  constructor() {
    super("Username is already exists");
    this.name = "UserNameAlreadyExist";
  }
}

export class EmailExistance extends Error {
  constructor(message = "Email is already exists") {
    super(message);
    this.name = "EmailExistances";
  }
}

export class DefaultRoleNotFound extends Error {
  constructor() {
    super("default role 'user' is not configured");
    this.name = "DefaultRoleNotFound";
  }
}

export class WrongCrendential extends Error {
  constructor() {
    super("incorrect password");
    this.name = "WrongCrendential";
  }
}

export interface userResponse {
  user_id: bigint;
  username: string;
  email: string;
}

const DEFAULT_ROLE_NAME = "user";

export async function registerUser(
  input: RegisterInput,
): Promise<userResponse | unknown> {
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
  if (emailExists) throw new EmailExistance();

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

    const { password_hash: string, ...safe_user } = user;

    await registerAlert(safe_user.email, first_name, last_name);
    return {
      ...safe_user,
      user_id: safe_user.user_id.toString(),
    };
  } catch (error: unknown) {
    return error;
  }
}

export async function loginUser(input: loginInput): Promise<userResponse | unknown> {
  try {
    const { email, password } = input;
    const emailExists = await prisma.users.findFirst({
      where: {
        email,
      },
      select: {
        user_id: true,
        password_hash: true,
      },
    });

    if (emailExists == null) throw new EmailExistance("email does not exists");

    let match_password: boolean = false;
    if (emailExists.password_hash !== null) {
      match_password = await bcrypt.compare(
        password,
        emailExists?.password_hash,
      );
      if (!match_password) throw new WrongCrendential();
    }

    const user = await prisma.users.update({
      where: {
        user_id: emailExists.user_id,
      },
      data: {
        last_login_at: new Date(),
      },
    });

    await loginAlert(user.email, user.username);

    const { password_hash: string, ...safeUser } = user;

    return {
      ...safeUser,
      user_id: safeUser.user_id.toString()
    };
  } catch (error: unknown) {
    return error;
  }
}
