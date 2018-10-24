
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const Cloudant = require('@cloudant/cloudant');
const {table} = require('table');

var app = express();

var IAM ={ "apikey": "Q6ThqJYYw1xtmrLCtfV7S3A-WOPBQkxrkzuJ3z2Obb-o",
        "host": "4e0f03ac-45f9-46ae-b211-c1b19438a4f4-bluemix.cloudant.com",
        "iam_apikey_description": "Auto generated apikey during resource-key operation for Instance - crn:v1:bluemix:public:cloudantnosqldb:us-south:a/c49aeb28e28ce4ad4698bbe8a965bdaf:ff6ddf6e-f395-4093-b2ea-89971125668a::",
        "iam_apikey_name": "auto-generated-apikey-e63c78a6-34d3-4321-b841-a291b3b76a98",
        "iam_role_crn": "crn:v1:bluemix:public:iam::::serviceRole:Manager",
        "iam_serviceid_crn": "crn:v1:bluemix:public:iam-identity::a/c49aeb28e28ce4ad4698bbe8a965bdaf::serviceid:ServiceId-62a1f62d-4431-42c7-97f9-b510679c1d0e",
        "password": "caa288fe74c197dee530bb833f33c70d4ab176735529fa333c12970a86893d3a",
        "port": 443,
        "url": "https://4e0f03ac-45f9-46ae-b211-c1b19438a4f4-bluemix:caa288fe74c197dee530bb833f33c70d4ab176735529fa333c12970a86893d3a@4e0f03ac-45f9-46ae-b211-c1b19438a4f4-bluemix.cloudant.com",
        "username": "4e0f03ac-45f9-46ae-b211-c1b19438a4f4-bluemix"
    }

var creds = {
    'account': IAM.username,
    'password': IAM.password
}

var cloudant = new Cloudant(creds)

var scores = cloudant.db.use('brownbot-stats')

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Make a POST request to webhook
function postMessage(body){
    axios({
        method: 'post',
        url: 'https://hooks.slack.com/services/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', // <--- #test
        //url: 'https://hooks.slack.com/services/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', // <--- #general
        data: body,
        headers: {
            'Content-Type': 'application/json'}
    });
}

async function getDisplayName(raw_name){
    const response = await axios.get('https://slack.com/api/users.info?token=xoxp-425527920966-424575050611-462489320466-804d2943803d73a99544bf2427ac6335&user=' + raw_name);
    return response.data.user.profile.display_name;
}

async function postStats(res){

    scores.list({ include_docs: true }, async function (err, body) {

        var board = [['Name', '💩 Given', '💩 Recieved', '💩 Difference']]
        table_config = {
            columns: {
                0: {
                    alignment: 'left',
                    minWidth: 10
                },
                1: {
                    alignment: 'right',
                    minWidth: 10
                },
                2: {
                    alignment: 'right',
                    minWidth: 10
                },
                3: {
                    alignment: 'right',
                    minWidth: 10
                }
            }
        };

        for (var i = 0; i < body.rows.length; ++i) {
            temp = body.rows[i].doc;
            temp.poop_diff = temp.poop_received - temp.poop_given;
            board.push([await getDisplayName(temp._id), temp.poop_given, temp.poop_received, temp.poop_diff])
        }

        board.sort(function (y, x) {
            for(var i = 2; i < 4; ++i){
                if (x[i] < y[i]) {
                    return -1;
                }
                if (x[i] > y[i]) {
                    return 1;
                }
            }
            return 0;
        });

        
        var output = await table(board, table_config);
        res.send(output);
        
    });

}

function giveKudos(giver, receiver, args){

    if (giver == receiver) {
        // TODO: poop mouth
        postMessage({
            'text': '<@' + giver + '> pooped themselves!'
        });
        res.send('You can\'t give poop to yourself!');
    } else {
        var reason = '';

        for (var i = 1; i < args.length; ++i) {
            reason += (args[i] + ' ')
        }

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
        res.send()
    }
}

app.post('/', async function (req, res) {
    // TODO Change channel name to 'general' when push to prod
    if(req.body.channel_name != 'test'){
        res.send("Sorry! It looks like I can't operate in this conversation. Blame Ethan!");
    }else{
        if (req.body.text == '' || req.body.text == 'help'){
            res.send('Thanks for using brownbot!  Currently, the following commands are acceptable:\n `@user [message]` `dance` `help` `ping` `stats`')
        }else if (req.body.text == 'ping'){
            res.send('Thanks for pinging brownbot! This is a test message.');
        }else if(req.body.text == 'dance'){
            postMessage({
                'attachments': [ {
                    'title': 'What did you honestly expect?',
                    'image_url': 'https://media.giphy.com/media/cSmwcTzp96ocU/giphy.gif' } ] 
                });
            res.send()
        }else if (req.body.text == 'stats'){

            postStats(res)

        }else{
            var args = req.body.text.split(' ');
            var raw_receiver = args[0].split('|')[0];
            var receiver = raw_receiver.substring(2, raw_receiver.length);
            var giver = req.body.user_id;

            giveKudos(giver, receiver, args);
            res.send()
        }
        res.send('How did you get here?? This is a bug, please let Ethan know about it');
    }
});

var real_port = process.env.PORT || 8080;

var server = app.listen(real_port, function () {
    var port = server.address().port;
    console.log('brownbot app listening on port %s', port);
});