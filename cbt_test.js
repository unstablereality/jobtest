var cbt = require('cbt_tunnels');
var request = require('request');
var APIUrl = 'https://daniel.soskel@gmail.com:ua01f835227df050@crossbrowsertesting.com/api/v3';

cbt.start(
    {
    username: "daniel.soskel@gmail.com",
    authkey: "ua01f835227df050",
    kill: "stopserver",
    dir: "C:\\Users\\DSOSKEL\\WebstormProjects\\CBT_Test\\"},
    function(err) {
        if (!err) {
            getBrowsers();
        }
    },
    // fs.open('stopserver', 'w', function(err) { if (err) throw err })
);

function getBrowsers() {
    request(APIUrl + '/selenium/browsers', {json: true}, (err, res, body) => {
        if (err) {return console.log('Error: ' + err)}
        var mobile = getRandom(filterByField(body, 'device', 'mobile'));
        var windows = getRandom(getDesktops(body, 'Windows'));
        var mac = getRandom(getDesktops(body, 'Mac'));
        console.log(mobile.api_name);
        console.log(windows.api_name);
        console.log(mac.api_name);
    });
}

function filterByField(arrDevices, field, filter) {
    // filtered = arrDevices.filter(({device}) => device === filter);
    return arrDevices.filter( browser => {
        return browser[field] === filter;
    });
}

function getDesktops(arrDevices, type) {
    var desktops = filterByField(arrDevices, 'device', 'desktop');
    return filterByField(desktops, 'type', type);
}

function getRandom(array) {
    var arrKeys = Object.keys(array);
    var randKey = arrKeys[Math.floor(Math.random() * arrKeys.length)];
    return array[randKey];

}