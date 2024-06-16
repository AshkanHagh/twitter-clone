import express, { type NextFunction, type Request, type Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { RouteNowFoundError } from './lib/utils/customErrors';
import { ErrorMiddleware } from './middlewares/error';

export const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({origin : process.env.ORIGIN}));

app.get('/', (req : Request, res : Response) => res.status(200).json({success : true, message : 'Welcome this is first route'}));
app.all('*', (req : Request, res : Response, next : NextFunction) => {
    next(new RouteNowFoundError(`Route :${req.originalUrl} not found`));
});

app.use(ErrorMiddleware);