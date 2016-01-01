var querystring = require('querystring');
var http = require('http');
var fs = require('fs');
module.exports = function (app) {
// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/login', function (req, res) {
        res.render('login.ejs');
    });


    // process the signup form
    app.post('/login', function (req, res) {

        var post_data = querystring.stringify(req.body);

        //var http = require('http');
        var post_options = {
            host: '104.197.206.174',
            path: '/oauth/token',
            port: '80',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(post_data)
            }
        };

        // Set up the request
        var post_req = http.request(post_options, function (res1) {


            var responseData = ""

            res1.on('data', function (chunk) {
                responseData += chunk;
                console.log('Response: ' + chunk);

            });

            res1.on('end', function () {
                var token = JSON.parse(responseData).access_token;
                console.log("token " + token);

                //var post_options1 = {
                //    host: '104.197.206.174',
                //    path: '/',
                //    port: '80',
                //    method: 'GET',
                //    headers: {
                //        'Content-Type': 'application/x-www-form-urlencoded',
                //        'access_token': token
                //    }
                //};
                //
                //        var data1 = '';
                //        var post_req1 = http.request(post_options1, function(res2) {
                //            res2.on('data', function (chunk1) {
                //                data1 += chunk1;
                //            });
                //            res2.on('end', function () {
                //                console.log("asasaasaasa" + data1);
                //              //  res.location = "http://104.197.206.174"
                //
                //                req.headers=  {
                //                    'Content-Type': 'application/x-www-form-urlencoded',
                //                    'access_token': token
                //                }
                //                res.set('access_token',token)
                //                 res.redirect('http://',{data1:data1});
                //            });
                //        });

                        // post the data
                        //post_req1.write(post_data);
                        //post_req1.end();
                res.set('access_token',token);
                req.session.accessToken = token;
                //req.set('access_token',token);
                res.redirect('http://104.197.206.174:3030/dataset.html?access_token='+token);

                res.session
                res.end();

            });

        });

        //console.log("aaaaa" + post_data);

        post_req.write(post_data);
        post_req.end();
    })}





