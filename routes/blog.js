var express = require('express');
var router = express.Router();
const Blog = require("../data/Blog");
const jwt = require("jsonwebtoken");

/* GET home page. */
router.post('/save', async function(req, res, next) {
  try {
      const token = req.header("JWT");
      if(!token)
        throw "Giriş yapın."
      const user = jwt.verify(token, process.env.JWT_SECRET);
      if(req.body.title && req.body.content){
          const blogData = {
              title : req.body.title,
              content : req.body.title,
              description : req.body.description,
              created_by : user.id
          }
          const result = await Blog.create(blogData);
          res.json({
              blogId : result.id
          })
      }
  } catch (error) {
      res.status(500).json({
          error: error.message
      })
  }
});

router.get("/",async (req,res) => {
    try {

        const token = req.header("JWT");
        if(!token)
            throw "Giriş yapın";
        const user = jwt.verify(token,process.env.JWT_SECRET);
        const userId = user.id;

        const blogs = await Blog.find({created_by : userId});
        res.json({
            blogs
        })
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
})

module.exports = router;
