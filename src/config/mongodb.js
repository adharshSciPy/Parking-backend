import mongoose from 'mongoose'

const connectMongoDb = async () => {
    const mongoUri = process.env.MONGODB_URI
    try {
        const connect = await mongoose.connect(mongoUri)
        console.log(`mongodb connected success @ host: ${connect.connection.host}`)
    }
    catch (error) {
        console.log(`mongodb connection failed due to ${error}`)
        process.exit(1)
    }

}

export default connectMongoDb