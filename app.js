const express = require('express');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
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

// handling for wrong routes below, doing it after the correct routes above as it will only execute if above routes are not 
// matched

app.all('*', (req, res, next)=> { // app.all is used for all app.get/post/delete etc and '*' is used for all routes
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can\'t find the URL ${req.originalUrl} on this server`
  // })

  // Below is the implementation if I do not have a class for AppError
  // const err = new Error(`Can\'t find the URL ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;

  const err = new AppError(`Can\'t find the URL ${req.originalUrl} on this server`, 404);
  next(err); // if next receives an argument, express will assume there's an error, next will pass error to the next middleware
})

// ERROR HANDLING MIDDLEWARE 
app.use(globalErrorHandler)


module.exports = app;