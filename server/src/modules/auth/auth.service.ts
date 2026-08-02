import prisma from "../../config/prisma.js";
import type { RegisterInput, loginInput } from "./auth.validation.js";
import bcrypt from "bcrypt";
import { generateToken } from "../../utils/token.js";
import type { users } from "@prisma/client";
import { OTPEmail } from "../../utils/mail.js";

export class UserNameAlreadyExist extends Error {
  constructor() {
    super("Username is already exists");
    this.name = "UserNameAlreadyExist";
  }
}

export class UserNotFound extends Error{
  constructor(){
    super("User not found");
    this.name = "UserNotFound";
  }
}

export class EmailExistance extends Error {
  constructor(message = "Email already exists") {
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
const DEFAULT_ROLE_NAME = "user";

// Omit <Type, Keys> & { New Type of Keys }
export type registerUserResponse = Omit<users, "user_id" | "password_hash"> & {
  user_id: string
}

// register user
export async function registerUser(input: RegisterInput): Promise<registerUserResponse> {
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

    return {
      ...safe_user,
      user_id: safe_user.user_id.toString(),
    };
  } catch (error) {
    throw error;
  }
}

// Omit <Type, Keys> & { New Type of Keys }
export type loginUserReponse = Omit<users, "user_id" | "password_hash"> & {
  user_id: string | bigint;
  token: string;
};

// login user
export async function loginUser(input: loginInput): Promise<loginUserReponse> {
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

    const token = await generateToken(
      user.user_id.toString(),
      user.username,
      user.email,
    );

    const { password_hash, ...safeUser } = user;

    return {
      ...safeUser,
      user_id: safeUser.user_id.toString(),
      token,
    };
  } catch (error) {
    throw error;
  }
}


export async function forgetPassword(email: string): Promise<string> {
  /* One Transaction to do the all task
     1. Check Email already exists?
     2. Store OTP into the user table 
     3. Send the OTP into the email
     4. Send the response
  */
  const user = prisma.$transaction(async (tx):Promise<users> =>{

    // Veify the user existance into the database and select user_id for further use 
    const _user_record = await tx.users.findUnique({
      where: {
        email
      }
    });

    // throw an error if user not exits
    if(!_user_record) throw new UserNotFound();
    
    // OTP Generate and Store to the database
    const otp_code:string = (100000 + Math.random() * 900000).toString();
    await tx.user_otp.create({
      data:{
        user_id: _user_record?.user_id,
        otp_code: otp_code,
        purpose: "email_verification",
        used_at: null,
        expire_at: new Date(Date.now() + 10 * 60 * 1000)
      }
    });  
    return _user_record;  
  })

 
  console.log(user)

  return "check console"
}