var mongoose = require('mongoose');
var BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    created_at : {
        type: Date,
        default : Date.now()
    },
    created_by: {
        type: mongoose.Types.ObjectId,
        required: true
    }
});

var Blog = mongoose.model('Blog', BlogSchema);
module.exports = Blog;