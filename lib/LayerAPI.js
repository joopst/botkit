
var request = require('requestretry');

module.exports = function(configuration) {

    var api = {

        request: function(options, cb) {

            if (!options.headers) {
                options.headers = {
                    'content-type': 'application/json',
                    'accept': 'application/vnd.layer+json; version=3.0',
                    Authorization: 'Bearer ' + configuration.token
                };
            }

            request(options, function(err, res, body) {
                if (err && cb) {
                    console.log('send message err' + err);
                    return cb(err);
                }

                if (!body) {
                    console.log('Error parsing json response');
                    if (cb) { return cb('Error parsing json response'); }
                }

                if (body.error) {
                    console.log(body.error);
                    if (cb) { return cb(body.error); }
                }

                console.log('response.statusCode= ' + res.statusCode);

                // var json = JSON.parse(body);
                // console.log('response json: ' + json);

                if (cb) { 
                    cb(null, body);
                }
            });
        },

        sendMessage: function(conversationId, messageText, cb) {
            console.log('sending message...');

            var data = {
                sender_id: 'layer:///identities/98cbca5e-4152-4a10-9c90-dc5583a80e20',
                parts: [
                    { 
                        body: messageText,
                        mime_type: 'text/plain'
                    }
                ],
            };

            var conversationUuid = '0dec9175-aca2-4aee-99d7-b10a6f67670f'; // conversationId
            var uri = configuration.serviceUrl + configuration.appUuid + '/conversations/' + conversationUuid + '/messages';
            api.request({
                method: 'POST',
                json: true,
                body: data,
                uri: uri
            }, function(err, identity) {
                if (err) {
                    if (cb) {
                        cb(err);
                    }
                    return;
                }
                
            });
        },
    }
    
    return api;
};