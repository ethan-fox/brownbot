
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const Cloudant = require('@cloudant/cloudant');

var app = express();

var creds = {
    'account': 'therternstonoecoughboake',
    'password': '0ef605ab81c1a524a90f29bfca331446883882cc'
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

            postMessage({
                'text': '<@' + giver + '> has given a 💩 to <@' + receiver + '>!\n*Reason:* ' + reason});
            
            scores.get(function(err, result){
                console.log(err)
                console.log(result)
            })
            
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
