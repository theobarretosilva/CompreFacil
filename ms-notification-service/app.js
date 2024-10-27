import express from 'express';
import amqp from 'amqplib';

const app = express();
app.use(express.json());

async function receiveFromQueue() {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue('transactionQueue');
  channel.consume('transactionQueue', (msg) => {
    if (msg !== null) {
      console.log('Received:', msg.content.toString());
      channel.ack(msg);
    }
  });
}

receiveFromQueue().catch(console.error);

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Notification service listening on port ${port}`));
