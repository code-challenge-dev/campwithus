const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));
db.once('open', async () => {
    console.log('Database connected');

    console.log('Seeding the database...');

    await seedDB();

    console.log('Seeding completed.');

    mongoose.connection.close();
    console.log('connection closed')
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    try {

        console.log('Deleting existing campgrounds...');
        await Campground.deleteMany({});
        console.log('Campgrounds deleted.');

        console.log('Creating new campgrounds...');
        for (let i = 0; i < 400; i++) {
            const random1000 = Math.floor(Math.random() * 1000);
            const price = Math.floor(Math.random() * 20) + 10;
            const camp = new Campground({
                author: '65919896c1dde08d6a41fc9e',
                title: `${sample(descriptors)} ${sample(places)}`,
                location: `${cities[random1000].city}, ${cities[random1000].state}`,
                description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
                price,
                geometry: {
                  type: 'Point',
                  coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                  ]
                },
                images: [
                    {
                      url: 'https://res.cloudinary.com/dcoabrclf/image/upload/v1704270600/CampWithUs/mnwkgg0j6mzzuv7wakmq.jpg',
                      filename: 'CampWithUs/mnwkgg0j6mzzuv7wakmq'
                    },
                    {
                      url: 'https://res.cloudinary.com/dcoabrclf/image/upload/v1704558020/CampWithUs/uxpf0henalmzdj17djoc.jpg',
                      filename: 'CampWithUs/uxpf0henalmzdj17djoc'
                    },
                    {
                      url: 'https://res.cloudinary.com/dcoabrclf/image/upload/v1704272479/CampWithUs/ccgo0tecmu049vuqdl30.jpg',
                      filename: 'CampWithUs/ccgo0tecmu049vuqdl30'
                    }
                  ]
            })
            await camp.save();
        }
        console.log('New campgrounds created.');
    } catch (error) {
        console.error('Error during seeding:', error);
    }
};
