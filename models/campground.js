const { func } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review')
const opts = { toJSON: { virtuals: true } };
const { cloudinary } = require('../cloudinary');

const imageSchema = new Schema({
        url: String,
        filename: String
});

imageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200')
});

const campgroundSchema = new Schema({
    title: String,
    images: [imageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

campgroundSchema.virtual('properties.popupMarkup').get(function() {
    return `<p class="text-center"><strong><a class="text-decoration-none text-success fs-6" href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p class="text-center  fs-6"><b>$${this.price}/night</b></p></p>`
});

campgroundSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        });
        if (doc.images && doc.images.length > 0) {
            for (const image of doc.images) {
                await cloudinary.uploader.destroy(image.filename);
            }
        }
    }
});

module.exports = mongoose.model('Campground', campgroundSchema);