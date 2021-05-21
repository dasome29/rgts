import {Request, Response} from 'express';
import { Session } from "express-session";
import { Redis } from "ioredis";


declare module 'express' {
        export interface Request{
                session: Session & {userId: number}
        }
}

export type MyContext = {
        req: Request;
        res: Response
        redis: Redis

}