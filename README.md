# docker_camera-ringbuffer

Docker image for periodically retrieving images from a webcam over http, offering an api for retrieving the backlog.

ENV parameters:

- URL :      camera url including http:// (required)
- AMOUNT :   amount of images to keep (default: 10)
- INTERVAL : delay between images (default: 1000ms)
- RESIZE :  \<width\>,\<height\> to store images in (default: no resize)
- GIFSKIPFRAMES: add each Nth frame when creating gif animation (default: 1)

API endpoints:
- /frames : json reply with all frames in base64 including timestamp and content-type
- /gif :    json reply with rendered gif of all frames in base64
