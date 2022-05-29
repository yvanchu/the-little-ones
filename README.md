## Inspiration
The whole team wanted to learn something new for Wildhacks, so we decided to try out gesture tracking with MediaPipe and text/call with Twilio. We thought Alex Cornell and Phil Mills’s usetickle.com was super funny– so we made an inferior version of it :D

## What it does
You can scratch the back of your head in front of your laptop camera to trigger a fake phone call and get you out of awkward situations.

## How we built it
We used MediaPipe for gesture tracking, Twilio for voice/call integration with phones, the frontend was built with React, backend built with Node.js, express.js, and hosted using Heroku and Github Pages for backend and frontend respectively.

We spent the first three hours learning how to use MediaPipe by follow this YouTube tutorial: https://www.youtube.com/watch?v=oNB5hVabqL4. Then we modified to code to support full holistic body tracking.

Davi implemented the gesture recognition for head scratching. Rui helped set up the Twilio account for call/sms integration. Annie designed a Figma prototype to demonstrate the final concept (https://www.figma.com/proto/cxTyzFPKs1mpy8jvBn2Lwj/WildHacks-2022---Laptop?node-id=13%3A5&scaling=scale-down&page-id=0%3A1&starting-point-node-id=13%3A5). 

## What's next for Wing
Mobile phone compatibility with our web app

Add in more detectors for more complex gestures (maybe spell casting-like gestures with voice recognition)

Consider other features to connect it with (IFTTT, automate.io, etc)

Develop fully functional gesture interface for computers/phones
