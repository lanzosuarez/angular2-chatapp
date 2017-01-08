var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

var User = require('../models/user');
var Message = require('../models/message');

router.get('/',(req, res ,next)=>{
    Message.find()//get all the messages
    .populate('user','firstName') //add the firstname pair to the returning object
    .exec((err, result)=>{
             if(err){
                return res.status(500).json({
                    title: 'An error occured',
                    error: err
                });
            }
            console.log(result);
            res.status(200).json({
                message: 'Succes',
                obj: result
            });
    })
});

router.use('/',(req, res, next)=>{ //verify if the token is valid
    jwt.verify(req.query.token, 'secret',(err, decoded)=>{
        if(err){
            return res.status(401).json({
                title: 'Unauthenticated Request',
                error: err
            });
        }
        next();
    })
});

router.post('/',(req, res, next)=>{ //add a message
    var decoded = jwt.decode(req.query.token);
    User.findById(decoded.user._id, (err, user)=>{
        console.log(user);
         if(err){
            return res.status(500).json({
                title: 'An error occured',
                error: err
            });
        }
        var message = new Message({
            content: req.body.content,
            user: user
        });
        message.save((err, result)=>{
            if(err){
                return res.status(500).json({
                    title: 'An error occured',
                    error: err
                });
            }
            user.messages.push(result);
            user.save();
            res.status(201).json({
                message: 'Message saved',
                obj: result //return the message saved
            });
        });
    });
});


router.patch('/:id', function (req, res, next) { //edit a message
    Message.findById(req.params.id, function (err, message) {
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            });
        }
        if (!message) {
            return res.status(500).json({
                title: 'No Message Found!',
                error: {message: 'Message not found'}
            });
        }
        message.content = req.body.content;
        message.save(function(err, result) {
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                });
            }
            res.status(200).json({
                message: 'Message Updated',
                obj: result
            });
        });
    });
});

router.delete('/:id', (req, res, next)=>{ //delete a message
    Message.findById(req.params.id, (err, message)=>{
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            });
        }
        if (!message) {
            return res.status(500).json({
                title: 'No Message Found!',
                error: {message: 'Message not found'}
            });
        }
        message.remove((err, result)=>{
             if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                });
            }
            res.status(200).json({
                message: 'Message Deleted',
                obj: result
            });
        });
    });
});


    
module.exports = router;

