import express from 'express';
import amqp from 'amqplib';

const app = express();
app.use(express.json());

let lastMessage = null;

async function connectWithRetry() {
  const MAX_RETRIES = 5;
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_URL);
      return connection;
    } catch (error) {
      attempts++;
      console.error(`Falha ao tentat conectar com o RabbitMQ (attempt ${attempts}):`, error.message);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  throw new Error('Não foi possível conectar-se com RabbitMQ');
}

async function receiveFromQueue() {
  try {
    const connection = await connectWithRetry();
    const channel = await connection.createChannel();
    await channel.assertQueue('transactionQueue');

    channel.consume('transactionQueue', (msg) => {
      if (msg !== null) {
        lastMessage = msg.content.toString();
        console.log('Received:', lastMessage);
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error('Error in receiveFromQueue:', error);
  }
}

receiveFromQueue().catch(console.error);

app.get('/notification', (req, res) => {
  if (lastMessage) {
    res.json({ message: lastMessage });
  } else {
    res.json({ message: 'Sem novas notificações disponíveis' });
  }
});

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Sistema de Notificação está disponível na porta ${port}`));
