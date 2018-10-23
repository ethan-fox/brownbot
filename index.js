
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

app.post('/', function (req, res) {
    // TODO: Change channel name to 'general' when push to prod
    if(req.body.channel_name != 'test'){
        res.send("Sorry! It looks like I can't operate in this conversation. Blame Ethan!");
    }else{
        if (req.body.text == 'ping') {
            postMessage({
                'response_type': 'ephemeral',
                'text': 'Thanks for pinging brownbot! This is a private test message.'
            });
        }else{
            var args = req.body.text.split(' ');
            console.log(args)
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
})

var real_port = process.env.PORT || 8080;

var server = app.listen(real_port, function () {
    var port = server.address().port;
    console.log('brownbot app listening on port %s', port);
});
