var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var User = require('../models/user');

router.post('/', (req, res, next)=>{
    var user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password,10)
    });
    user.save((err, result)=>{
        if(err){
            if(err.name==='ValidationError'){
               return res.status(500).json({
                   title: 'Error',
                   error: {message:'Email Already exist'}
               }) 
            }
            return res.status(500).json({
                title: 'An error occured!',
                error: err
            });
        }
        res.status(201).json({
            message: 'User created!',
            obj: result
        });
    });
});

router.post('/signin', (req, res, next)=>{
    User.findOne({email: req.body.email}, (err, user)=>{
        if(err){
            return res.status(500).json({ //internal server error
                title: 'An error occured!',
                error: err
            });
        }
        if(!user){
            return res.status(500).json({ //OK
                title: 'Login Failed',
                error: {message: 'Invalid login credentials'}
            });
        }
        if(!bcrypt.compareSync(req.body.password, user.password)){
             return res.status(401).json({ //unauthorized
                title: 'Login Failed',
                error: {message: 'Invalid login credentials'}
            });
        }
        var token = jwt.sign({ user: user }, 'secret', {expiresIn: '1h'}); //create a token expires in an hour
        res.status(200).json({
            message: 'Successfully logged in!',
            token: token,
            userId: user._id
        });
    })
});

module.exports = router;