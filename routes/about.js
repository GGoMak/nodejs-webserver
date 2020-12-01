const express = require('express');

const router = express.Router();

router.get('/', async (req, res, next) => {
    res.render('about', {
        title: 'about',
      });
});

module.exports = router;