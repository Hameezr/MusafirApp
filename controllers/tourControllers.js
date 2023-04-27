const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

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
    // EXECUTE THE QUERY 
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

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

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } }
      },
      {
        $group: {
          _id: '$difficulty', // we can use _id: '$difficulty' and it will give the below stats for all difficulties i.e easy, medium, hard, 
          // setting it to null won't group it
          numTours: {$sum: 1}, // on each iteration, 1 is going to be added to the sum which will give total tours
          numRatings: {$sum: '$ratingsQuantity'}, // variableNameToDisplay: {$operator: '$dbDocFieldName'}
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: {$min: '$price'},
          maxPrice: {$max: '$price'},
        },
      },
      {
        $sort: {avgPrice: 1} // 1 for ascending and we have to use avgPrice variable that we used above in group
      },
      // {
      //   $match: {_id: {$ne: 'easy'}} // ne = not equal , it will now only show difficult & medium ones
      // }
    ]);
    res.status(201).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: err
    })
  }
}

exports.getMonthlyPlan = async (req,res)=>{
  try {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates' // unwind deconstructs an array of documents and output one document for each element
      },
      {
        $match: { startDates: { 
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        } 
      }
      },
      {
        $group: {
          _id: {$month: '$startDates'}, // month is an aggregate operator which extracts the month from a date
          numTourStarts: {$sum: 1}, 
          tours: {$push: '$name'} // push is an aggregate operator which keeps pushing the name in every iteration
        }
      },
      {
        $addFields: {month: '$_id'} // name of the field and id e.g month: _id this will add a field named month to result
      },
      {
        $project: {
          _id: 0 // setting id or any field to zero wont show up in results, if we put 1 they will show up
        }
      },
      {
        $sort: {numTourStarts: -1}
      },
      {
        $limit: 12 // number of documents to show
      }
    ])
    res.status(201).json({
      status: 'success',
      data: {
        plan
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: err
    })
  }
}
