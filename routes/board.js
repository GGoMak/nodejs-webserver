const express = require('express');

const { isLoggedIn } = require('./middlewares');
const Board = require('../schemas/board');
const User = require('../schemas/user');
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

router.get('/modify/:id', async (req, res, next) => {
  try{
    const boards = await Board.findOne({ _id: req.params.id });
    res.render('modifyboard',{
      title: 'modifyboard',
      boards: boards,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.put('/modify/:id', async (req, res, next) => {
  try {
    const hashtags = req.body.content.match(/#[^\s#]*/g);
    const result = await Board.update({
        _id: req.params.id,
    }, {
        title: req.body.title,
        content: req.body.content,
        hashtags: hashtags,
        updatedAt: Date.now(),
    });
    res.status(201).json(result);
} catch (error) {
    console.error(error);
    next(error);
}
});

router.get('/search', async (req, res, next) => {
  const type = req.query.type;
  const keyword = req.query.keyword;
  
  try{

    if(!keyword) {
      throw new Error("검색어를 입력해주세요.");
    }

    if(type === 'id'){
      let users = [];
      users = await User.find({ email: keyword });
      boards = await Board.find({ author: users }).populate('author').sort({ createdAt: -1 });
      res.render('board', {
        title: 'board',
        boards: boards,
      });
    }

    else if(type === 'nickname'){
      let users = [];
      users = await User.find({ nick: keyword });
      boards = await Board.find({ author: users }).populate('author').sort({ createdAt: -1 });
      res.render('board', {
        title: 'board',
        boards: boards,
      });
    }

    else if(type === 'content'){
      let boards = [];
      boards = await Board.find({ content: { $regex: keyword }}).populate('author').sort({ createdAt: -1 });
      res.render('board', {
        title: 'board',
        boards: boards,
      });
    }

    else if(type === 'hashtag'){
      let searchKeyword = '#' + keyword
      let boards = await Board.find({ hashtags: { $in : searchKeyword} }).populate('author').sort({createdAt : -1});
      res.render('board', {
        title: 'board',
        boards: boards,
      });
    }
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.post('/', isLoggedIn, async (req, res, next) => {
  try {

    const hashtags = req.body.content.match(/#[^\s#]*/g);

    const board = await Board.create({
      title: req.body.title,
      content: req.body.content,
      author: req.user,
      hashtags: hashtags,
    });

    res.redirect('/board');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.route('/:id')
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