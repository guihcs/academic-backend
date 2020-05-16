
let socketio = require('socket.io');

let io;

function setup(server){
    io = socketio(server);
    let np = io.of('/nspace');
    np.on('connection', socket => {


    })
    io.on('connection', socket => {

    });
}





module.exports = setup;
