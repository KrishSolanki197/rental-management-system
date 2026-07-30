// libraries
import prisma from "../../config/prisma.js";
import bcrypt from "bcrypt";

// utils functions
import send_register_mail from "../../utils/mail.js";

// custom types
import type { RegisterUserInput } from "../../types/User.js";
import type { ResponseType } from "../../types/ResponseType.js";
// prisma generate type for its each reletions
import type { users } from "@prisma/client";

/**
 *
 * @param payload
 * @returns
 * @description this is method is return the user detail if the new user was created
 *
 * 1. Get Payload
 * 2. Verify Payload data
 * 3. Check User Exist Already, If yes then return "user already exists"
 * 4. generate password hash
 * 5. save the user data
 * 6. new token for that user
 * 7. send mail to the user
 * 8. send details to the client
 */
export const registerUser = async (payload: RegisterUserInput): Promise<ResponseType> => {
  try {
    // destructure the paylaod 
    const { username, firstname, lastname, phone, email, password } = payload;

    // check for the user email 
    const userExist: users | null = await prisma.users.findUnique({
        where: {
            email
        },
    });
    if (userExist) throw new Error("user already exists");
    
    // check for the username 
    const usernameExists: users | null = await prisma.users.findUnique({
        where: {
            username
        },
    });
    if (usernameExists) throw new Error("username already exists");
    
    // hash the password
    const hashed_password = await bcrypt.hash(password, 10);

    // create user 
    const user: users = await prisma.$transaction(async (tx) => {
      const _user = await tx.users.create({
        data: {
          username,
          phone,
          email,
          password_hash: hashed_password,
          
        },
      });

      await tx.customers.create({
        data: {
          user_id: _user.user_id,
          first_name: firstname,
          last_name: lastname,
          
        },
      });

      const role = await tx.roles.findUnique({
        where: {
          role_name: "CUSTOMER",
        },
      });

      if (!role) {
        throw new Error("CUSTOMER role not found!");
      }

      await tx.user_roles.create({
        data: {
          user_id: _user.user_id,
          role_id: role.role_id,
        },
      });
      return { ..._user };
    });

    // send email to tell that the new user create using this mail 
    try {
        await send_register_mail(email);
    }catch(error){
        console.error(error);
    }

    const { password_hash, ...safeUser} = user;

    return {
      success: true,
      message: "User is saved",
      data: safeUser
    };

  } catch (error:any) {
    return {
      success: false,
      message: error.message,
      data: {},
    };
  }
};
