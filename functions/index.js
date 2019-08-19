const functions = require('firebase-functions');
const app = require('express')();

const {getAllPosts,newPost} =require('./routes/post');
const {signup,login,uplodImage} = require('./routes/user');
const {FBAuth} = require('./util/FBAuth');



app.get('/posts',getAllPosts);
app.post('/post',FBAuth,newPost);
//Signup route
app.post('/signup',signup);
//login
app.post('/login',login);
app.post('/user/image',FBAuth,uplodImage)






exports.api = functions.https.onRequest(app);

