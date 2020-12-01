const express = require('express');

const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

router.get('/', async (req, res, next) => {
  res.render('main', {
    title: 'NodeBird',
  });
});

router.get('/join', (req, res) => {
  res.render('join', { title: '회원가입' });
});

module.exports = router;