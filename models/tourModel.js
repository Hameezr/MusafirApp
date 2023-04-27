const mongoose = require('mongoose');
const slugify = require('slugify');

// Schema
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A trip must have a name'], // Required can take 2 parameters in an Array, first is true/False, second is
        // the error message to display if the required field is missing
        unique: true,
        trim: true,
        maxLength: [40, 'A trip must have 40 characters at max'], // This is a validator and below one too
        minLength: [5, 'A trip must have at least 5 characters'],
    },
    slug: String,
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
        required: [true, 'Must have a difficulty level'],
        enum: {  // validator example for enum only works on strings
            values: ['easy', 'medium', 'difficult'],
            message: 'should only be easy, medium or difficult'
        },
    },
    // rating: Number || we can simply declare like this in schema if we do not want any further properties like required/default
    ratingsAverage: {
        type: Number,
        default: 4.5, // Not specifying rating will automatically set it to 4.5
        min: [1, 'rating must at least be 1'], // example of validator on type number
        max: [5, 'rating should not be more than 5']
    },
    ratingsQuantity: {
        type: Number,
        default: 0,
    },
    price: {
        type: Number,
        required: [true, 'The price should be mentioned']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                // this only points to current doc on NEW doc creation, wouldn't work on update
                return val < this.price;
            },
            message: 'Discounted price, {VALUE} can\'t be higher than price',
        }
    },
    summary: {
        type: String,
        trim: true // only applicable for strings, and it removes all the whitespace 
    },
    description: {
        type: String,
        trim: true,
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
    secretTour: {
        type: Boolean,
        default: false,
    }
},
    // I am adding the following argument in the mongoose.Schema which is not required but used for options 
    // by default, virtuals do not get displayed in docs, to display them following is done
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    })

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
})

// DOCUMENT MIDDLEWARE: runs before .save() and .create() not .insertMany() it does not work for update
tourSchema.pre('save', function (next) { // it takes 2 arguments 1. hook i.e save , 2nd a callback function 
    this.slug = slugify(this.name, { lower: true });
    next();
})

// DOCUMENT MIDDLEWARE: runs after .save() and .create()

// tourSchema.post('save', function(doc, next){
//     console.log(doc);
//     next();
// });

// QUERY MIDDLEWARE runs before/after a query is executed

tourSchema.pre(/^find/, function (next) { // this middleware is executed before our getAllTours find query and it performs
    // some actions based on what we want 
    // However this will only work for findAll not findOne, so if we search secret tour by ID it will be visible 
    this.find({ secretTour: { $ne: true } })
    next();
})
// this is used for findOne, and now secret tour can be hidden from search by ID too but we will use regex above 
// tourSchema.pre('findOne', function(next){ 
//     this.find({secretTour: {$ne: true}})
//     next();
// })

// AGGREGATION MIDDLEWARE 
// our secret tours in previous queries will still show in aggregation so we need to hide them from there as well
tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    next();
})

// Model
const Tour = mongoose.model('Tour', tourSchema); // Model takes 2 parameters (name of model, schema)

module.exports = Tour;