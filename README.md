# docker_camera-ringbuffer

Docker image for periodically retrieving images from a webcam over http, offering an api for retrieving the backlog.

ENV parameters:

- URL      camera url including http:// (required)
- AMOUNT   amount of images to keep (default: 10)
- INTERVAL delay between images (default: 1000ms)
- RESIZE   <width>,<height> to store images in (default: no resize)
