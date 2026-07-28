

import type { JsonObject } from "@prisma/client/runtime/library";
import prisma from "../../config/prisma.js";
import sendregistationmail from "../../utils/mail.js";
import type { RegisterUserInput, User } from "../../types/User.js";
import type { ResponseType } from "../../types/ResponseType.js";
import bcrypt from 'bcrypt';

export const registerUser = async (payload: RegisterUserInput): Promise<ResponseType> => {

    const {
        username, 
        firstname, lastname,
        phone, email, password
    }  = payload; 

    const password_hash = await bcrypt.hash(password, 10);

    const user:RegisterUserInput = await prisma.$transaction(async (tx)=>{
        const _user = await tx.users.create({
            data:{
                username, phone, email, password_hash
            },
        })

        await tx.customers.create({
            data:{
                user_id: _user.user_id,
                first_name: firstname,
                last_name: lastname
            }
        })

        await tx.user_roles.create({
            data:{
                user_id: _user.user_id,
                role_id: 5
            }
        })

        return { ..._user }
    })



    return {
        success: true,
        message: "User is saved",
        data: {
            username: user.username,

        }
    }
    
};
