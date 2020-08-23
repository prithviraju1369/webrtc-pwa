const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
const accountSid = 'AC8567f370ce182917f4ff253b07e9a303';
const authToken = 'test123';
const client = require('twilio')(accountSid, authToken);
let ice;

client.tokens.create().then(token => {
  ice = token.ice_servers;
}).catch(err => console.log(err));

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room, ice: ice })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

server.listen(process.env.PORT || 3000,function(){
  console.log('listening at 3000');
});