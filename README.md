# Twilio_Lookup_API_Bulk

Author: Hiren Variava  
Date: Dec 13, 2021

As of creation of this script, Twilio didn't provide a way to bulk call their Lookup API 
and I couldn't find any JS implementation of it so I created this script to bulk call Twilio Lookup API.

The script was created as a quick solution to a problem that I was facing, and thus
it's not following any sort of best practices.

The purpose of this script was just to get phone type from Lookup API,
but you can modify the script to get more information out of this API if need be.

Input file format: one phone number per line
Output file format: one phone number and phone type per line separted by comma

Because of the concurrent nature of this script, the order of the 
phone numbers in output file may be different from input file.

For Twilio credentials, please refer to: https://www.twilio.com/docs/iam/credentials/api

Twilio API docs: https://www.twilio.com/docs

Twilio Lookup API docs: https://www.twilio.com/docs/lookup/api
