import dotenv from 'dotenv'
dotenv.config()
import express from 'express';
import cors from 'cors'
import  connectDb  from './config/connectdb.js';
import userRoutes from './routes/user.routes.js'
import adminRoutes from './routes/admin.routes.js'
import initializeAdmin from './models/admin.schema.js';
const app=express()
const port=process.env.PORT;
const DB_URL=process.env.DB_URL;
connectDb(DB_URL)
initializeAdmin()
app.use(cors())
app.use(express.json())
app.use('/users',userRoutes)
app.use('/admin',adminRoutes)
app.listen(port,()=>console.log(`Server is listening at port ${port}`))