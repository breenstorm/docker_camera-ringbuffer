const http = require("http");
const sharp = require('sharp');
const Stream = require('stream').Transform;
const gifencoder = require('gif-encoder-2');

const host = '';
let port = 8000;

let buffer = [];
let bufferidx = 0;
let amount = 10;
let url = 'http://invalid-demo-url/';
let interval = 1000;
let resize = null;
let gifskipframes = 1;
if (process.env.PORT) {
    port = parseInt(process.env.PORT);
}
if (process.env.GIFSKIPFRAMES) {
    gifskipframes = parseInt(process.env.GIFSKIPFRAMES);
}
if (process.env.AMOUNT) {
    amount = parseInt(process.env.AMOUNT);
}
if (process.env.URL) {
    url = process.env.URL;
}
if (process.env.INTERVAL) {
    interval = parseInt(process.env.INTERVAL);
    if (interval < 100) {
	console.log("Interval should be in milliseconds. Assuming parameter was entered in seconds.");
        interval *= 1000;
    }
}
if (process.env.RESIZE) {
    resize = process.env.RESIZE;
}
for (a = 0; a < amount; a++) {
    buffer.push({
	"timestamp":0,
	"contenttype":"",
	"data":""
    });
}

const requestListener = async function (req, res) {
    var url = req.url.split(".");
    switch (url[0]) {
	case "/frame":
            console.log("Serving last image");
	    var sortedbuffer = buffer.filter((x) => x.timestamp > 0);
	    sortedbuffer.sort((a,b) => {
	      if (a.timestamp < b.timestamp) {
	        return -1;
	      }
	      if (a.timestamp > b.timestamp) {
	        return 1;
	      }
	      return 0;
	    });
            if (resize!=null) {
	        var imgdata = await sharp(Buffer.from(sortedbuffer[sortedbuffer.length-1].data))
		    .resize({
		        width: parseInt(resize.split(",")[0]),
			height: parseInt(resize.split(",")[1])
		    })
		    .toBuffer();
	        if (url[1]=="json") {
	            res.setHeader("Content-Type", "application/json");
	            res.writeHead(200);
	            res.end(JSON.stringify({"data":Buffer.from(imgdata).toString("base64")}));
		} else {
	            res.setHeader("Content-Type", sortedbuffer[sortedbuffer.length-1].contenttype);
	            res.writeHead(200);
	            res.end(Buffer.from(imgdata));
		}
            } else {
	        if (url[1]=="json") {
	            res.setHeader("Content-Type", "application/json");
	            res.writeHead(200);
	            res.end(JSON.stringify({"data":sortedbuffer[sortedbuffer.length-1].data.toString("base64")}));
		} else {
	            res.setHeader("Content-Type", sortedbuffer[sortedbuffer.length-1].contenttype);
	            res.writeHead(200);
	            res.end(sortedbuffer[sortedbuffer.length-1].data);
		}
            }
	    break;
	case "/frames":
            console.log("Serving buffered images as json array");
	    let list = [];
	    var sortedbuffer = buffer.filter((x) => x.timestamp > 0);
	    sortedbuffer.sort((a,b) => {
	      if (a.timestamp < b.timestamp) {
	        return -1;
	      }
	      if (a.timestamp > b.timestamp) {
	        return 1;
	      }
	      return 0;
	    });
	    for (var a = 0; a < sortedbuffer.length; a++) {
                if (resize!=null) {
	            var imgdata = await sharp(Buffer.from(sortedbuffer[a].data))
		        .resize({
			    width: parseInt(resize.split(",")[0]),
			    height: parseInt(resize.split(",")[1])
			})
			.toBuffer();
		    list.push({
			"timestamp":sortedbuffer[a].timestamp,
			"contenttype":sortedbuffer[a].contenttype,
			"data":Buffer.from(imgdata).toString("base64")
		    });
                } else {
		    list.push({
			"timestamp":sortedbuffer[a].timestamp,
			"contenttype":sortedbuffer[a].contenttype,
			"data":sortedbuffer[a].data.toString("base64")
		    });
                }
	    }
	    //return current list of snapshots
	    res.setHeader("Content-Type", "application/json");
	    res.writeHead(200);
	    res.end(JSON.stringify(list));
	    break;
	case "/animation":
	    console.log("Serving animated gif");
	    var gifimg = null;
	    const image = sharp(buffer[bufferidx].data);
	    const metadata = await image.metadata();
	    let width = metadata.width/2;
	    let height = metadata.height/2;
	    var gif = new gifencoder(width,height);
	    gif.start();
	    gif.setRepeat(1);
	    gif.setDelay(interval);
	    gif.setQuality(30);
	    gif.setThreshold(20);
	    var sortedbuffer = buffer.filter((x) => x.timestamp > 0);
	    sortedbuffer.sort((a,b) => {
	      if (a.timestamp < b.timestamp) {
	        return -1;
	      }
	      if (a.timestamp > b.timestamp) {
	        return 1;
	      }
	      return 0;
	    });
	    for (var a = 0; a < sortedbuffer.length; a++) {
	        if (((sortedbuffer.length - a) % gifskipframes) == 0) {
		    var imgdata = await sharp(Buffer.from(sortedbuffer[a].data))
		        .resize({
                                width: width,
                                height: height
                        })
		        .joinChannel(Buffer.alloc(width * height, 255), { raw: { channels: 1, width, height} })
		        .raw().toBuffer();
		    gif.addFrame(imgdata);
                }
	    };
	    gif.finish();
	    if (url[1]=="gif") {
	        res.setHeader("Content-Type", "image/gif");
	        res.writeHead(200);
	        res.end(gif.out.getData());
	    } else {
	        res.setHeader("Content-Type", "application/json");
	        res.writeHead(200);
	        res.end(JSON.stringify({"data":gif.out.getData().toString("base64")}));
	    }

	    break;
	default:
	    if ((url[0].substring(0,6) == "/frame") && (url[0].length>6)) {
		var sortedbuffer = buffer.filter((x) => x.timestamp > 0);
		sortedbuffer.sort((a,b) => {
		    if (a.timestamp < b.timestamp) {
		        return -1;
		    }
		    if (a.timestamp > b.timestamp) {
		        return 1;
		    }
		    return 0;
		});
		var imagenum = Math.max(0,Math.min(sortedbuffer.length-1,parseInt(url[0].substring(6))));
	        console.log("Serving image from " + imagenum.toString() + " snapshots earlier");
	        if (resize!=null) {
		    var imgdata = await sharp(Buffer.from(sortedbuffer[sortedbuffer.length-1-imagenum].data))
			.resize({
			    width: parseInt(resize.split(",")[0]),
			    weight: parseInt(resize.split(",")[1])
			})
			.toBuffer();
		    if (url[1]=="json") {
		        res.setHeader("Content-Type", "application/json");
		        res.writeHead(200);
		        res.end(JSON.stringify({"data":Buffer.from(imgdata).toString("base64")}));
		    } else {
		        res.setHeader("Content-Type", sortedbuffer[sortedbuffer.length-1-imagenum].contenttype);
		        res.writeHead(200);
		        res.end(Buffer.from(imgdata));
		    }
	        } else {
		    if (url[1]=="json") {
		        res.setHeader("Content-Type", "application/json");
		        res.writeHead(200);
		        res.end(JSON.stringify({"data":sortedbuffer[sortedbuffer.length-1-imagenum].data.toString("base64")}));
		    } else {
		        res.setHeader("Content-Type", sortedbuffer[sortedbuffer.length-1-imagenum].contenttype);
		        res.writeHead(200);
		        res.end(sortedbuffer[sortedbuffer.length-1-imagenum].data);
		    }
	        }

	    } else {
	        res.writeHead(200);
	        res.end("Use endpoints /frame, /frames(.json) or animation.json/gif");
	    }
    }

};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});

const captureImages = function () {
    http
      .get(url, resp => {
	var content_type = resp.headers['content-type'].split(";")[0];
	var data = new Stream();

        resp.on("data", chunk => {
          data.push(chunk);
        });

        resp.on("end", () => {
	    if (content_type.split("/")[0]=="image") {
                bufferidx=(bufferidx+1)%amount;
	        buffer[bufferidx].timestamp = Date.now();
	        buffer[bufferidx].contenttype = content_type;
	        buffer[bufferidx].data = Buffer.from(data.read());
	    } else {
                console.log("No image received, skipping");
	    }
	    setTimeout(captureImages,interval);
        });

      })
      .on("error", err => {
        console.log("Error: " + err.message);
        setTimeout(captureImages,interval*5);
      });

}

captureImages();

