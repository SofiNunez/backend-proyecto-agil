import express from 'express';

const app = express();

app.use(express.json());
// add your actual routes here

app.listen(3000, () => console.log('Servidor en http://localhost:3000'));