import { NextFunction, Response, Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

const LoggerInit = (req: Request, _res: Response, next: NextFunction) => {
  req.headers.executionId = uuidv4();
  next();
};

export default LoggerInit;
