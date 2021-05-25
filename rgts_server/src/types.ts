import {Request, Response} from 'express';
import { Session } from "express-session";
import { Redis } from "ioredis";
import { createUpvoteLoader } from './utils/createUpvoteLoader';
import { createUserLoader } from './utils/createUserLoader';


declare module 'express' {
        export interface Request{
                session: Session & {userId: number}
        }
}

export type MyContext = {
        req: Request;
        res: Response
        redis: Redis
        userLoader: ReturnType<typeof createUserLoader>;
        upvoteLoader: ReturnType<typeof createUpvoteLoader>

}