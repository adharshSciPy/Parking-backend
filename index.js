import dotenv from 'dotenv';
import { app } from './app.js';
import http from 'http';
import connectMongoDb from './src/config/mongodb.js';

dotenv.config({
    path: './.env'
})

const PORT = process.env.PORT;
const server = http.createServer(app);

connectMongoDb()
    .then(() => {
        server.listen(PORT, () => console.log(`server connected @ ${PORT}`))
    })
    .catch((err) => console.log(`server faied ${err}`))