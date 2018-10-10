var cbt = require('cbt_tunnels');
var request = require('request');
var APIUrl = 'https://daniel.soskel@gmail.com:ua01f835227df050@crossbrowsertesting.com/api/v3';

// cbt.start({
//     username: "daniel.soskel@gmail.com",
//     authkey: "ua01f835227df050",
//     verbose: true,
//     kill: "stopserver",
//     dir: "C:\\Users\\Daniel\\WebstormProjects\\CBT_Test\\"},
//     function(err) {
//         if (!err) console.log(getBrowsers());
//     }
// );

console.log(getBrowsers());

function getBrowsers() {
    request(APIUrl + '/selenium/browsers', {json: true}, (err, res, body) => {
        if (err) {return console.log(err)}
        return filterBrowsers(body, "mobile");
    });
}

function filterBrowsers(arrBrowsers, device) {
    arrBrowsers.filter(function(browser) {
        return browser.device == device;
    })
}