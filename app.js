const video = document.getElementById("video")

const startVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia(
        { video: true },
    );
    video.srcObject = stream
    //drawCanvas()
}
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
    faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
    faceapi.nets.faceExpressionNet.loadFromUri('./models')
]).then(
    startVideo())
video.addEventListener('play',()=>{
    const displaySize={
        width:video.width,
        height:video.height
    }
    const canvas=faceapi.createCanvasFromMedia(video)
    document.body.append(canvas);
    canvas.style.position="absolute"
    const context=canvas.getContext('2d')
    faceapi.matchDimensions(canvas,displaySize)
    setInterval(async() => {
        const detections=await faceapi.detectAllFaces(
            video,
            new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks()
       
        for(const face of detections){
           console.log(face,"face")
            const features = {
                faceBottom:face.alignedRect.box.bottom,
                faceLeft:face.alignedRect.box.left,
                faceRight:face.alignedRect.box.right,
                faceTop:face.alignedRect.box.top,
                faceWidth:face.alignedRect.box.width,
                jaw: face.landmarks.positions.slice(0, 17),
                eyebrowLeft: face.landmarks.positions.slice(17, 22),
                eyebrowRight: face.landmarks.positions.slice(22, 27),
                noseBridge: face.landmarks.positions.slice(27, 31),
                nose: face.landmarks.positions.slice(31, 36),
                eyeLeft: face.landmarks.positions.slice(36, 42),
                eyeRight: face.landmarks.positions.slice(42, 48),
                lipOuter: face.landmarks.positions.slice(48, 60),
                lipInner: face.landmarks.positions.slice(60),
              };
            //console.log(features,"<<features")
            context.clearRect(0,0,canvas.width,canvas.height) 
            //draw face
            const fs=1.5*(features.faceBottom-features.faceTop)
            // console.log(features)
            context.font=`${fs}px/${fs}px serif`;
            context.textAlign = 'center';
            context.textBaseline = 'bottom';
            context.fillText('🍋', features.faceLeft+features.faceWidth/3*2, features.faceTop + 0.7* fs);
            //draw Eyebow
            for (const eye of [features.eyeLeft, features.eyeRight]) {
                const eyeBox = getBoxFromPoints(eye);
                const fontSize = 6 * eyeBox.height;
                context.font = `${fontSize}px/${fontSize}px serif`;
                context.textAlign = 'center';
                context.textBaseline = 'bottom';
                context.fillStyle = '#000';
                
                context.fillText('👁️', eyeBox.center.x, eyeBox.center.y + 0.6 * fontSize);
            // 用canvas.clip，结合五官数据应该可以直接截取五官
                //    context.drawImage(video,eyeBox.left,eyeBox.top,eyeBox.width,eyeBox.height,eyeBox.center.x, eyeBox.center.y ,3*eyeBox.width,3*eyeBox.height)
            }
             //画嘴唇
             for (const lip of [ features.lipOuter]) {
                const lipBox = getBoxFromPoints(lip);
                const fontSize = 5 * lipBox.height;
          
                context.font = `${fontSize}px/${fontSize}px serif`;
                context.textAlign = 'center';
                context.textBaseline = 'bottom';
                context.fillStyle = '#000';
                
                context.fillText('👄', lipBox.center.x, lipBox.center.y + 0.5 * fontSize);
            // 用canvas.clip，结合五官数据应该可以直接截取五官
                //    context.drawImage(video,eyeBox.left,eyeBox.top,eyeBox.width,eyeBox.height,eyeBox.center.x, eyeBox.center.y ,3*eyeBox.width,3*eyeBox.height)
            }

        }
        const resizeDectections=faceapi.resizeResults(detections,displaySize)
       // canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height)
    //    faceapi.draw.drawDetections(canvas,resizeDectections)
        // faceapi.draw.drawFaceLandmarks(canvas,resizeDectections)
       // faceapi.draw.drawFaceExpressions(canvas,resizeDectections)
    }, 100);
   
})
function getBoxFromPoints(points) {
    const box = {
      bottom: -Infinity,
      left: Infinity,
      right: -Infinity,
      top: Infinity,
  
      get center() {
        return {
          x: this.left + this.width / 2,
          y: this.top + this.height / 2,
        };
      },
  
      get height() {
        return this.bottom - this.top;
      },
  
      get width() {
        return this.right - this.left;
      },
    };
  
    for (const point of points) {
      box.left = Math.min(box.left, point.x);
      box.right = Math.max(box.right, point.x);
  
      box.bottom = Math.max(box.bottom, point.y);
      box.top = Math.min(box.top, point.y);
    }
  
    return box;
  }
  