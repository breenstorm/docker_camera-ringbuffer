# cam-capture

Docker image for periodically retrieving images from a webcam over http, offering an api for retrieving the backlog.

ENV parameters:

- PORT :     tcp port to serve API on (default: 8000)
- URL :      camera url including http:// (required)
- AMOUNT :   amount of images to keep (default: 10)
- INTERVAL : delay between images (default: 1000ms)
- RESIZE :  \<width\>,\<height\> to store images in (default: no resize)
- GIFSKIPFRAMES: add each Nth frame when creating gif animation (default: 1)

API endpoints:
- /frame.json       : last registered frame as json with image encoded in base64
- /frame[N].json    : N registered frames ago as json with image encoded in base64
- /frame<.bin>      : last registered frame as binary image
- /frame[N]<.bin>   : N registered frames ago as binary image
- /frames           : json reply with all frames including timestamp and content-type with images encoded in base64
- /animation<.json> : json reply with rendered gif of all frames with image encoded in base64
- /animation.gif    : rendered gif of all frames as binary image
