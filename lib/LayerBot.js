const Botkit = require(__dirname + '/CoreBot.js');
const LayerAPI = require(__dirname + '/LayerAPI.js');
var readline = require('readline');

function LayerBot(configuration) {

    // Create a core botkit bot
    layer_botkit = Botkit(configuration || {});

    layer_botkit.api = LayerAPI(configuration || {});

    layer_botkit.middleware.spawn.use(function(bot, next) {

        layer_botkit.listenStdIn(bot);
        next();
    });

    layer_botkit.middleware.format.use(function(bot, message, platform_message, next) {
        // clone the incoming message
        for (var k in message) {
            platform_message[k] = message[k];
        }

        next();
    });

    layer_botkit.defineBot(function(botkit, config) {

        var bot = {
            botkit: botkit,
            config: config || {},
            utterances: botkit.utterances,
        };

        bot.createConversation = function(message, cb) {
            botkit.createConversation(this, message, cb);
        };

        bot.startConversation = function(message, cb) {
            botkit.startConversation(this, message, cb);
        };

        bot.send = function(message, cb) {
            layer_botkit.api.sendMessage(message.conversation, message.text, cb);
        };

        bot.reply = function(src, resp, cb) {
            var msg = {};

            if (typeof(resp) == 'string') {
                msg.text = resp;
            } else {
                msg = resp;
            }

            msg.channel = src.channel;

            bot.say(msg, cb);
        };

        bot.findConversation = function(message, cb) {
            botkit.debug('CUSTOM FIND CONVO', message.user, message.channel);
            for (var t = 0; t < botkit.tasks.length; t++) {
                for (var c = 0; c < botkit.tasks[t].convos.length; c++) {
                    if (
                        botkit.tasks[t].convos[c].isActive() &&
                        botkit.tasks[t].convos[c].source_message.user == message.user
                    ) {
                        botkit.debug('FOUND EXISTING CONVO!');
                        cb(botkit.tasks[t].convos[c]);
                        return;
                    }
                }
            }

            cb();
        };

        return bot;

    });

    layer_botkit.setupWebserver(configuration.port,function(err,webserver) {
        webserver.get('/webhook-endpoint',function(req,res) {

          res.send(req.query.verification_challenge);
        });
      });
          
    layer_botkit.listenStdIn = function(bot) {

        layer_botkit.startTicking();
        var rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
        rl.on('line', function(line) {
            var message = {
                text: line,
                user: 'user',
                channel: 'text',
                timestamp: Date.now()
            };

            layer_botkit.ingest(bot, message, null);

        });
    };

    return layer_botkit;
};

module.exports = LayerBot;