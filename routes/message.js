const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const Room = require('../schemas/room');
const Chat = require('../schemas/chat');
const User = require('../schemas/user');
const { isLoggedIn } = require('./middlewares');
const { find } = require('../schemas/user');

const router = express.Router();

router.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

router.get('/', async (req, res, next) => {
    try {
      const rooms = await Room.find().or([{ receiver: req.user._id }, { sender: req.user._id }]);
      const nick = [];

      for(room in rooms){
        const name = await User.findById(room.sender);
        if(!name){
          nick.push(name);
        }
        else{
          const name = await User.findById(room.receiver);
          nick.push(name);
        }
      }

      res.render('message', { 
          title: 'message',
          rooms: rooms,
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
});

router.post('/', async (req, res, next) => {
  try {
    const receiver = await User.findOne({ nick: req.body.receiver });
    
    if(!receiver){
      throw new Error("사용자가 존재하지 않습니다.");
    }

    else if(receiver.nick === req.user.nick){
      throw new Error("자기 자신과는 대화할 수 없습니다.");
    }
    const title = req.user.nick + '님과 ' + receiver.nick + '님의 대화';

    const newRoom = await Room.findOrCreate({
      sender: req.user._id,
      receiver: receiver._id,
      title: title,
    });
    const io = req.app.get('io');
    io.of('/msg').emit('newRoom', newRoom);
    console.log(newRoom);
    res.redirect(`/msg`);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const room = await Room.findOne({ _id: req.params.id });
    const io = req.app.get('io');
    if (!room) {
      return res.redirect('/?error=존재하지 않는 방입니다.');
    }
    const chats = await Chat.find({ room: room._id }).populate('user').sort('createdAt');
    return res.render('chat', {
      room,
      title: room.title,
      user: req.user,
      chats,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.post('/:id/chat', async (req, res, next) => {
  try {
    const chat = await Chat.create({
      room: req.params.id,
      user: req.user,
      chat: req.body.chat,
    });
    req.app.get('io').of('/chat').to(req.params.id).emit('chat', chat);
    res.send('ok');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;