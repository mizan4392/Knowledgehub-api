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