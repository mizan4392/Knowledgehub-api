const {db,admin} = require('../util/admin');
const firebaseConfig = require('../util/firebaseConfig');
const firebase = require('firebase');
const BusBoy = require('busboy');
const path = require('path');
const os = require('os');
const fs = require('fs');

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

    const noImg = 'no-img.png'
    
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
                imageUrl:`https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${noImg}?alt=media`,
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

exports.uplodImage = (req,res) =>{
    const busboy = new BusBoy({headers:req.headers});

    let imgFileName,imgToBeUploded;
    busboy.on('file',(fieldName,file,fileName,encoding,mimetype) =>{

        if(mimetype !== 'image/jpeg' && mimetype !== 'image/png'){
            return res.status(400).json({error:'Wrong file type try jpeg or png'})
        }
        const imgExt = fileName.split('.')[fileName.split('.').length -1];
         imgFileName = `${Math.round(Math.random()*1000000000)}.${imgExt}`;
        const filePath = path.join(os.tmpdir(),imgFileName);

        imgToBeUploded = {filePath,mimetype};

        file.pipe(fs.createWriteStream(filePath));
    });
    busboy.on('finish',()=>{
        admin.storage().bucket().upload(imgToBeUploded.filePath,{
            resumable:false,
            metadata:{
                metadata:{
                    contentType:imgToBeUploded.mimetype
                }
            }
        })
        .then(() =>{
            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imgFileName}?alt=media`;
            return db.doc(`/users/${req.user.userName}`).update({imageUrl});
        })
        .then(()=>{
            return res.json({massege:'Image Uploded sucessfully'})
        })
        .catch(err =>{
            console.error(err);
            return res.status(500).json({error:err.code});
        })
    })
    busboy.end(req.rawBody);
}