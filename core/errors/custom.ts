import { Response } from 'express';
import { Utils } from '../../utils/utils';

export class CustomError extends Error {
    private readonly errorCode: number;
    private readonly errorDescription: string;
    

    constructor(errorCode: number, errorDescription: string) {
        super();
        this.errorCode = errorCode;
        this.errorDescription = errorDescription;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    public sendResponse(res: Response) {
        return Utils.apiResponse({
            res,
            code: this.errorCode,
            status: false,
            responseCode: this.errorCode.toString(),
            responseDescription: this.errorDescription,
        });
    }

}