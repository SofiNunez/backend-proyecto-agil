import express, { Request, Response } from 'express';

const app = express();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({ mensaje: 'Hola mundo!' });
});

app.listen(3000, () => console.log('Servidor en http://localhost:3000'));