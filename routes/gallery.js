const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const Gallery = require('../schemas/gallery');
const Hashtag = require('../schemas/hashtag');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

try {
  fs.readdirSync('uploads');
} catch (error) {
  console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
  fs.mkdirSync('uploads');
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'uploads/');
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get('/', async (req, res, next) => {
    try {
        const gallerys = await Gallery.find({}).populate('author').sort({ createdAt: -1 });
        res.render('gallery', {
          title: 'gallery',
          gallerys: gallerys,
        });
      } catch (err) {
        console.error(err);
        next(err);
      }

});

router.get('/search', async (req, res, next) => {
  const keyword = req.query.keyword;

  try{
    const gallerys = await Gallery.find({ content: { $regex: keyword}}).populate('author').sort({ createdAt: -1});
    res.render('gallery', {
      title: 'gallery',
      gallerys: gallerys,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 미리보기 이미지 업로드
router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
  console.log(req.file.filename);
  res.json({ url: `/img/${req.file.filename}` });
});

// 사진 업로드
const upload2 = multer();
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {
  try {
    const gallery = await Gallery.create({
      img: req.body.url,
      content: req.body.content,
      author: req.user.id,
    });

    const hashtags = req.body.content.match(/#[^\s#]*/g);
    
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map(tag => {
          return Hashtag.findOrCreate({
            title: tag.slice(1).toLowerCase(),
          });
        }),
      );
    }
    res.redirect('/gallery');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.route('/:id')
  .put(upload2.none(), async (req, res, next) => {
    try {
      const result = await Gallery.update({
        _id: req.params.id,
      }, {
        img: req.body.url,
      });
      res.status(201).json(result);
    } catch (error) {
      console.error(error);
      next(error);
    }
  })
  .delete(async (req, res, next) => {
    try{
      const result = await Gallery.remove({
        _id: req.params.id,
      });
      res.status(201).json(result);
    } catch (error) {
      console.error(error);
      next(error);
    }
  });

module.exports = router;
