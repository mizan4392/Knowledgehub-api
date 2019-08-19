const functions = require('firebase-functions');
const app = require('express')();

const {getAllPosts,newPost,getPost,commentOnPost} =require('./routes/post');
const {signup,login,uplodImage,addUserDetails,getAuthenticatedUser} = require('./routes/user');
const {FBAuth} = require('./util/FBAuth');



app.get('/posts',getAllPosts);
app.post('/post',FBAuth,newPost);
app.get('/post/:postId', getPost);
app.post('/post/:postId/comment', FBAuth, commentOnPost);


//Signup route
app.post('/signup',signup);
//login
app.post('/login',login);
app.post('/user/image',FBAuth,uplodImage);
app.post('/user',FBAuth,addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);







exports.api = functions.https.onRequest(app);

