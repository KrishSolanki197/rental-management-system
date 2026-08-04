
export class UserNameAlreadyExist extends Error {
  constructor() {
    super("Username is already exists");
    this.name = "UserNameAlreadyExist";
  }
}

export class UserNotFound extends Error {
  constructor() {
    super("User not found");
    this.name = "UserNotFound";
  }
}

export class EmailExistance extends Error {
  constructor(message:string = "Email already exists") {
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

export class UnableToCreateOTP extends Error{
  constructor(message:string = "Fail to generate OTP"){
    super(message);
    this.name = "OTPNotCreated";
  }
}


export class PasswordNotFound extends Error{
    constructor(message:string){
        super(message);
        this.name = "PasswordNotFound";
    }
}

export class JWTNotFound extends Error{
  constructor(message:string){
    super(message);
    this.name = "JWTNotFound";
  }
}