
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const Cloudant = require('@cloudant/cloudant');

var app = express();

var IAM = {
  "apikey": "D40JvEBVS62OAMIeF4WEi1uW0vXJviWx4h3ayE17bbD5",
  "host": "4e0f03ac-45f9-46ae-b211-c1b19438a4f4-bluemix.cloudant.com",
  "iam_apikey_description": "Auto generated apikey during resource-key operation for Instance - crn:v1:bluemix:public:cloudantnosqldb:us-south:a/c49aeb28e28ce4ad4698bbe8a965bdaf:ff6ddf6e-f395-4093-b2ea-89971125668a::",
  "iam_apikey_name": "auto-generated-apikey-d14c6a58-822c-4801-a7e6-dc55eb1545d8",
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

    var result = await axios({
        method: 'post',
        url: 'https://slack.com/api/users.info?token=xoxb-425527920966-461615227600-HtDz46TBLLwOPRK5z3MutyxD&user=' + raw_name
    });

    if(result.data.ok){
        return result.data.user.profile.display_name
    }else{
        return result.data.error
    }
}

//user_list = new Map();

// '<escaped name>' : {
//     'poop_given': '<number>',
//     'poop_received': '<number>'
// }

app.post('/', async function (req, res) {
    // TODO Change channel name to 'general' when push to prod
    if(req.body.channel_name != 'test'){
        res.send("Sorry! It looks like I can't operate in this conversation. Blame Ethan!");
    }else{
        if (req.body.text == 'ping'){
            res.send('Thanks for pinging brownbot! This is a test message.');
        // }else if(res.body.text == 'dance'){
        //     // TODO dancing poop gif
        //     postMessage({
        //         'text': 'For now, just imagine that there\'s a dancing poop emoji here.'});
        }else{
            var args = req.body.text.split(' ');
            var raw_receiver = args[0].split('|')[0];
            var receiver = raw_receiver.substring(2, raw_receiver.length);
            var giver = req.body.user_id;
            var reason = '';

            for(var i = 1; i < args.length; ++i){
                reason += (args[i] + ' ')
            }
            
            var giver_stats = await scores.get(giver, function(err, result){
                // If user not on system yet
                if(err){
                    return { 'poop_given': 0, 'poop_received': 0 }}
            });

            var receiver_stats = await scores.get(receiver, function (err, result) {
                // If user not on system yet
                if (err) {
                    return { 'poop_given': 0, 'poop_received': 0 }}
            });

            console.log('giver stats (bfore):')
            for(var prop in giver_stats){
                console.log(prop + ": " + giver_stats[prop])
            }
            console.log('receiver stats (bfore):')
            for (var prop in receiver_stats) {
                console.log(prop + ": " + receiver_stats[prop])
            }
            
            postMessage({
                'text': '<@' + giver + '> has given a 💩 to <@' + receiver + '>!\n*Reason:* ' + reason});
        }
        //console.log(req.body.text)
        res.send();
    }
});

var real_port = process.env.PORT || 8080;

var server = app.listen(real_port, function () {
    var port = server.address().port;
    console.log('brownbot app listening on port %s', port);
});
