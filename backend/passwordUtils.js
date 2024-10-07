import crypto from "crypto";

// generate password hash, returns salt and hash (sha256)
function generatePasswordHash(password) {
    let salt = crypto.randomBytes(32).toString("hex");
    let genHash = crypto
        .pbkdf2Sync(password, salt, 10000, 64, "sha512")
        .toString("hex");

    return {
        salt: salt,
        hash: genHash,
    };
}

// check if the entered password matches the hashed password given salt from user profile
function validatePassword(password, hash, salt) {
    let hashVerify = crypto
        .pbkdf2Sync(password, salt, 10000, 64, "sha512")
        .toString("hex");
    return hash === hashVerify;
}

export { generatePasswordHash, validatePassword };
