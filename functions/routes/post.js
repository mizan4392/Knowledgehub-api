const {db} = require('../util/admin');

exports.getAllPosts = (req,res) =>{
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
}

exports.newPost = (req,res) => {

    const newPost = {
        body:req.body.body,
        userName:req.user.userName,
        createdAt:new Date().toISOString()
    }

    console.log('new post = ',newPost);


    db.collection('posts').add(newPost)
        .then((doc) =>{
            res.json({massege: `document ${doc.id} created Sucessfully`})
        })
        .catch((err) =>{
            res.status(500).json({error:'someting went wrong'});
            console.error(err);
        })
}

exports.getPost = (req,res) =>{
    let postData = {};
  db.doc(`/posts/${req.params.postId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'post not found' });
      }
      postData = doc.data();
      postData.postId = doc.id;
      return db
        .collection('comments')
        .orderBy('createdAt', 'desc')
        .where('postId', '==', req.params.postId)
        .get();
    })
    .then((data) => {
      postData.comments = [];
      data.forEach((doc) => {
        postData.comments.push(doc.data());
      });
      return res.json(postData);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
}

exports.commentOnPost = (req,res)=>{

    if (req.body.body.trim() === '')
    return res.status(400).json({ comment: 'Must not be empty' });

  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    postId: req.params.postId,
    userName: req.user.userName,
    userImage: req.user.imageUrl
  };

  db.doc(`/posts/${req.params.postId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Scream not found' });
      }
      return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
    })
    .then(() => {
      return db.collection('comments').add(newComment);
    })
    .then(() => {
      res.json(newComment);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: 'Something went wrong' });
    });
}