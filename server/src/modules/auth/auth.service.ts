import prisma from "../../config/prisma.js";
import type {
  RegisterInput,
  loginInput,
  emailInput,
  passwordInput,
  verifyEmailInput,
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
  PasswordNotFound,
  OTPErrors,
} from "./auth.errors.js";
import { date } from "zod";

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

export async function EmailVerify(input: verifyEmailInput): Promise<string> {

  const { email, otp } = input;

  const response = await prisma.$transaction(async (tx) => {
    const user = await tx.users.findFirst({
      where: {
        email,
      },
      select: {
        user_id: true,
        user_otp: true,
      },
    });

    if (user?.user_id === undefined) {
      throw new UserNotFound();
    }

    const user_otp = await tx.user_otp.findFirst({
      where: {
        user_id: user.user_id,
      },
      select: {
        otp_id: true,
        otp_code: true,
        expire_at: true,
        purpose: true,
      },
    });

    // confirm the receive of the user_otp data from the databse
    if (!user_otp) {
      throw new OTPErrors("Cannot retrives the OTP", "OTP_RETRIVAL_ISSUE");
    }

    if(user_otp.purpose !== "email_verification"){
      throw new OTPErrors("OTP Purpose is wrong", "WRONG_PURPOSE_OTP_RECEIVED");
    }

    // confirm the code is same as database have
    if (otp !== user_otp.otp_code) {
      throw new OTPErrors("OTP is incorrect", "INCORRECT_OTP");
    }

    // verify that the otp code is expired ?
    if (user_otp.expire_at < new Date(Date.now())) {
      throw new OTPErrors("OTP is expired", "OTP_EXPIRED");
    }

    await tx.users.update({
      where: {
        user_id: user.user_id,
      },
      data: {
        email_verified: true,
      },
    });

    return user;
  });

  if(!response){
    return "Email is not verified"
  }

  return "Email is verified";
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

    if (!emailExists.password_hash) {
      throw new WrongCrendential("unable to fetch password from the server");
    }

    let match_password: boolean = await bcrypt.compare(
      password,
      emailExists.password_hash,
    );

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
  user_id: bigint,
): Promise<string> {
  // getting the passwords
  const { old_password, new_password } = passwords;
  if (!old_password) throw new PasswordNotFound("Old password is missing");
  if (!new_password) throw new PasswordNotFound("New password is missing");

  const response = await prisma.$transaction(async (tx) => {
    // finding the user based on the user_id
    const user = await tx.users.findFirst({
      where: {
        user_id,
      },
      select: {
        user_id: true,
        password_hash: true,
      },
    });

    if (user?.password_hash == undefined) {
      throw new PasswordNotFound(
        `unable to fetch the password from the server!', ${user?.user_id}, ${user?.password_hash}`,
      );
    }

    const match_password: boolean = await bcrypt.compare(
      old_password,
      user.password_hash,
    );

    if (!match_password) {
      throw new PasswordNotFound("old password is incorrect");
    }

    const password_hash: string = await bcrypt.hash(new_password, 10);

    await tx.users.update({
      where: {
        user_id: user.user_id,
      },
      data: {
        password_hash,
      },
    });
    return user;
  });

  if (response.user_id === undefined) {
    return "password is not changed";
  }

  return "password are changed";
}
