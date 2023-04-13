const mongoose = require('mongoose')

// Schema
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A trip must have a name'], // Required can take 2 parameters in an Array, first is true/False, second is
        // the error message to display if the required field is missing
        unique: true,
        trim: true
    },
    duration: {
        type: Number,
        required: [true, 'Duration is mandatory to add']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A trip must have a maximum capacity']
    },
    difficulty: {
      type: String,
      required: [true, 'Must have a difficulty level']  
    },
    // rating: Number || we can simply declare like this in schema if we do not want any further properties like required/default
    ratingsAverage: {
        type: Number,
        default: 4.5, // Not specifying rating will automatically set it to 4.5
    },
    ratingsQuantity: {
        type: Number,
        default: 0,
    },
    price: {
        type: Number,
        required: [true, 'The price should be mentioned']
    },
    discount: {
        type: Number
    },
    summary: {
        type: String,
        trim: true // only applicable for strings, and it removes all the whitespace 
    },
    description: {
        type: String,
        trim: true,
        required: [true, 'A trip must have a description']
    },
    imageCover: {
        type: String,
        required: [true, 'A trip must have a cover image']
    },
    images: [String], // This defines an Array of strings
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false // this will now hide while displaying all the results of DB
    },
    startDates: [Date],
})

// Model
const Tour = mongoose.model('Tour', tourSchema); // Model takes 2 parameters (name of model, schema)

module.exports = Tour;