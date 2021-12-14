"use strict";

// Author: Hiren Variava
// Date: Dec 13, 2021
//
// As of creation of this script, Twilio didn't provide a way to bulk call their Lookup API.
// This script was created to use Lookup API from Twilio in a bulk manner.
//
// The script was created as a quick solution to a problem that I was facing, and thus
// it's not following any sort of best practices.
//
// The purpose of this script was just to get phone type from Lookup API,
// but you can modify the script to get more information out of this API if need be.
//
// Input file format: one phone number per line
// Output file format: one phone number and phone type per line separted by comma
//
// Because of the concurrent nature of this script, the order of the 
// phone numbers in output file may be different from input file.
//
// For Twilio credentials, please refer to: https://www.twilio.com/docs/iam/credentials/api
// Twilio API docs: https://www.twilio.com/docs

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
