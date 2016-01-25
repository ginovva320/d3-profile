# d3-profile

This is a simple profile viewer for Diablo 3 accounts. You can view your career stats
and stats for your individual heroes. The production version is hosted at
[https://d3.anid.ninja](https://d3.anid.ninja).

## Development

Gulp is used heavily for development in this project. Configuration files can be found in the `gulpfile.js` folder.
The default task builds the project, serves it at [localhost:3999](localhost:3999), and watches the project for changes.
Environment variables are required to run most tasks.
 
## Environment

Gulp will load environment variables first from command line arguments, then from the environment, and lastly from an
env JSON file. By default, gulp will look for `gulpfile.js/env/dev.env.json` to load environment variables from. 
To load and use other environments, create a new JSON file in the `env` folder and run gulp tasks with an `env` 
flag set to the desired environment (e.g. `gulp --env sandbox`). A sample file is located in the same folder, 
which can be used as a template, but should not be modified.

The environment variables needed are:

##### AWS_ID
Amazon web service identifier for the IAM uploading user.

##### AWS_SECRET
AWS secret for the IAM uploading user.

##### BATTLE_NET_KEY
API key for the Diablo 3 community API

##### BATTLE_NET_URL
Battle.net API endpoint (typically https://us.api.battle.net/)

##### D3_MEDIA_URL
Host for Diablo 3 icons (typically http://media.blizzard.com/d3/icons/)

##### GOOGLE_ANALYTICS_ID
Google Analytics property tracking ID

##### S3_BUCKET
The S3 bucket to upload to.

## Serving Locally

To get started with development, 

1. `npm install`
2. Populate `gulp/env/dev.env.json`
3. `gulp`

## Deployment

This project is a single page app which is hosted on AWS S3.
The gulp config included in this project contains a deploy task. This task builds,
minifies, and uploads the files to S3.