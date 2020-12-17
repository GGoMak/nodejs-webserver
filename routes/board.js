const express = require('express');

const { isLoggedIn } = require('./middlewares');
const Board = require('../schemas/board');
const User = require('../schemas/user');
const Hashtag = require('../schemas/hashtag');
const { patch } = require('./gallery');

const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

router.get('/', async (req, res, next) => {

  try {
    const boards = await Board.find({}).populate('author').sort({ createdAt: -1 });
    res.render('board', {
      title: 'board',
      boards: boards,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/search', async (req, res, next) => {
  const type = req.query.type;
  const keyword = req.query.keyword;

  if(!keyword) {
    return res.redirect('/board');
  }

  if(type === "id"){
    try{
      let users = [];
      users = await User.find({ email: keyword });
      boards = await Board.find({ author: users }).populate('author').sort({ createdAt: -1 });
      res.render('board', {
        title: 'board',
        boards: boards,
      });
    } catch (error) {
      console.error(error);
      return next(error)
    }
  }

  else if(type === "nickname") {
    try {
      let users = [];
      users = await User.find({ nick: keyword });
      boards = await Board.find({ author: users }).populate('author').sort({ createdAt: -1 });
      res.render('board', {
        title: 'board',
        boards: boards,
      });
    } catch (error) {
      console.error(error);
      return next(error);
    }
  }
  
  else if(type === "content") {
    try {
      let boards = [];
      boards = await Board.find({ content: { $regex: keyword }}).populate('author').sort({ createdAt: -1 });
      res.render('board', {
        title: 'board',
        boards: boards,
      });
    } catch (error) {
      console.error(error);
      return next(error);
    }
  }

  else if(type === "hashtag") {
    try {
      let hashtags = await Hashtag.findOne({ title: keyword });
      let boards = []

      if(!hashtags){
        res.render('board', {
          title: 'board',
          boards: [],
        })
        return;
      }
      
      for(let i = 0; i < hashtags.boards.length; i++){
        boards.push(await Board.findOne({ _id: hashtags.boards[i] }).populate('author'));
      }

      res.render('board', {
        title: 'board',
        boards: boards,
      });
    } catch (error) {
      console.error(error);
        return next(error);
    }
  }
})

router.post('/', isLoggedIn, async (req, res, next) => {
  try {
    const board = await Board.create({
      title: req.body.title,
      content: req.body.content,
      author: req.user,
      
    });

    const hashtags = req.body.content.match(/#[^\s#]*/g);
    
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map(async tag => {
          let str = tag.slice(1).toLowerCase();
          const res = await Hashtag.findOne({ title : str });
          
          if(res){
            return Hashtag.findOneAndUpdate(
              { title: str },
              { $push: { boards: board } });
          }
          else{
            return Hashtag.create({
              title: tag.slice(1).toLowerCase(),
              boards: board,
            })
          }
        })
      );
    }
    res.redirect('/board');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.route('/:id')
  .put(async(req, res, next) => {
    try {
        const result = await Board.update({
            _id: req.params.id,
        }, {
            title: req.body.title,
            content: req.body.content,
        });
        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        next(error);
    }
  })
  .delete(async(req, res, next) => {
    try {
        const result = await Board.remove({
            _id: req.params.id,
        });
        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        next(error);
    }
  });

module.exports = router;