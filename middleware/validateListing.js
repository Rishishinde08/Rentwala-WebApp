const ExpressError = require('../utils/ExpressError');

module.exports.validateListing = (req, res, next) => {
    const { title, price, location, country } = req.body.listing;
    
    if (!title || !price || !location || !country) {
        throw new ExpressError(400, 'All fields are required!');
    }
    
    if (price < 0) {
        throw new ExpressError(400, 'Price cannot be negative!');
    }
    
    next();
}; 