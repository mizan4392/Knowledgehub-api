const {admin,db} = require('./admin');

exports.FBAuth = (req,res,next) =>{

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
        req.user.imageUrl = data.docs[0].data().imageUrl
        return next();
      })
      .catch(err =>{
        console.error('Error while verifying token',err);
        return res.status(400).json(err);
      })
  }