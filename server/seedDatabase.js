const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Video = require('./models/Video');
const User = require('./models/User');

dotenv.config();

const sampleVideos = [
  {
    title: "Star Wars: The Force Awakens Trailer (Official)",
    description: "The official trailer for Star Wars: The Force Awakens. Join the rebellion and experience the epic return to a galaxy far, far away.",
    uploader: "Star Wars",
    videoUrl: "https://www.youtube.com/watch?v=sGbxmsDFVnE",
    thumbnail: "https://i.ytimg.com/vi/sGbxmsDFVnE/maxresdefault.jpg",
    duration: 142,
    views: 2,
    tags: ["star wars", "trailer", "action", "sci-fi"],
    category: "Entertainment"
  },
  {
    title: "Jhol | Coke Studio Pakistan | Season 15 | Maanu x Annural Khalid",
    description: "A mesmerizing fusion of traditional and contemporary music from Coke Studio Pakistan featuring Maanu and Annural Khalid.",
    uploader: "Coke Studio Pakistan",
    videoUrl: "https://www.youtube.com/watch?v=example2",
    thumbnail: "https://i.ytimg.com/vi/YourVideoId/maxresdefault.jpg",
    duration: 324,
    views: 3,
    tags: ["music", "coke studio", "pakistan", "fusion"],
    category: "Music"
  },
  {
    title: "Aashiq Banaya Aapne Title (Full Song) | Himesh Reshammiya",
    description: "The complete title track of the popular Bollywood movie Aashiq Banaya Aapne composed and sung by Himesh Reshammiya.",
    uploader: "T-Series",
    videoUrl: "https://www.youtube.com/watch?v=example3",
    thumbnail: "https://i.ytimg.com/vi/YourVideoId2/maxresdefault.jpg",
    duration: 287,
    views: 0,
    tags: ["bollywood", "hindi", "romantic", "himesh reshammiya"],
    category: "Music"
  },
  {
    title: "React.js Complete Tutorial for Beginners",
    description: "Learn React.js from scratch in this comprehensive tutorial. Perfect for beginners who want to master modern web development.",
    uploader: "Code Academy",
    videoUrl: "https://www.youtube.com/watch?v=example4",
    thumbnail: "https://i.ytimg.com/vi/bMknfKXIFA8/maxresdefault.jpg",
    duration: 3600,
    views: 15420,
    tags: ["react", "javascript", "programming", "tutorial"],
    category: "Education"
  },
  {
    title: "Node.js Full Course - Build REST API Tutorial",
    description: "Complete Node.js course covering Express.js, MongoDB, authentication, and building professional REST APIs from scratch.",
    uploader: "FreeCodeCamp",
    videoUrl: "https://www.youtube.com/watch?v=example5",
    thumbnail: "https://i.ytimg.com/vi/fBNz5xF-Kx4/maxresdefault.jpg",
    duration: 7200,
    views: 89340,
    tags: ["nodejs", "api", "backend", "javascript", "mongodb"],
    category: "Technology"
  },
  {
    title: "Amazing Nature Documentary - Wildlife in 4K",
    description: "Stunning 4K footage of wildlife from around the world. Experience the beauty of nature like never before.",
    uploader: "National Geographic",
    videoUrl: "https://www.youtube.com/watch?v=example6",
    thumbnail: "https://i.ytimg.com/vi/ks2e4o0HYnQ/maxresdefault.jpg",
    duration: 2400,
    views: 125600,
    tags: ["nature", "wildlife", "documentary", "4k"],
    category: "Documentary"
  }
];

const seedDatabase = async (clearExisting = false) => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clipverse';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    if (clearExisting) {
      // Clear existing data only if explicitly requested
      await Video.deleteMany({});
      await User.deleteMany({});
      console.log('Cleared existing data');
    } else {
      console.log('Preserving existing data - use clearExisting=true to override');
    }

    // Create sample user
    const sampleUser = new User({
      username: 'admin',
      email: 'admin@clipverse.com',
      password: 'admin123'
    });
    
    const savedUser = await sampleUser.save();
    console.log('Created sample user');

    // Add uploaderId to sample videos
    const videosWithUploaderId = sampleVideos.map(video => ({
      ...video,
      uploaderId: savedUser._id
    }));

    // Insert sample videos
    await Video.insertMany(videosWithUploaderId);
    console.log(`Inserted ${sampleVideos.length} sample videos`);

    console.log('Database seeded successfully!');
    console.log('Sample user credentials:');
    console.log('Email: admin@clipverse.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
