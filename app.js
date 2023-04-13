const express = require('express');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1. MIDDLEWARES 

// app.use(morgan('dev'));
app.use(express.json());
app.use((req, res, next)=>{
  req.requestTime = new Date().toISOString();
  next();
})
  
// Below process is called mounting the router on a route 
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

module.exports = app;