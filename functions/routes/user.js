const {db} = require('../util/admin');
const firebaseConfig = require('../util/firebaseConfig');
const firebase = require('firebase');
const { validateSignupData,validateLoginData } = require('../util/validators');
firebase.initializeApp(firebaseConfig);

exports.signup = (req,res) =>{
    const newUser ={
        email:req.body.email,
        password:req.body.password,
        confirmPassword:req.body.confirmPassword,
        userName:req.body.userName
    }

    const {valid,errors} = validateSignupData(newUser);
    if(!valid) return res.status(400).json(errors);

    
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
}

exports.login =(req,res)=>{
    const user = {
        email:req.body.email,
        password:req.body.password
    }

    const {valid,errors} = validateLoginData(user);
    if(!valid) return res.status(400).json(errors);


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
    
}