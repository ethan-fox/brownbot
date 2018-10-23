
const axios = require('axios')
const express = require('express')
const bodyParser = require('body-parser');

var app = express()

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

function postMessage(body){
    // Make a POST request to general
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
    console.log('raw name: ' + raw_name)
    var result = await axios({
        method: 'post',
        url: 'https://slack.com/api/users.info?token=xoxb-425527920966-461615227600-HtDz46TBLLwOPRK5z3MutyxD&user=' + raw_name
    });

    console.log(result)

    if(result.ok){
        return result.user.profile.display_name
    }else{
        return result.error
    }
}

//user_list = new Map();

// '<escaped name>' : {
//     'real_name': '<real name>',
//     'poop_given': '<number>',
//     'poop_received': '<number>'
// }

app.post('/', async function (req, res) {
    // TODO: Change channel name to 'general' when push to prod
    if(req.body.channel_name != 'test'){
        res.send("Sorry! It looks like I can't operate in this conversation. Blame Ethan!");
    }else{
        if (req.body.text == 'ping') {
            res.send('Thanks for pinging brownbot! This is a test message.');
        }else{
            var args = req.body.text.split(' ');
            var raw_receiver = args[0].split('|')[0];
            var receiver = await getDisplayName(raw_receiver.substring(2, raw_receiver.length));
            var giver = await getDisplayName(req.body.user_id);

            console.log('raw receiver: ' + raw_receiver)

            console.log('Giver: ' + giver)
            console.log('Receiver: ' + receiver)

            postMessage({
                'text': 'qqq'
                // 'attachments': [{
                //     'image_url': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaF0K6Deki58UtsUJfeCn-2nwwMMxXi2Do9KA0msXWp-nLUDvnww',
                //     'title': 'spooky'
                // }]
            });
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
