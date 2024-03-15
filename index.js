import dotenv from 'dotenv';
import { app } from './app.js'
import connectMongoDb from './src/config/mongodb.js';

dotenv.config({
    path: './.env'
})

const PORT = process.env.PORT;

connectMongoDb()
    .then(() => {
        app.listen(PORT, () => console.log(`server connected @ ${PORT}`))
    })
    .catch((err) => console.log(`server faied ${err}`))