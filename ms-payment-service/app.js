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
  await sendToQueue('Nova Transação Realizada! Valor: '+amount+", Status: "+status);
  res.status(201).send('Transição requisitada realizada!');
});

app.put('/transactions/:id/success', async (req, res) => {
  const transactionId = req.params.id;

  try {
      const result = await pool.query(
          'UPDATE transactions SET status = $1 WHERE id = $2 RETURNING *',
          ['sucesso', transactionId]
      );

      if (result.rowCount === 0) {
          return res.status(404).json({ error: 'ID de transação não encontrada' });
      }

      res.status(200).json({ message: 'A transação foi aprovada', transaction: result.rows[0] });
      await sendToQueue(`Transação ${transactionId} aprovada!`);
  } catch (error) {
      console.error('Erro ao atualizar a transação:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Sistema de Pagamento disponível na porta ${port}`));
