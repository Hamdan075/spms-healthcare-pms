import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { router } from './routes.js';
import { Project } from './models.js';
import { seed } from './seed.js';

const app = express();
app.use(cors(), express.json());
app.use('/api', router);
app.use((err, req, res, next) => {
  let status = err.status || 500, message = err.message;
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map((e) => e.message).join('; '); }
  if (err.name === 'CastError') { status = 400; message = `Invalid value for ${err.path}`; }
  if (status === 500) console.error(err);
  res.status(status).json({ error: message });
});
await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/spms');
if (!(await Project.exists({}))) { await seed(); console.log('Empty database: sample case-study data loaded.'); }
app.listen(process.env.PORT || 5000, () => console.log('SPMS API on port ' + (process.env.PORT || 5000)));
