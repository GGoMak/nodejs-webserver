const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const Gallery = require('../schemas/gallery');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

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
      author: req.user.id,
    });
    res.redirect('/gallery');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete('/:id', isLoggedIn, async (req, res, next) => {
    try{
        await Gallery.deleteOne({
            _id: req.params.id,
        });
        res.end('{"success" : "Gallery Deleted Successfully", "status" : 200}')
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;
