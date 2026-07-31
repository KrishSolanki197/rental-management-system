

import strict from 'node:assert/strict';
import { string, z } from 'zod';
import { required } from 'zod/mini';

// Regex explanations kept close to the rule they enforce, for learning purposes.
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/; // letters, numbers, underscore only
const PASSWORD_UPPERCASE_REGEX = /[A-Z]/;
const PASSWORD_LOWERCASE_REGEX = /[a-z]/;
const PASSWORD_NUMBER_REGEX = /[0-9]/;
const PASSWORD_SPECIAL_CHAR_REGEX = /[^A-Za-z0-9]/;


export const registrationUser = z.object({
    username: z
        .string("username is invalid")
        .min(6, "Username must be contain at least 3 characters")
        .max(12, "Username must be contain at most 20 characters")
        .regex(USERNAME_REGEX, "Username can contain only letters, numbers and underscores"),

    email: z
        .string("email is invalid")
        .email("invalid email address"),

    password: z
        .string('password is invalid')
        .min(8, 'password should be atleast 8 characters')
        .regex(PASSWORD_LOWERCASE_REGEX, 'password must contain atleast one lowercase letter')
        .regex(PASSWORD_UPPERCASE_REGEX, 'password must contain atleast one uppercase letter')
        .regex(PASSWORD_NUMBER_REGEX, 'password must contain atleast one number')
        .regex(PASSWORD_SPECIAL_CHAR_REGEX, 'password must contain atleast one special character'),

    first_name: z
        .string('first name is invalid')
        .min(3, 'first name is required')
        .max(20, 'first name is too long'),
    
    last_name: z
        .string("last name is invalid")
        .min(3, 'last name is required')
        .max(20, 'lsdt name is too long'),
})
 

export type RegisterInput = z.infer<typeof registrationUser>;