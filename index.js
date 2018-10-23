
const axios = require('axios')
const express = require('express')
var app = express()

function postToGeneral(body){
    // Make a POST request to general
    axios({
        method: 'post',
        url: 'https://hooks.slack.com/services/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',
        data: {
            'text': body},
        headers: {
            'Content-Type': 'application/json'}
    });
}

app.get('/', function (req, res) {
    res.send('zzzzz')
})

// app.get('/poop', function(req, res){
//     res.send('💩')
// })

// TODO: app post something too?

var server = app.listen(8080, function () {
    var host = server.address().address
    var port = server.address().port

    console.log('brownbot app listening at http://%s:%s', host, port)
})
