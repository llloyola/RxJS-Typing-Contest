const net = require('net');

const server = net.createServer((socket) => {
  console.log('Connection from', socket.remoteAddress, 'port', socket.remotePort);

  socket.on('data', (buffer) => {
    console.log('Request from', socket.remoteAddress, 'port', socket.remotePort);
    /* Hacer manejo de msg, dependiendo de lo que sea */
    let msg = buffer.toString('utf-8');
    console.log(msg, "-AAAAAAAH");
    if (msg == "hola") {
        socket.write(`chao\n`);
    }
    else {
        socket.write("Mejor dime hola\n");
    }
  });
  socket.on('end', () => {
    console.log('Closed', socket.remoteAddress, 'port', socket.remotePort);
  });
});

server.maxConnections = 3;
server.listen(12000);