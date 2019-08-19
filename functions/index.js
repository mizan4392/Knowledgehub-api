const functions = require('firebase-functions');
const app = require('express')();

const {getAllPosts,newPost,getPost,commentOnPost,likeOnPost,unlikeOnPost,deletePost} =require('./routes/post');
const {signup,login,uplodImage,addUserDetails,getAuthenticatedUser} = require('./routes/user');
const {FBAuth} = require('./util/FBAuth');



app.get('/posts',getAllPosts);
app.post('/post',FBAuth,newPost);
app.get('/post/:postId', getPost);
app.delete('/post/:postId', FBAuth, deletePost);
app.post('/post/:postId/comment', FBAuth, commentOnPost);
app.get('/post/:postId/like', FBAuth, likeOnPost);
app.get('/post/:postId/unlike', FBAuth, unlikeOnPost);




//Signup route
app.post('/signup',signup);
//login
app.post('/login',login);
app.post('/user/image',FBAuth,uplodImage);
app.post('/user',FBAuth,addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);







exports.api = functions.https.onRequest(app);

