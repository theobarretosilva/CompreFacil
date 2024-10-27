import express from 'express';
import pkg from 'pg';
import amqp from 'amqplib';

const { Pool } = pkg;

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function sendToQueue(message) {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue('transactionQueue');
  channel.sendToQueue('transactionQueue', Buffer.from(message));
}

app.post('/transaction', async (req, res) => {
  const { userId, amount } = req.body;
  await pool.query('INSERT INTO transactions (user_id, amount, status) VALUES ($1, $2, $3)', [userId, amount, 'pending']);
  await sendToQueue('Transaction request received');
  res.status(201).send('Transaction request received');
});

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Payment service listening on port ${port}`));
