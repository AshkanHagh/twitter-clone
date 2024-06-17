import express, { type NextFunction, type Request, type Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { RouteNowFoundError } from './libs/utils';
import { ErrorMiddleware } from './middlewares/error';

import authRouter from './routes/auth.route';

export const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({origin : process.env.ORIGIN}));

app.get('/', (req : Request, res : Response) => res.status(200).json({success : true, message : 'Welcome'}));

app.use('/api/v2/auth', authRouter);

app.all('*', (req : Request, res : Response, next : NextFunction) => {
    next(new RouteNowFoundError(`Route :${req.originalUrl} not found`));
});

app.use(ErrorMiddleware);