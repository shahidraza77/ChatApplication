
  var fs = require('fs'),//Modules for file operation
    path = require('path'),//The Path module provides a way of working with directories and file paths
    sio = require('socket.io')(app),//Socket.IO enables real-time bidirectional event-based communication
   static = require('node-static'); //node-static understands and supports conditional GET and HEAD requests

  var app = require('http').createServer(handler);//The HTTP module create an HTTP server that listens to server ports and gives a response back to the client.
  app.listen(8000);
  
  //Create a node-static server instance to serve the 'public' folder
  var file = new static.Server(path.join(__dirname, '..', 'public'));

  function handler(req, res) {
    file.serve(req, res);
  }
  console.log("startes server at 8000")

  var io = sio.listen(app),
    nicknames = {};

  io.sockets.on('connection', function (socket) {

    socket.on('user message', function (msg) {
      socket.broadcast.emit('user message', socket.nickname, msg);
    });

    socket.on('user image', function (msg) {
      console.log(msg);
      socket.broadcast.emit('user image', socket.nickname, msg);
    });

    socket.on('nickname', function (nick, fn) {
      if (nicknames[nick]) {

        fn(true);
      }
      else {

        fn(false);
        nicknames[nick] = socket.nickname = nick;
        socket.broadcast.emit('announcement', nick + ' connected');
        io.sockets.emit('nicknames', nicknames);
      }
    });

    socket.on('disconnect', function () {

      if (!socket.nickname) {

        return;
      }

      delete nicknames[socket.nickname];
      socket.broadcast.emit('announcement', socket.nickname + ' disconnected');
      socket.broadcast.emit('nicknames', nicknames);
    });
  });
