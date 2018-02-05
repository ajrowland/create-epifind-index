# Create Episerver Find index
Uses Pupperteer to automate the creation of an Episerver Find index

Install dependencies:

`npm install`

Create index:

`node createindex.js --username [username] --password [password] --indexname [indexname]`

The script returns the configuration for the newly created index, or an existing index if it already exists.
