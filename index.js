
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const Cloudant = require('@cloudant/cloudant');
//const {table} = require('table');

var app = express();

var creds = {
    'account': process.env.IAM_USER,
    'password': process.env.IAM_PW
}

var cloudant = new Cloudant(creds)

var scores = cloudant.db.use('brownbot-stats')

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Make a POST request to webhook
function postMessage(body){
    axios({
        method: 'post',
        //url: 'redacted', // <--- #test
        url: 'redacted', // <--- #general
        data: body
    });
}

async function getUserProfile(raw_name){
    const response = await axios.get('https://slack.com/api/users.info?token=' + process.env.SLACK_TOKEN + '&user=' + raw_name);
    return response.data
}

function giveKudos(giver, receiver, args){

    if (giver == receiver) {
        // TODO: poop mouth
        postMessage({
            'text': '<@' + giver + '> pooped themselves!'
        });

        return 'You can\'t give poop to yourself!'

    } else {
        var reason = args.join(' ')

        if (reason == '') {
            reason = 'No reason given.'
        }

        scores.get(giver, function (err, body) {
            if (typeof body == 'undefined') {
                scores.insert({ 'poop_given': 1, 'poop_received': 0 }, giver);
            } else {
                body.poop_given++;
                scores.insert(body, giver);
            }
        });

        scores.get(receiver, function (err, body) {
            if (typeof body == 'undefined') {
                scores.insert({ 'poop_given': 0, 'poop_received': 1 }, receiver)
            } else {
                body.poop_received++;
                scores.insert(body, receiver);
            }
        });

        postMessage({
            'text': '<@' + giver + '> has given a 💩 to <@' + receiver + '>!\n*Reason:* ' + reason
        });
        return
    }
}

app.post('/', async function (req, res) {
    // TODO Change channel name to 'general' when push to prod
    if(req.body.channel_name != 'general'){
        res.send("Sorry! It looks like I can't operate in this conversation. Blame Ethan!");
    }else{
        if (req.body.text == '' || req.body.text == 'help'){
            res.send({'text': 'Thanks for using brownbot!  The following commands are acceptable:\n `@user [message]` `dance` `help` `ping` `stats`'})
        }else if (req.body.text == 'ping'){
            res.send({'text':'Thanks for pinging brownbot! This is a test message.'});
        }else if(req.body.text == 'dance'){
            postMessage({
                'attachments': [ {
                    'title': 'What did you honestly expect?',
                    'image_url': 'https://media.giphy.com/media/cSmwcTzp96ocU/giphy.gif' } ] 
                });
            res.send()
        }else if (req.body.text == 'stats'){

            scores.get(req.body.user_id, function (err, data) {
                if (data) {
                    var out_str = '*Shits Given:* ' + data.poop_given + ' *Shits Received:* ' + data.poop_received + ' *Difference:* ' + (data.poop_received - data.poop_given)
                    res.send({ 'text': out_str })
                } else {
                    res.send({ 'text': 'You haven\'t given or received a 💩 yet!' })
                }

            });

            // TODO: figure this tf out
            // await scores.list({ include_docs: true }, async function (err, body) {

            //     var board = [['Name', 'Shits Given', 'Shits Recieved', 'Difference']]
            //     table_config = {
            //         columns: {
            //             0: {
            //                 alignment: 'left',
            //                 minWidth: 10
            //             },
            //             1: {
            //                 alignment: 'right',
            //                 minWidth: 10
            //             },
            //             2: {
            //                 alignment: 'right',
            //                 minWidth: 10
            //             },
            //             3: {
            //                 alignment: 'right',
            //                 minWidth: 10
            //             }
            //         }
            //     };

            //     for (var i = 0; i < body.rows.length; ++i) {
            //         temp = body.rows[i].doc;
            //         temp.poop_diff = temp.poop_received - temp.poop_given;
            //         board.push([await getUserProfile(temp._id).catch(function () {
            //             console.log("Promise Rejected");
            //         }).user.profile.display_name, temp.poop_given, temp.poop_received, temp.poop_diff])
            //     }

            //     board.sort(function (x, y) {
            //         for (var i = 2; i < 4; ++i) {
            //             if (x[i] > y[i]) {
            //                 return -1;
            //             }
            //             if (x[i] < y[i]) {
            //                 return 1;
            //             }
            //         }
            //         return 0;
            //     });

            //     var output = await table(board, table_config).catch(function () {
            //         console.log("Promise Rejected");
            //     });

            //     res.send({'text': '```' + output + '```'});

            // }).catch(function () {
            //     console.log("Promise Rejected");
            // });

        }else{
            var args = req.body.text.split(' ');
            var raw_receiver = args[0].split('|')[0];
            var receiver = raw_receiver.substring(2, raw_receiver.length);
            var giver = req.body.user_id;

            if(!(await getUserProfile(receiver)).ok){
                res.send({'text': 'User does not exist, stop trying to break my bot!'})
            }else{
                var return_val = giveKudos(giver, receiver, args.slice(1, args.length))

                if (return_val) {
                    res.send({ 'text': return_val });
                } else {
                    res.send()
                }
            }
        }
        //res.send({'text':'How did you get here?? This is a bug, please let Ethan know about it'});
    }
});

var real_port = process.env.PORT || 8080;

var server = app.listen(real_port, function () {
    var port = server.address().port;
    console.log('brownbot app listening on port %s', port);
});