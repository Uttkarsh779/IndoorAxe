import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from './config/passport.js';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { uploadsRoot } from './middleware/upload.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

app.use('/uploads', express.static(uploadsRoot));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
