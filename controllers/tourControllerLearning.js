const Tour = require('../models/tourModel');

// Below is the middleware function, which will first fill in the req.query parameters itself 
// and once it moves to getAllTours it will already have the inputs, tourRoutes call this alias
exports.aliasTopTours = (req, res, next) => { 
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary';
  next();
}

exports.getAllTours = async (req, res) => {
  try {
    // BUILD THE QUERY 
    // 1A) Filtering 
    const queryObj = {...req.query};
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);
    
    // const query = Tour.find(queryObj); previously with basic filterting
    
    // 1B) Advanced Filtering
    let queryStr = JSON.stringify(queryObj)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)

    let query = Tour.find(JSON.parse(queryStr));

    // 2) Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy); // using sort query here
    } else {
      query = query.sort('-createdAt');
    }

    // 3) Field Limiting 
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields); // using select query here
    } else {
      query = query.select('-__v'); // the minus in the prefix means to exclude the __v that gets 
      // created in db could be -name to exclude the name only
    }

    // 4) Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100; 
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page does not exist');
    }

    // EXECUTE THE QUERY 
    const tours = await query;

    // const tours = await Tour.find(queryObj); // if we dont pass anything in find, it will return all Tour.find({})
    // Below is another method of applying filters with mongoose
    // const tours = await Tour.find().where('duration').lte(5).where('difficulty').equals('easy'); 


    // SEND RESPONSE 
    res.status(200).json({
      status: 'success',
      data: {
        results: tours.length,
        tours
      }
    })
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err
    })
  }
}

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id)
    res.status(200).json({
      status: 'Success',
      data: {
        tour
      }
    })
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err
    })
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body)
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: err
    })
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // by setting to true, it returns modified document rather than the original. default val is false
      runValidators: true,
    })
    res.status(201).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: err
    })
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id)
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: err
    })
  }
};


// == OLD METHOD == \\ 
// const fs = require('fs');

// The following was for reading a data from JSON file but now we're gonna use the DB
// const tours = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
//   );

// exports.checkID = (req, res, next, val) => {
//   const id = req.params.id * 1;
//   if (id > tours.length) {
//     return res.status(404).json({
//       status: 'failed',
//       message: 'Invalid ID',
//     });
//   }
//   next();
// }

// exports.getAllTours = (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     // results: tours.length,
//     // data: {
//     //   tours,
//     // },
//   });
// };

// exports.getTour = (req, res) => {
//   const id = req.params.id * 1;
//   // const tour = tours.find((el) => el.id === id);

//   // res.status(200).json({
//   //   status: 'success',
//   //   data: {
//   //     tour,
//   //   },
//   // });
// };

// Old way of creating Tour
// exports.createTour = (req, res) => {
//   const newId = tours[tours.length - 1].id + 1;
//   const newTour = Object.assign({ id: newId }, req.body);
//   tours.push(newTour);
//   fs.writeFile(
//     `${__dirname}/dev-data/data/tours-simple.json`,
//     JSON.stringify(tours),
//     (err) => {
//       res.status(201).json({
//         status: 'success',
//         data: {
//           tour: newTour,
//         },
//       });
//     }
//   );
// };

