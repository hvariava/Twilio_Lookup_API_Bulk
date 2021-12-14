"use strict";

// Author: Hiren Variava
// Date: Dec 13, 2021
//
// Please refer to README file for information about this project.

// credentials
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;

const accountSid = '<SID>';
const authToken = '<Token>';

const client = require('twilio')(accountSid, authToken);
const fs = require('fs');

// input file
const fileName = '<InputFileName>';

// output file
const outFile = '<OutputFileName>';

// Twilio doesn't allow more than 100 concurrent requests
const maxConcReq = 90;

// if above concurrent requests reached, wait (in ms)
const timeout = 150;

// print a message after every x successful results
const grain = 1000;

var myStream = fs.createWriteStream(outFile, {flags:'w'});
var concReq = 0;
var processed = 0;

var phoneNums = fs.readFileSync(fileName).toString().split("\n");

let print = (str) => {
    console.log((new Date()).toLocaleString() + " : " + str);
}

let getInfo = () => {
    if (phoneNums.length === 0) return;

    if (concReq > maxConcReq) setTimeout(getInfo, timeout);
    else {
        let num = phoneNums.shift().trim();
        if (num === "") { getInfo(); return; }
        concReq++;
        processed++;

        if (processed % grain === 0) 
            print(processed);

        client.lookups.v1.phoneNumbers(num)
                        .fetch({type: ['carrier']})
                        .then(phone_number => {
                            myStream.write(num + ',' + phone_number.carrier.type + "\n");
                            concReq--;
                        })
                        .catch(error => {
                            print("Couldn't process " + num + ". The error code is |" + error.code + "| and status is |" + error.status + "|");
                            concReq--;

                            if (error.code != 20404) {
                                phoneNums.unshift(num);
                                processed--;
                                print("Will retry " + num);

                                if (error.code == 20429)
                                    setTimeout(getInfo, timeout);
                                else
                                    getInfo();
                            }
                        });
        
        getInfo();
    }
}

getInfo();
