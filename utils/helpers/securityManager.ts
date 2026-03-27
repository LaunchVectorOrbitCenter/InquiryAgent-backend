import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes, createCipheriv, createDecipheriv, pbkdf2Sync, timingSafeEqual, createHash } from 'crypto';
import pbkdf2 from 'pbkdf2';
import { BYTE_SIZE, ENCRYPTION_CONFIGURATION, JWT_CONFIGURATION, SALT_ROUNDS } from '../constants';
import { Application } from '../../app';
import JWTTypes from '../../core/enums/jwtTypes';
import IJWTPayload from '../../core/interfaces/jwt';

class SecurityManager {

    async hashPassword(password: string, saltRounds: number = SALT_ROUNDS.PASSWORD_SALT_ROUND): Promise<string> {
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    }

    async verifyPassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    public generateRandomKey(size: number, format: BufferEncoding = 'base64', isBufferRequired: boolean = false) {
        const buffer = randomBytes(size);
        return isBufferRequired ? buffer : buffer.toString(format);
    }

    public async generateJWT(payload: Record<string, any>, jwtType: string) {

        let privateKey: string;
        let passphrase: string;


        switch (jwtType) {
            case JWTTypes.API:
                privateKey = Application.jwtEncryption.api.privateKey;
                passphrase = Application.jwtEncryption.api.passphrase;
                break;

            case JWTTypes.PASSWORD_RESET:
                privateKey = Application.jwtEncryption.api.privateKey;
                passphrase = Application.jwtEncryption.api.passphrase;
                break;

            default:
                throw new Error(`Invalid JWT Type Passed: ${jwtType}`);
        }

        const expiry = jwtType === JWTTypes.API ? JWT_CONFIGURATION.apiAccessTokenExpiration : JWT_CONFIGURATION.passwordResetTokenExpiration;
        const token = this.signJwt(payload, privateKey, passphrase, expiry);
        return token;
    }

    private signJwt(payload: Record<string, any>, privateKey: string, passphrase: string, expiresIn: string | number = JWT_CONFIGURATION.apiAccessTokenExpiration): string {
        //@ts-ignore
        return jwt.sign(
            payload,
            {
                key: privateKey,
                passphrase: passphrase
            },
            {
                algorithm: 'RS256',
                expiresIn: expiresIn
            }
        );
    }

    public verifyAndDecodeJwt(token: string, jwtType: string): IJWTPayload | null {
        try {
            let publicKey: string;
            if (jwtType === JWTTypes.API) {
                publicKey = Application.jwtEncryption.api.publicKey;
            }
            else if (jwtType === JWTTypes.PASSWORD_RESET) {
                publicKey = Application.jwtEncryption.api.publicKey;
            }
            else {
                throw new Error(`Invalid JWT Type Passed: ${jwtType}`);
            }
            const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
            return <IJWTPayload>decoded;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    public encryptAES(value: string, key: Buffer, iv: Buffer): string {
        const cipher = createCipheriv('aes-256-gcm', key, iv);
        let encryptedData = cipher.update(value, 'utf-8', 'hex');
        encryptedData += cipher.final('hex');
        const authTag = cipher.getAuthTag();
        return `${encryptedData}:${authTag.toString('hex')}`;
    }

    public decryptAES(value: string, key: Buffer, iv: Buffer): string | false {
        try {
            const [encryptedData, authTagHex] = value.split(':');
            const authTag = Buffer.from(authTagHex, 'hex');
            const decipher = createDecipheriv('aes-256-gcm', key, iv);
            decipher.setAuthTag(authTag);
            let decryptedData = decipher.update(encryptedData, 'hex', 'utf-8');
            decryptedData += decipher.final('utf-8');
            return decryptedData;
        } catch (error) {
            console.error('Error decrypting data:', error);
            return false;
        }
    }

    public decryptSHA256(password: string, original: string, salt: Buffer): boolean {
        const hash = pbkdf2Sync(password, salt, ENCRYPTION_CONFIGURATION.SHA_ALGO_ITERATION, ENCRYPTION_CONFIGURATION.SHA_ALGO_KEY_LENGTH, 'sha256');
        const originalHash = Buffer.from(original, 'hex');
        return timingSafeEqual(hash, originalHash);
    }

    public encryptSHA256(password: string, salt: Buffer): string {
        const hash = pbkdf2.pbkdf2Sync(password, salt, ENCRYPTION_CONFIGURATION.SHA_ALGO_ITERATION, ENCRYPTION_CONFIGURATION.SHA_ALGO_KEY_LENGTH, 'sha256');
        return hash.toString('hex');
    }

    public generateSHA512Hash(plainText: string) {
        const hash = createHash('sha-512');
        hash.update(plainText);
        return hash.digest('hex');
    }

    public generateRandomBytes(size: number = BYTE_SIZE.KEY) {
        return randomBytes(size).toString('hex');
    }


    // public async validateShopifyCallback(query: Record<string, any>) {
    //     const { hmac, ...params } = query;

    //     if (!hmac || typeof hmac !== "string") return false;

    //     const sortedParams = Object.keys(params)
    //         .sort()
    //         .map(key => `${key}=${params[key]}`)
    //         .join("&");

    //     const computedHmac = createHmac("sha256", Application.conf.SHOPIFY_AUTH.shopifyAppClientSecret)
    //         .update(sortedParams)
    //         .digest("hex");

    //     const isHmacValid = timingSafeEqual(Buffer.from(computedHmac, "utf-8"), Buffer.from(hmac, "utf-8"));
    //     if (!isHmacValid) throw new CustomError(HttpStatusCode.Unauthorized, "Invalid hmac provided");
    // }

}

export default new SecurityManager();
