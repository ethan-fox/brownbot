
const axios = require('axios')
const express = require('express')
const bodyParser = require('body-parser');

var app = express()

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

function postToGeneral(body){
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
    if(req.body.text == ''){
        postToGeneral({
        'text': 'Thanks for pinging brownbot! This is a test message.',
        // 'attachments': [{
        //     'image_url': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaF0K6Deki58UtsUJfeCn-2nwwMMxXi2Do9KA0msXWp-nLUDvnww',
        //     'title': 'spooky'
        // }]
        })
    }else if(req.body.text == 'give'){
        postToGeneral({
            'text': '💩'
        })
    }
    console.log(req.body.text)
    res.send('thanks')
})

app.post('/brown', function(req, res){
    postToGeneral({
        'text': '💩other poop'
    })
    res.send('thanks for poop')
})

// TODO: app post something too?

var real_port = process.env.PORT || 8080;

var server = app.listen(real_port, function () {
    var host = server.address().address
    var port = server.address().port

    console.log('brownbot app listening at http://%s:%s', host, port)
})
