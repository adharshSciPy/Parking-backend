import dotenv from 'dotenv';
import { server } from './app.js';
import connectMongoDb from './src/config/mongodb.js';

dotenv.config({
    path: './.env'
})

const PORT = process.env.PORT;

connectMongoDb()
    .then(() => {
        server.listen(PORT, () => console.log(`server connected @ ${PORT}`))
    })
    .catch((err) => console.log(`server faied ${err}`))