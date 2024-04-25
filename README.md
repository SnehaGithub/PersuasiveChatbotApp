# persuasivebot

## Installation
I recommend creating a virtual environment and installing all the necessary packages to limit issues with setup.

After cloning this repo, you need to have Node.js, React, and Flask installed to run the app

Node js download: https://nodejs.org/en/download

Flask download; https://pypi.org/project/Flask/
Please also install and setup Python if  you do not have it already.
You can also just run npm install flask (may also have to run pip install -U Flask)

React: after installing Node, just run npx create-react-app my-app

Once you run npx create-react-app my-app , you can just do
cd my-app

Then replace the src in there with the src folder on this Github repo

## Additional Installations
Run the following:
npm install @chatscope/chat-ui-kit-react
npm install openai
npm install firebase

## API/Secret Keys
You will need to add API keys for OpenAI as well as Firebase configuration in ChatApp.js and api.py.

## Exporting Data
Go to Firebase console -> Realtime Database
On the right hand side there are three dots (expand menu) button. Click on it and then click on "Export JSON"

Once you have the exported JSON file downloaded. Move it to the src directory. Then run the json_to_csv.py. Note that this script expects the name of the JSON file to be "export_json_to_firebase.json". You can either change the name in the script or change the name of the downloaded JSON file. Once the script has finished running, the output is called "output_firebase.csv"