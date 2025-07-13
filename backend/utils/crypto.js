const crypto = require('crypto');

// Generate a random AES key
const generateAESKey = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Encrypt data using AES-256-CBC (new format)
const aesEncrypt = (key, plaintext) => {
    try {
        const keyBytes = Buffer.from(key, 'hex');
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', keyBytes, iv);
        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        // Store IV with encrypted data (iv:encrypted)
        return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
        throw new Error('Encryption failed: ' + error.message);
    }
};

// Decrypt data (supports both old CFB and new CBC formats)
const aesDecrypt = (key, ciphertext) => {
    try {
        const keyBytes = Buffer.from(key, 'hex');

        if (ciphertext.includes(':')) {
            // New format: AES-256-CBC with iv:encrypted
            const [ivHex, encryptedData] = ciphertext.split(':');
            const iv = Buffer.from(ivHex, 'hex');
            const decipher = crypto.createDecipheriv('aes-256-cbc', keyBytes, iv);
            let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } else {
            // Old format: AES-256-CFB, first 32 hex chars = IV, rest = encrypted
            const iv = Buffer.from(ciphertext.substring(0, 32), 'hex');
            const encryptedData = Buffer.from(ciphertext.substring(32), 'hex');
            const decipher = crypto.createDecipheriv('aes-256-cfb', keyBytes, iv);
            let decrypted = decipher.update(encryptedData, null, 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }
    } catch (error) {
        throw new Error('Decryption failed: ' + error.message);
    }
};

// Generate SHA-256 hash (current implementation)
const sha256Hash = (data) => {
    return crypto.createHash('sha256').update(data).digest('hex');
};

// Old SHA-256 hashing function (fallback for legacy passwords)
const oldSha256Hash = (data) => {
    const sha256 = crypto.createHash('sha256');
    sha256.update(data);
    return sha256.digest('hex');
};

// Generate a random OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash password using bcrypt-like approach with SHA-256 and salt
const hashPassword = (password) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
    return `${salt}:${hash}`;
};

// Verify password (current implementation)
const verifyPassword = (password, hashedPassword) => {
    const [salt, hash] = hashedPassword.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
    return hash === verifyHash;
};

// Fallback password verification that supports both old and new formats
const verifyPasswordWithFallback = (password, hashedPassword) => {
    try {
        // First, try the current format (salt:hash)
        if (hashedPassword.includes(':')) {
            const result = verifyPassword(password, hashedPassword);
            if (result) {
                console.log('Password verified using current format (salt:hash)');
            }
            return result;
        }

        // If no colon, it's the old SHA-256 format
        const oldHash = oldSha256Hash(password);
        const result = oldHash === hashedPassword;
        if (result) {
            console.log('Password verified using legacy SHA-256 format');
        }
        return result;
    } catch (error) {
        console.error('Password verification error:', error);
        return false;
    }
};

// Migrate old SHA-256 password to new format
const migrateOldPassword = (password) => {
    return hashPassword(password);
};

// Check if password is in old format
const isOldPasswordFormat = (hashedPassword) => {
    return !hashedPassword.includes(':');
};

module.exports = {
    generateAESKey,
    aesEncrypt,
    aesDecrypt,
    sha256Hash,
    oldSha256Hash,
    generateOTP,
    hashPassword,
    verifyPassword,
    verifyPasswordWithFallback,
    migrateOldPassword,
    isOldPasswordFormat
}; 