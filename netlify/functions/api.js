const { MongoClient } = require('mongodb');

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

exports.handler = async (event) => {
  try {
    const client = await connectToDatabase();
    const db = client.db('minecraftg');
    const usersCollection = db.collection('users');

    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body);
      
      // Guarda o actualiza el usuario basado en su nombre o ID
      await usersCollection.updateOne(
        { username: data.username },
        { $set: data },
        { upsert: true }
      );

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: 'Guardado en MongoDB correctamente' }),
      };
    }

    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
