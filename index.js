var express = require('express');
var bodyParser = require("body-parser");
var app = express();
var jsonfile = require('jsonfile');
var file = 'C:/Users/Kyunglok/Desktop/Crystal Fruit/kyle/users.json'
var fs = require("fs");
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport('smtps://user%40gmail.com:pass@smtp.gmail.com');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


var accountSid = 'AC564443a45caebd0e86013b7622c0f1d7';
var authToken = '34588817e6d005f0404944b9d5db258b';

var client = require('twilio')(accountSid, authToken);

app.set('port', (process.env.PORT || 3000));

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
   res.sendFile( __dirname + "/" + "index.html" );
})


app.get('/contact', function (req, res) {
   res.sendFile( __dirname + "/" + "contact.html" );
})

// app.get('/getUsers', function(req, res){    
//   res.setHeader('Content-Type', 'application/json');
//   jsonfile.readFile(file, function(err, obj) {
//     res.end(JSON.stringify(obj));
//     console.log(obj);
//   })
// });

// function numberRangeValid(number){
//   var num = parseInt(number);
//   if(num>999999999 && num<10000000000){
//     return true;
//   }
//   return false;
// }

function checkIfNumberExists(number){
  jsonfile.readFile(file,function(err,obj){
    for(var i=0; i<obj.users.length; i++){
      if(number==obj.users[i].phone){
        return true;
      }
    }
  })
  return false;
}

// function checkCarrier(number){
//   jsonfile.readFile(file,function(err,obj){
//     for(var i=0; i<obj.users.length; i++){

//     }
//   })
// }

function pushNewData(newUserData){
  jsonfile.readFile(file,function(err,obj){
    var usersFile = obj;
    usersFile.users.push(newUserData);
    jsonfile.writeFileSync(file,usersFile, {spaces:2});
  })
}

// function inArray(element){
//   jsonfile.readFile(file,function(err,obj){
//     for(var i)
//   })
// }

app.post('/addNewUser', function(req,res){
  console.log(req.body.phone);
  if(checkIfNumberExists(req.body.phone)==true){
    console.log("Already registered user or invalid number");
    res.json(req.body);
  }
  else{
    pushNewData(req.body);
    console.log("Registration success!");
  }
})

app.post('/sendText', function(req, res) {
  jsonfile.readFile(file,function(err,obj){
    var message = req.body.message;
    for(var i=0; i<obj.users.length; i++){
      var phoneNumber = obj.users[i].phone;
      client.messages.create({
        to:phoneNumber,
        from: "3026919043",
        body: message
      }, function(err,message){
        console.log(err);
      });

      res.end("Received POST request at /sendText");
    }
  })
})

app.post('/mailTest', function(req, res){
  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'tidbitscrystalfruit@gmail.com', // Your email id
      pass: 'crystalfruitdigital' // Your password
    }
  });
  jsonfile.readFile(file,function(err,obj){
    for(var i=0; i<obj.users.length; i++){
      var carrierMailTag;
      var carrierPhone= obj.users[i].phone;
      if(obj.users[i].carrier=="Altel"){
        carrierMailTag = carrierPhone.concat("@message.Alltel.com");
      }
      else if(obj.users[i].carrier=="AT&T"){
        carrierMailTag = carrierPhone.concat("@txt.att.net");
      }
      else if(obj.users[i].carrier=="Boost-Mobile"){
        carrierMailTag = carrierPhone.concat("@myboostmobile.com");
      }
      else if(obj.users[i].carrier=="Sprint"){
        carrierMailTag = carrierPhone.concat("@messaging.sprintpcs.com");
      }
      else if(obj.users[i].carrier=="T-Mobile"){
        carrierMailTag = carrierPhone.concat("@tmomail.net");
      }
      else if(obj.users[i].carrier=="U.S.Cellular"){
        carrierMailTag = carrierPhone.concat("@email.uscc.net");
      }
      else if(obj.users[i].carrier=="Verizon"){
        carrierMailTag = carrierPhone.concat("@vtext.com");
      }
      else if(obj.users[i].carrier=="Virgin_Mobile"){
        carrierMailTag = carrierPhone.concat("@vmobl.com");
      }
      else{
        carrierMailTag=carrierMailTag;
      }

      var mailOptions = {
        from: '<tidbitscrystalfruit@gmail.com>', // sender address
        to: carrierMailTag, // list of receivers
        subject: 'Testing phone', // Subject line
        text: "Hello World!" //, // plaintext body
      };
      
      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          console.log(error);
          res.json({ yo: 'error' });
        } else {
          console.log('Message sent: ' + info.response);
          res.json({ yo: info.response });
        };
      });
    }
  })
})


var server = app.listen(app.get('port'), function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})
