const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const Board = require('../schemas/board');
const User = require('../schemas/user');

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

router.post('/', isLoggedIn, async (req, res, next) => {
    try {
      const post = await Board.create({
        title: req.body.title,
        content: req.body.content,
        author: req.user,
      });
      res.redirect('/board');
    } catch (error) {
      console.error(error);
      next(error);
    }
});

router.put('/:id', isLoggedIn, async(req, res, next) => {

    console.log("id" + req.params.id);
    console.log("title" + req.body.title);
    console.log("content" + req.body.content);

    try {
        await Board.updateOne({
            _id: req.params.id,
        }, {
            title: req.body.title,
            content: req.body.content,
        });
        res.end('{"success" : "Updated Successfully", "status" : 200}');
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.delete('/:id', isLoggedIn, async(req, res, next) => {
    try {
        await Board.deleteOne({
            _id: req.params.id,
        });
        res.end('{"success" : "Deleted Successfully", "status" : 200}');
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;