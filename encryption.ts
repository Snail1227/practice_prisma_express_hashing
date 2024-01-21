import bcrypt from "bcrypt";

const saltRounds = 11;


export const encryptPassword = (password: string) => {
    return bcrypt.hash(password, saltRounds);
}

export const passwordValidation  = (password: string, userPassword: string) => {
    return bcrypt.compare(password, userPassword)
}

