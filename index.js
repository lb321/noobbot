const Discord = require('discord.js');
const client = new Discord.Client();
const snekfetch = require('snekfetch');

const token = "NDU4NjA1MjE2MTYyNTEyOTI4.DgqGXA.eSEo8TYjJ5q7bRDCu-N0brI6qMc";
let reddits = {
  nl: 'https://www.reddit.com/r/cirkeltrek/new/.json',
  twice: 'https://www.reddit.com/r/twice/new/.json'
};
let berichten = {

}
client.on('ready', () => {
  console.log(`Successfully Logged in as ${client.user.tag}!`);
  client.user.setActivity('.help')
});

client.on('message', msg => {
  const arguments = msg.content.split(" ");
  const command = arguments.shift();
  const content = arguments.join(" ");
  if(!berichten[msg.author.username])
    berichten[msg.author.username] = 0;
  berichten[msg.author.username] += 1;
  switch(command) {
    case '.ping':
      msg.reply('Pong!');  
      return;
    case ".help":
      msg.channel.send("Available commands: '.ping', '.help', '.kpop', '.add <prefix> <redditurl>/.json', '.rdm', '.reddits'");
      return;
    case '.echo':
      msg.channel.send(content);  
      return;
    case '.add':
      const key = arguments.shift();
      reddits[key] = arguments.shift();
      return;
    case '.rdm':
      if(arguments.length >= 1){
        sendRandomRedditPost(reddits[arguments.shift()], msg);
      }
      return;
    case '.reddits':
      msg.channel.send(JSON.stringify(reddits));
      return; 
    case '.mcount':
      msg.channel.send(JSON.stringify(berichten));
      return;
    case '.kpop':
      sendRandomRedditPost('https://www.reddit.com/r/kpics/new/.json', msg);
      return;
    case '.urbandict':
      getRequest('https://api.urbandictionary.com/v0/define?term=' + arguments.join(" "))
      .then((data) =>{
          const body = JSON.parse(data);
          if (body.result_type === 'no_results') {
            return msg.channel.send(`No results found`);
          }
          return msg.channel.send(body.list[0].definition);
      })
      .catch((err) => {
        msg.channel.send(err);
      });
      return;
  }
});

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sendRandomRedditPost(url, msg) {
  getRequest(url).then((data) => {
      try {
        const parsedData = JSON.parse(data);
        const children = parsedData.data.children;
        msg.channel.send(children[getRandomInt(0, children.length - 1)].data.url);
        
      } catch (e) {
        msg.channel.send(e.message);
      }
  }).catch((err) => {
      msg.channel.send(err);
  });
  /*https.get(url, (res) => {
    const { statusCode } = res;
    const contentType = res.headers['content-type'];

    let error;
    if (statusCode !== 200) {
      error = new Error('Request Failed.\n' +
                        `Status Code: ${statusCode}`);
    } else if (!/^application\/json/.test(contentType)) {
      error = new Error('Invalid content-type.\n' +
                        `Expected application/json but received ${contentType}`);
    }
    if (error) {
      console.error(error.message);
      // consume response data to free up memory
      res.resume();
      return;
    }

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(rawData);
        const children = parsedData.data.children;
        msg.channel.send(children[getRandomInt(0, children.length - 1)].data.url);
        
      } catch (e) {
        console.error(e.message);
      }
    });
  }).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
  });*/
}

function getRequest(url) {
  return new Promise(function (resolve, reject) {
    https.get(url, (res) => {
      const { statusCode } = res;
      const contentType = res.headers['content-type'];

      if (statusCode !== 200) {
        res.resume();
        reject('Request Failed.\n' +
                          `Status Code: ${statusCode}`);
      } else if (!/^application\/json/.test(contentType)) {
        res.resume();
        reject('Invalid content-type.\n' +
                          `Expected application/json but received ${contentType}`);
      } else {
        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          resolve(rawData);
        });
      }
    }).on('error', (e) => {
      reject(e.message);
    });
  });
}

//https://discordapp.com/oauth2/authorize?client_id=123456789012345678&scope=bot
  
client.login(token);