const Campground = require('../models/campground.js');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding.js');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const { cloudinary } = require('../cloudinary');

module.exports.index = async(req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
};


module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
};

module.exports.createNewForm = async(req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully created campground!')
    res.redirect(`/campgrounds/${campground._id}`)    
};

module.exports.showCampground = async(req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    console.log(campground);
    if (!campground) {
        req.flash('error', 'No campground was found!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
};

module.exports.renderEditForm = async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'No campground was found!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground });
};

module.exports.updateCampground = async(req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    const img = req.files.map(f => ({url: f.path, filename: f.filename}))
    campground.images.push(...img);
    await campground.save();
    if (req.body.deletedImages) {
        for (let filename of req.body.deletedImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deletedImages }}}})
    }
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`)
};

module.exports.destroyCampground = async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', `You don't have premission to do that!`)
        return res.redirect(`/campgrounds/${campground._id}`)
    }
    const deletedCampground = await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfuly deleted campground!')
    res.redirect('/campgrounds')
};