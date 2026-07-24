

import express from "express";
import 'dotenv/config';

const app = express();

app.get('/', (req, res)=>{
    console.log('the server api is also running.')
    res.send('I am Harmin, who testing this API');
})

app.listen(process.env.PORT, ()=> {
    console.log('server is running');
})