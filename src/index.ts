import 'dotenv/config'; // Carga las variables de entorno desde el archivo .env
import express from 'express';
import notificationsRouter from './modules/notifications/controller';
import trackingRouter from './modules/tracking/controller';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/notifications', notificationsRouter);
app.use('/tracking', trackingRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});