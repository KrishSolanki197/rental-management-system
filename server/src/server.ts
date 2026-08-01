
import express from "express"
import type { Request, Response, NextFunction, Express } from "express";
import 'dotenv/config';
import mainRouter from "./routes/index.js";
import authRoute from "./modules/auth/auth.routes.js";
import swaggerui from 'swagger-ui-express';
import { swaggerSpec } from "./swagger.js";
import cors from 'cors';
import morgan from 'morgan';
import helmet from "helmet";
import compression from "compression";

const app:Express = express();

/* CORS - Cross Origin Resource Sharing, before the CORS browser only allowed SOP (Same Origin Policy where attacker can steal your data)
* Origin Contain three things: 
    Protocol = http or https
    Host = 127.0.0.1 or localhost or google.com or harmin.in
    Port = 443
*/
app.use(cors({
    origin: [
        "http://127.0.0.1:5173"
    ], // request allowed from these origin only
    credentials: true, // allow cookies
    methods: ["GET", "POST", "PUT", "DELETE"], // olny allow this requests
    allowedHeaders: [
        'Content-Type'
    ], 
    maxAge: 86400
}));

app.use(express.json({
    limit: '1024kb', // No one can send data more than 1 MB because of the limit 
    strict: true, // only json body and array are accepted
    type: 'application/json'
}));

// Logs HTTP requests 
app.use(morgan('dev'));

/* compress all the response before sending them to the client, 
benifits are fast loading and fast sending */
app.use(compression());

// It helps protect against attacks like:
// Clickjacking
// MIME sniffing
// Some XSS scenarios
app.use(helmet());

// test APIs for server
app.get('/health', (req:Request, res: Response)=>{
    res.send('I am Harmin, who is testing this API');
})

// API endpoints 
app.use(mainRouter);

app.use(
    (err:unknown, req:Request, res:Response, next:NextFunction)=>{
        console.log("there is an error occurs in internal server", err);

        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
);


app.use(
    '/api-docs',
    swaggerui.serve,
    swaggerui.setup(swaggerSpec)
)

app.listen(process.env.PORT, ()=> {
    console.log('server is running');
})
