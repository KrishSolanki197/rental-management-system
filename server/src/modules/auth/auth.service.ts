import prisma from "../../config/prisma.js";
import type {
  RegisterInput,
  loginInput,
  emailInput,
  passwordInput,
} from "./auth.validation.js";
import bcrypt from "bcrypt";
import { generateToken } from "../../utils/token.js";
import type { users } from "@prisma/client";
import { OTPEmail } from "../../utils/mail.js";
import {
  UserNameAlreadyExist,
  UserNotFound,
  EmailExistance,
  DefaultRoleNotFound,
  WrongCrendential,
  UnableToCreateOTP,
  PasswordNotFound
} from "./auth.errors.js";

const DEFAULT_ROLE_NAME = "user";

// Omit <Type, Keys> & { New Type of Keys }
export type registerUserResponse = Omit<users, "user_id" | "password_hash"> & {
  user_id: string;
};

// register user
export async function registerUser(
  input: RegisterInput,
): Promise<registerUserResponse> {
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

/* One Transaction to do the all task
     1. Check Email already exists?
     2. Store OTP into the user table 
     3. Send the OTP into the email
     4. Send the response
  */
export async function forgetPassword(
  email: emailInput,
): Promise<{ email: string }> {
  const user = await prisma.$transaction(async (tx): Promise<users> => {
    // Veify the user existance into the database and select user_id for further use
    const _user_record = await tx.users.findUnique({
      where: {
        email,
      },
    });

    // throw an error if user not exits
    if (!_user_record) throw new UserNotFound();

    // OTP Generate and Store to the database
    const otp_code: string = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    // create otp rows for the user
    await tx.user_otp.create({
      data: {
        user_id: _user_record?.user_id,
        otp_code: otp_code,
        purpose: "email_verification",
        used_at: null,
        expire_at: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await OTPEmail(
      _user_record.username,
      _user_record.email,
      otp_code,
      "OTP Verifications Email",
    );

    return _user_record;
  });

  if (!user) {
    throw new UnableToCreateOTP();
  }

  return {
    email: user.email,
  };
}

/**
 * get a token (verify middlewares)
 * get old and new pass (verify zod)
 * get a user based on token (findUnique)
 * compare password_hash is same as req.body.old_password (bcrypt.compare)
 * if old password is correct set new_password's hash as current password
 * return acknowledement
 */

export async function changePassword(
  passwords: passwordInput,
): Promise<string> {

  // getting the passwords 
  const { old_password, new_password } = passwords;
  if(!old_password) throw new PasswordNotFound('Old password is missing');
  if(!new_password) throw new PasswordNotFound('New password is missing');

  const old_password_hash = await bcrypt.hash(old_password, 10);
  const response = await prisma.$transaction(async (tx)=>{

    // finding the user based on the
    const user = await tx.users.findFirst({
      where:{
        user_id: 1
      },
      select:{
        user_id: true,
        password_hash: true
      }
    });

    





  })

  return "the password are changed";
}
