const mongoose = require('mongoose');

const connect = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/cleaning', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
        console.log('Connected to MongoDB');

        mongoose.connection.on('disconnected', () => {
            console.log('Disconnected from MongoDB');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('Reconnected to MongoDB');
        });

        mongoose.connection.on('error', (error) => {
            console.error('Error connecting to MongoDB', error);
        });
        
    } catch (error) {
        console.error('Error connecting to MongoDB', error);
    }
}

// make sure to call connect() called only once
module.exports = {
    connect
};
