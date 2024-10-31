// db.js
// require('dotenv').config();
// const mongoose = require('mongoose');

// const connectDB = async () => {
//   try {
//     mongoose.connect(`mongodb+srv://Fanboyingeneral:${process.env.MONGO_PASSWORD}@web-scraper-cluster.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000`, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     })
//     .then(() => console.log('Connected to MongoDB'))
//     .catch(err => console.error('Connection error', err));
//   } catch (error) {
//     console.error('Error connecting to MongoDB:', error);
//   }
// };

// module.exports = connectDB;



// FOR LOCAL DATABASE CONNECTION
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://mongodb_full:27017/', {  // 'mongodb_full' is the name of MongoDB service in Docker Compose
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
};

module.exports = connectDB;
