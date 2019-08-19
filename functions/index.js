const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();
const firebase = require('firebase');


var firebaseConfig = {
    apiKey: "AIzaSyB3HXSw6PEh6p3C064Yllwf_nMZcyPjQzs",
    authDomain: "knowledgehub-67e03.firebaseapp.com",
    databaseURL: "https://knowledgehub-67e03.firebaseio.com",
    projectId: "knowledgehub-67e03",
    storageBucket: "knowledgehub-67e03.appspot.com",
    messagingSenderId: "1060790817925",
    appId: "1:1060790817925:web:32f2937bc52953cd"
  };


//initializing firebase admin
admin.initializeApp();
firebase.initializeApp(firebaseConfig);


app.get('/posts',(req,res) =>{
    admin.firestore().collection('posts').orderBy('createdAt','desc').get()
    .then(data =>{
        let posts = []
        data.forEach(doc =>{
            posts.push({
                postId:doc.id,
                body:doc.data().body,
                userName:doc.data.userName,
                createdAt:doc.data().createdAt
            });
        });

        return res.json(posts);
    })
    .catch(err => console.error(err));
});

app.post('/post',(req,res) => {

    const newPost = {
        body:req.body.body,
        userName:req.body.userName,
        createdAt:new Date().toISOString()
    }

    console.log('new post = ',newPost);
    console.error('new post = ',newPost.body);

    admin
        .firestore()
        .collection('posts').
        add(newPost)
        .then((doc) =>{
            res.json({massege: `document ${doc.id} created Sucessfully`})
        })
        .catch((err) =>{
            res.status(500).json({error:'someting went wrong'});
            console.error(err);
        })
});


//Signup route


exports.api = functions.https.onRequest(app);

