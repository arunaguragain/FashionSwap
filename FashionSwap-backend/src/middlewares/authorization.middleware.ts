import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { Request, Response, NextFunction } from "express";
import { HttpError } from "../errors/http-error";
import { UserRepository } from "../repositories/user.repository";
import { IUser } from "../models/user.model";

declare global{
    namespace Express {
        interface Request {
            user?: Record<string, any> | IUser;
        }
    }
}
let userRepository = new UserRepository();

export const authorizedMiddleware = async(req: Request, res: Response, next: NextFunction) => {
    try{
        let token = "";
        const authHeader = req.headers.authorization;
        console.log("Auth Middleware Debug - Header:", authHeader);
        console.log("Auth Middleware Debug - Cookies:", req.cookies);
        if(authHeader && authHeader.startsWith("Bearer ")){
            token = authHeader.split(" ")[1]; 
        } else if (req.cookies && req.cookies.auth_token) {
            token = req.cookies.auth_token;
        }

        if(!token){
            throw new HttpError(401, "Unauthorized, Token missing or malformed");
        }
        const decodedToken = jwt.verify(token, JWT_SECRET) as Record<string, any>; 
        const userId = decodedToken.id || decodedToken.userId;
        if(!decodedToken || !userId){
            throw new HttpError(401, "Unauthorized, Token invalid");
        }
        const user = await userRepository.getUserById(userId);
        if(!user){
            throw new HttpError(401, "Unauthorized, User not found");
        }
        req.user = user;
        next();
    }catch(error: Error | any){
        return res.status(error.statusCode || 401).json(
            { success: false, message: error.message || "Unauthorized"}
        );
    }
} 

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new HttpError(401, 'Unauthorized no user info');
        }
        if (req.user.role !== 'admin') {
            throw new HttpError(403, 'Forbidden not admin');
        }
        return next();
    } catch (err: Error | any) {
        return res.status(err.statusCode || 500).json(
            { success: false, message: err.message }
        )
    }
}

