import SecurityManager from '../utils/helpers/securityManager';
import JWTTypes from '../core/enums/jwtTypes';
import TokenManager from '../utils/helpers/tokenManager';
import { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../core/errors/custom';
import IJWTPayload from '../core/interfaces/jwt';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {

    
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) throw new CustomError(HttpStatusCode.Unauthorized, 'Invalid Token Provided');
    
    const token = authHeader.split(' ')[1];
    
    if (!token) throw new CustomError(HttpStatusCode.Unauthorized, 'No token provided');

    const decoded: IJWTPayload | null = SecurityManager.verifyAndDecodeJwt(token, JWTTypes.API);

    const tokenStatus = await TokenManager.isTokenActive();

    if (!decoded || !tokenStatus) throw new CustomError(HttpStatusCode.Unauthorized, 'Invalid Token Provided');

    req.user = {
        ...decoded,
        userUtcOffset: req.headers['utc-offset']?.[0] ? parseInt(req.headers['utc-offset'][0], 10) : null
    };

    req.token = token;
    next();
};