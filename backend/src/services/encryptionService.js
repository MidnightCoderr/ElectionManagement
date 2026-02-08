const crypto = require('crypto');

/**
 * Encryption Utilities for Vote Data
 * AES-256-GCM encryption for sensitive data
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

class EncryptionService {
    constructor() {
        this.masterKey = process.env.ENCRYPTION_MASTER_KEY;
        if (!this.masterKey) {
            throw new Error('ENCRYPTION_MASTER_KEY not set in environment');
        }
    }

    /**
     * Derive encryption key from password using PBKDF2
     */
    deriveKey(password, salt) {
        return crypto.pbkdf2Sync(
            password,
            salt,
            ITERATIONS,
            KEY_LENGTH,
            'sha512'
        );
    }

    /**
     * Encrypt data with AES-256-GCM
     * @param {string} plaintext - Data to encrypt
     * @param {string} password - Encryption password (optional, uses master key if not provided)
     * @returns {object} Encrypted data with IV, salt, and tag
     */
    encrypt(plaintext, password = null) {
        try {
            // Generate random salt and IV
            const salt = crypto.randomBytes(SALT_LENGTH);
            const iv = crypto.randomBytes(IV_LENGTH);

            // Derive key
            const key = this.deriveKey(password || this.masterKey, salt);

            // Create cipher
            const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

            // Encrypt
            let encrypted = cipher.update(plaintext, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            // Get authentication tag
            const tag = cipher.getAuthTag();

            return {
                encrypted,
                iv: iv.toString('hex'),
                salt: salt.toString('hex'),
                tag: tag.toString('hex'),
                algorithm: ALGORITHM,
            };
        } catch (error) {
            throw new Error(`Encryption failed: ${error.message}`);
        }
    }

    /**
     * Decrypt AES-256-GCM encrypted data
     * @param {object} encryptedData - Object containing encrypted, iv, salt, tag
     * @param {string} password - Decryption password (optional)
     * @returns {string} Decrypted plaintext
     */
    decrypt(encryptedData, password = null) {
        try {
            const { encrypted, iv, salt, tag } = encryptedData;

            // Derive same key
            const key = this.deriveKey(
                password || this.masterKey,
                Buffer.from(salt, 'hex')
            );

            // Create decipher
            const decipher = crypto.createDecipheriv(
                ALGORITHM,
                key,
                Buffer.from(iv, 'hex')
            );

            // Set authentication tag
            decipher.setAuthTag(Buffer.from(tag, 'hex'));

            // Decrypt
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error) {
            throw new Error(`Decryption failed: ${error.message}`);
        }
    }

    /**
     * Encrypt vote data for blockchain storage
     * Vote data is encrypted with election-specific key
     */
    encryptVoteData(voteData, electionId) {
        const electionKey = this.deriveElectionKey(electionId);
        const plaintext = JSON.stringify(voteData);
        return this.encrypt(plaintext, electionKey.toString('hex'));
    }

    /**
     * Decrypt vote data from blockchain
     */
    decryptVoteData(encryptedData, electionId) {
        const electionKey = this.deriveElectionKey(electionId);
        const decrypted = this.decrypt(encryptedData, electionKey.toString('hex'));
        return JSON.parse(decrypted);
    }

    /**
     * Derive election-specific encryption key
     */
    deriveElectionKey(electionId) {
        return crypto.pbkdf2Sync(
            this.masterKey,
            `election:${electionId}`,
            ITERATIONS,
            KEY_LENGTH,
            'sha512'
        );
    }

    /**
     * Generate secure random token
     */
    generateToken(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }

    /**
     * Hash data with SHA-256
     */
    hash(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    /**
     * Hash password with bcrypt-style PBKDF2
     */
    hashPassword(password) {
        const salt = crypto.randomBytes(SALT_LENGTH);
        const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha512');

        return {
            hash: hash.toString('hex'),
            salt: salt.toString('hex'),
            iterations: ITERATIONS,
        };
    }

    /**
     * Verify password against hash
     */
    verifyPassword(password, storedHash, storedSalt, iterations = ITERATIONS) {
        const hash = crypto.pbkdf2Sync(
            password,
            Buffer.from(storedSalt, 'hex'),
            iterations,
            KEY_LENGTH,
            'sha512'
        );

        return hash.toString('hex') === storedHash;
    }

    /**
     * Generate HMAC for data integrity
     */
    generateHMAC(data, secret = null) {
        const hmacSecret = secret || this.masterKey;
        return crypto.createHmac('sha256', hmacSecret).update(data).digest('hex');
    }

    /**
     * Verify HMAC
     */
    verifyHMAC(data, hmac, secret = null) {
        const computed = this.generateHMAC(data, secret);
        return crypto.timingSafeEqual(
            Buffer.from(computed, 'hex'),
            Buffer.from(hmac, 'hex')
        );
    }
}

// Singleton instance
let encryptionService = null;

function getEncryptionService() {
    if (!encryptionService) {
        encryptionService = new EncryptionService();
    }
    return encryptionService;
}

module.exports = {
    EncryptionService,
    getEncryptionService,
};
