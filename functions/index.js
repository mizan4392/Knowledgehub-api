const functions = require('firebase-functions');
const app = require('express')();

const {getAllPosts,newPost} =require('./routes/post');
const {signup,login} = require('./routes/user');
const {FBAuth} = require('./util/FBAuth');



app.get('/posts',getAllPosts);
app.post('/post',FBAuth,newPost);
//Signup route
app.post('/signup',signup);
//login
app.post('/login',login)






exports.api = functions.https.onRequest(app);

