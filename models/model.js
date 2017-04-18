var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// See http://mongoosejs.com/docs/schematypes.html

var memorySchema = new Schema({
	name: String,
	ID: [String],
	audio: String,
	image: String,
	dateAdded : { type: Date, default: Date.now }
})

// export 'Person' model so we can interact with it in other files
module.exports = mongoose.model('Memory',memorySchema);