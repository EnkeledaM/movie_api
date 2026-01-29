const mongoose = require('mongoose');

// Movie Schema
let movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
 
  Genre: {
  Name: { type: String, required: true },
  Description: { type: String, required: true }
},
Director: {
  Name: { type: String, required: true },
  Bio: { type: String, required: true },
  BirthYear: Number,
DeathYear: Number

},

  ImagePath: String,
  Featured: Boolean
});

// User Schema
let userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]

});

// Models
let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

// Exports
module.exports.Movie = Movie;
module.exports.User = User;
