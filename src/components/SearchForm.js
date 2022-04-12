
import { Form } from 'react-bootstrap';
import React, {useState, useEffect, useRef} from "react";
import * as faceapi from "face-api.js";


const SearchForm = (props) => {
  const [errorMsg, setErrorMsg] = useState('');
  const [modelsLoaded, setModelsLoaded] = React.useState(false);
  const [captureVideo, setCaptureVideo] = React.useState(false);
  const [results, setResults] = useState('');

  const videoRef = React.useRef();
  const videoHeight = 480;
  const videoWidth = 640;
  const canvasRef = React.useRef();

  React.useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + '/models';

      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]).then(setModelsLoaded(true));
    }
    loadModels();
  }, []);

  const startVideo = () => {
    setCaptureVideo(true);
    navigator.mediaDevices
      .getUserMedia({ video: { width: 300 } })
      .then(stream => {
        let video = videoRef.current;
        video.srcObject = stream;
        video.play();
      })
      .catch(err => {
        console.error("error:", err);
      });
  }

  const handleVideoOnPlay = () => {
    setInterval(async () => {
      if (canvasRef && canvasRef.current) {
        canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(videoRef.current);
        const displaySize = {
          width: videoWidth,
          height: videoHeight
        }

        faceapi.matchDimensions(canvasRef.current, displaySize);

        const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();

        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        canvasRef && canvasRef.current && canvasRef.current.getContext('2d').clearRect(0, 0, videoWidth, videoHeight);
        canvasRef && canvasRef.current && faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
        canvasRef && canvasRef.current && faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
        canvasRef && canvasRef.current && faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);

        // Go into detections and get the to FaceExpression
        const expression = detections[0].expressions;
              
        // Get the expression with the highest value
        const highestExpression = Object.keys(expression).reduce((a, b) => expression[a] > expression[b] ? a : b);
        console.log(highestExpression);
        setResults(highestExpression);
      }
    }, 100)
  }

  const closeWebcam = () => {
    videoRef.current.pause();
    videoRef.current.srcObject.getTracks()[0].stop();
    setCaptureVideo(false);
  }
  const handleInputChange = () => {
    setResults(results);
  };

  const handleSearch = (event) => {
    event.preventDefault();

    if (results.trim() !== '') {
      setErrorMsg('');
      props.handleSearch(results);
    } else {
      setErrorMsg('Open the webcam to get your result!');
    }
  };

  return (
<div>
<div>
<h2>Open the Webcam and get your Current Mood for a Spotify Search</h2>
      <div>
        {
          captureVideo && modelsLoaded ?
            <button onClick={closeWebcam}>
              Close Webcam
            </button>
            :
            <button onClick={startVideo}>
              Open Webcam
            </button>
        }
      </div>
      {
        captureVideo ?
          modelsLoaded ?
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
                <video ref={videoRef} height={videoHeight} width={videoWidth} onPlay={handleVideoOnPlay}/>
                <canvas ref={canvasRef} style={{ position: 'absolute' }} />
              </div>
            </div>
            :
            <div>loading...</div>
          :
          <>
          </>
      }
    </div>
   <Form onSubmit={handleSearch}>
      {errorMsg && 
      <p className="errorMsg">{errorMsg}</p>
      }
      <Form.Group controlId="formBasicEmail">
         <Form.Label>Once your mood is displayed in box below, select the search button to see your results!</Form.Label>
         <Form.Control
            type="search"
            name="searchTerm"
            value={results}
            onChange={handleInputChange}
            autoComplete="off"
            />
      </Form.Group>
      <button type="submit">
      Search
      </button>
   </Form>
</div>
);
};

export default SearchForm;
