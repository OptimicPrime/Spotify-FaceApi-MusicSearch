import React, {useState, useEffect, useRef} from "react";
import * as faceapi from "face-api.js";

function WebCam(){
  const videoHeight = 480;
  const videoWidth = 640;
  const[initializing, setInitializing] = useState(false);
  const videoRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + '/models';
      setInitializing(true);
      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]).then(startVideo);
    }
    loadModels();
  }, [])

  const startVideo = () => {
    navigator.getUserMedia(
      {video: {}},
       stream => videoRef.current.srcObject = stream, 
       err => console.error(err))

  }

  const handleVideoOnPlay = () => {
    setInterval(async () => {
      if(initializing){
        setInitializing(false);
      }
      canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(videoRef.current)
      const displaySize = {width: videoWidth, height: videoHeight};
      faceapi.matchDimensions(canvasRef.current, displaySize);
      const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
      const resizeDetections = faceapi.resizeResults(detections, displaySize);
      canvasRef.current.getContext('2d').clearRect(0, 0, videoWidth, videoHeight);
      faceapi.draw.drawDetections(canvasRef.current, detections);
      faceapi.draw.drawFaceLandmarks(canvasRef.current, resizeDetections);
      faceapi.draw.drawFaceExpressions(canvasRef.current, resizeDetections);
    }, 100)
  }


return(
  <div className="WebCam">
  <span> {initializing} </span>
  <div className="display-flex justify-content-center">
  <video ref={videoRef} autoPlay muted height={videoHeight} width={videoWidth} onPlay={handleVideoOnPlay} />
  <canvas ref={canvasRef} className="position-absolute"/>
  </div>
  </div>
)

}
export default WebCam;