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

const db = admin.firestore();


const FBAuth = (req,res,next) =>{

    let idToken;
    if(req.headers.authorization && req.headers.authorization.startsWith('Auth ')){
      idToken = req.headers.authorization.split('Auth ')[1];
    }else{
      console.err('no Token found');
      return res.status(403).json({error : 'Unauthorized'});
    }
  
    admin.auth().verifyIdToken(idToken)
      .then(decodedToken =>{
        req.user = decodedToken;
        console.log(decodedToken);
        return db.collection('users')
          .where('userId', '==', req.user.uid)
          .limit(1)
          .get();
      })
      .then(data =>{
        req.user.userName = data.docs[0].data().userName;
        return next();
      })
      .catch(err =>{
        console.error('Error while verifying token',err);
        return res.status(400).json(err);
      })
  }


app.get('/posts',(req,res) =>{
    db.collection('posts').orderBy('createdAt','desc').get()
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

app.post('/post',FBAuth,(req,res) => {

    const newPost = {
        body:req.body.body,
        userName:req.user.userName,
        createdAt:new Date().toISOString()
    }

    console.log('new post = ',newPost);
    console.error('new post = ',newPost.body);

    db.collection('posts').add(newPost)
        .then((doc) =>{
            res.json({massege: `document ${doc.id} created Sucessfully`})
        })
        .catch((err) =>{
            res.status(500).json({error:'someting went wrong'});
            console.error(err);
        })
});



const isEmpty = (str) =>{
    if(str.trim() === '') return true;
    else return false;
}
const isEmail = (email)=>{
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(email.match(regEx)) return true;
    else return false;
}


//Signup route
app.post('/signup',(req,res) =>{
    const newUser ={
        email:req.body.email,
        password:req.body.password,
        confirmPassword:req.body.confirmPassword,
        userName:req.body.userName
    }
    // TODO: validate data

    let errors ={};

    if(isEmpty(newUser.email)){
      errors.email = 'Must not be empty'
    }else if (!isEmail(newUser.email)){
      errors.email = 'Must be a valid email address'
    }

    if(isEmpty(newUser.password)) errors.password = 'Must not be Empty';
    if(newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'Password must be match'
    if(isEmpty(newUser.userName)) errors.userName = 'Must not be Empty'

    if(Object.keys(errors).length > 0) return res.status(400).json(errors);

    let token,userId;
    db.doc(`/users/${newUser.userName}`).get()
        .then(doc =>{
            if(doc.exists){
                res.status(400).json({userName:'this username is already exists'})
            }else{
                return firebase.auth().createUserWithEmailAndPassword(newUser.email,newUser.password);
            }
        })
        .then(data=>{
            userId = data.user.uid;
            return data.user.getIdToken()
        })
        .then(idtoken =>{
            token = idtoken; 
            const userCredintial = {
                userName:newUser.userName,
                email:newUser.email,
                createdAt:new Date().toISOString(),
                userId
            }
            return db.doc(`/users/${newUser.userName}`).set(userCredintial);
            
        })
        .then(()=>{
            return res.status(201).json({token:token});
        })
        .catch(err=>{
            console.error(err);
            return res.status(400).json({error:err.code});
        })
})


//login

app.post('/login',(req,res)=>{
    const user = {
        email:req.body.email,
        password:req.body.password
    }
    let errors = {};

    if(isEmpty(user.email)) errors.email = 'Must not be empty';
    if(isEmpty(user.password)) errors.password = 'Must not be empty';
    if(Object.keys(errors).length > 0) return res.status(400).json(errors);

    firebase.auth().signInWithEmailAndPassword(user.email,user.password)
        .then(data =>{
            return data.user.getIdToken()
        })
        .then(token =>{
            return res.json({token:token})
        })
        .catch(err=>{
            console.error(err)
            return res.status(500).json({error:err.code})
        })
    
})


exports.api = functions.https.onRequest(app);

