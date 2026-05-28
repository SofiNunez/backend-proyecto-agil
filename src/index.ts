import express from 'express';

const app = express();

app.use(express.json());
app.use('/api');

app.listen(3000, () => console.log('Servidor en http://localhost:3000'));