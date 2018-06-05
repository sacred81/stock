const http = require('http');
const iconv = require('iconv-lite');
const D = require("discord.js");

var groupToken = "NDQ2ODk4ODA2MjgyMjU2Mzg0.Dd_7mA.FAVE51y3zd3jMjKG26hNcB_XWec";
var channelId = "446912419877617686";
var test = new D.Client();
var command = "!";
var interval = 300000;
//var interval = 30000;

var min = 16500;
var max = 17000;
var low = min;
var high = max;
var defaultMessage = "min = " + min + " max = " + max;

function alarmFunc()
{
    if (isOpen() == false) {
        low = min;
        high = max;
        return;
    }
    http.request(options, callback).end();
}

function genDate()
{
    var now = new Date();
    return new Date(now - ((now.getTimezoneOffset() - 540) * 60 * 1000));
    //return now;
}

function isOpen()
{
    var now = genDate();
    var hours = now.getHours();
    if (9 <= hours && hours < 15 ) {
        return true;
    }
    return false;
}

function init()
{
    test.login(groupToken);
}

test.on('message', (message) => {
    if (message.content[0] != command) {
        return;
    }
    if (message.content.indexOf("min") != -1) {
        var splitted = refineStr(message.content);
        if (splitted.length != 1) {
            return;
        }
        min = splitted[0];
        low = min;
        var res = "min = " + min;
        defaultMessage = "min = " + min + " max = " + max;
        sendMessage(res);
    } else if (message.content.indexOf("max") != -1) {
        var splitted = refineStr(message.content);
        if (splitted.length != 1) {
            return;
        }
        max = splitted[0];
        high = max;
        var res = "max = " + max;
        defaultMessage = "min = " + min + " max = " + max;
        sendMessage(res);
    } else {
        sendMessage(defaultMessage);
    }
});

test.on('ready', () => {
    var message = "I am ready!";
    sendMessage(message);
    setInterval(alarmFunc, interval);
});

function sendMessage(message)
{
    test.channels.get(channelId).send(message);
}

//The url we want is: 'http://polling.finance.naver.com/api/realtime.nhn?query=SERVICE_ITEM:122630'

var options = {
  host: 'polling.finance.naver.com',
  path: '/api/realtime.nhn?query=SERVICE_ITEM:122630'
};

callback = function(response) {
  var str = null;

  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
      var temp = new Buffer(chunk);
      if (str == null) {
          str = temp;
      } else {
        str = Buffer.concat(str, temp);
      }
  });

  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {
      var data = iconv.decode(str, 'EUC-KR').toString();
      var strArray = data.split(/[:",]/).filter((val) => val.trim() != "");
      for (var i = 0; i < strArray.length; i++) {
          if (strArray[i] == "nv") {
              var value = strArray[i+1];
              if (value < low) {
                  low = value;
                  sendMessage(defaultMessage + " low = " + low);
              } else if (value > high) {
                  high = value;
                  sendMessage(defaultMessage + " high = " + high);
              }
              break;
          }
      }
  });
}

function refineStr(str)
{
    str = str.replace("!", "");
    str = str.replace("min", "");
    str = str.replace("max", "");
    var splitted = str.split(" ");
    splitted = splitted.filter((val) => val.trim() != "");
    splitted.sort();
    return splitted;
}

init();