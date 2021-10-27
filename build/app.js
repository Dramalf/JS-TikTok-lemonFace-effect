const video = document.getElementById("video")
const canvas = document.getElementById("canvas")
const startVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia(
        { video: true },
    );
    video.srcObject = stream
    //drawCanvas()
}
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
   // faceapi.nets.faceLandmark68Net.loadFromUri('./models')
]).then(
    startVideo())
video.addEventListener('play',()=>{
    setInterval(async() => {
        const detections=await faceapi.detectAllFaces(
            video,
            new faceapi.TinyFaceDetectorOptions()
        )
        console.log(detections)
    }, 100);
   
})