var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = require('./user');

var schema = new Schema({
    content: {type: String, required: true},
    user: {type: Schema.Types.ObjectId, ref: 'User'}
});

schema.post('remove', (message)=>{//execute whenver a message was remove
    User.findById(message.user, (err, user)=>{
        user.messages.pull(message);
        user.save();
    })
})

module.exports = mongoose.model('Message', schema);

