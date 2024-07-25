import mongoose from 'mongoose';

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log('Already connected to the database');
    return;
  }

  try {
    // if(!process.env.MONGODB_URI){
    //   throw new Error('Please add your Mongo URI to your environment')
    // }

    const db = await mongoose.connect("mongodb+srv://anupamsingh2389:NxikFqGlHfuCV8sQ@cluster0.y4rmw8e.mongodb.net/assignment"|| '', {});

    connection.isConnected = db.connections[0].readyState;

    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);

    // Graceful exit in case of a connection error
    process.exit(1);
  }
}

export default dbConnect;
