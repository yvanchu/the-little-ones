import { FaceMesh } from "@mediapipe/face_mesh";
import { Holistic } from "@mediapipe/holistic";
import React, { useRef, useEffect, useState } from "react";
import * as Facemesh from "@mediapipe/face_mesh";
import * as holisticLib from "@mediapipe/holistic";
import * as cam from "@mediapipe/camera_utils";
import Webcam from "react-webcam";
function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const connect = window.drawConnectors;
  const landmark = window.drawLandmarks;
  var camera = null;
  const [detectionText, setDetectionText] = useState("hello world");
  function onResults(results) {
    //TODO: moving on result stuff
    // const video = webcamRef.current.video;
    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;

    // Set canvas width
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    // canvasCtx.drawImage(
    //   results.image,
    //   0,
    //   0,
    //   canvasElement.width,
    //   canvasElement.height
    // );

    // if (results.multiFaceLandmarks) {
    //   for (const landmarks of results.multiFaceLandmarks) {
    //     connect(canvasCtx, landmarks, Facemesh.FACEMESH_TESSELATION, {
    //       color: "#C0C0C070",
    //       lineWidth: 1,
    //     });
    //     connect(canvasCtx, landmarks, Facemesh.FACEMESH_RIGHT_EYE, {
    //       color: "#FF3030",
    //     });
    //     connect(canvasCtx, landmarks, Facemesh.FACEMESH_RIGHT_EYEBROW, {
    //       color: "#FF3030",
    //     });
    //     connect(canvasCtx, landmarks, Facemesh.FACEMESH_LEFT_EYE, {
    //       color: "#30FF30",
    //     });
    //     connect(canvasCtx, landmarks, Facemesh.FACEMESH_LEFT_EYEBROW, {
    //       color: "#30FF30",
    //     });
    //     connect(canvasCtx, landmarks, Facemesh.FACEMESH_FACE_OVAL, {
    //       color: "#E0E0E0",
    //     });
    //     connect(canvasCtx, landmarks, Facemesh.FACEMESH_LIPS, {
    //       color: "#E0E0E0",
    //     });
    //   }
    // }

    // these draws the whole body
    // canvasCtx.drawImage(
    //   results.segmentationMask,
    //   0,
    //   0,
    //   canvasElement.width,
    //   canvasElement.height
    // );

    // Only overwrite existing pixels.
    // canvasCtx.globalCompositeOperation = "source-in";
    // canvasCtx.fillStyle = "#00FF00";
    // canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

    // Only overwrite missing pixels.
    canvasCtx.globalCompositeOperation = "destination-atop";
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    canvasCtx.globalCompositeOperation = "source-over";
    connect(canvasCtx, results.poseLandmarks, holisticLib.POSE_CONNECTIONS, {
      color: "green",
      lineWidth: 4,
    });
    landmark(canvasCtx, results.poseLandmarks, {
      color: "orange",
      lineWidth: 2,
    });
    // connect(
    //   canvasCtx,
    //   results.faceLandmarks,
    //   holisticLib.FACEMESH_TESSELATION,
    //   {
    //     color: "gray",
    //     lineWidth: 1,
    //   }
    // );
    connect(
      canvasCtx,
      results.leftHandLandmarks,
      holisticLib.HAND_CONNECTIONS,
      {
        color: "white",
        lineWidth: 5,
      }
    );
    landmark(canvasCtx, results.leftHandLandmarks, {
      color: "black",
      lineWidth: 2,
    });
    connect(
      canvasCtx,
      results.rightHandLandmarks,
      holisticLib.HAND_CONNECTIONS,
      {
        color: "white",
        lineWidth: 5,
      }
    );
    landmark(canvasCtx, results.rightHandLandmarks, {
      color: "black",
      lineWidth: 2,
    });

    // console.log(results.leftHandLandmarks);

    // Hand behind head detection using elbow and nose
    // It checks if one of the elbows is above the nose
    // function handAboveNose(){
    //   if((results.poseLandmarks[13].y < results.poseLandmarks[0].y)
    //       || (results.poseLandmarks[14].y < results.poseLandmarks[0].y)){
    //     return true
    //   } else {
    //     return false
    //   }
    // }

    //Mouth size
    function mouthSize(){
      var a = results.poseLandmarks[10].x - results.poseLandmarks[9].x;
      var b = results.poseLandmarks[10].y - results.poseLandmarks[9].y;
      return Math.sqrt( a*a + b*b );
    }
  
    // Hand behind head detection using wrist and mouth (more precise version)
    // It checks if one of the wrists is above the mouth and close horizontally
    function handAboveMouth(){
      var xr = results.poseLandmarks[15].x - results.poseLandmarks[9].x;
      var yr = results.poseLandmarks[15].y - results.poseLandmarks[9].y;
      var dr = Math.sqrt( xr*xr + yr*yr );

      var xl = results.poseLandmarks[16].x - results.poseLandmarks[10].x;
      var yl = results.poseLandmarks[16].y - results.poseLandmarks[10].y;
      var dl = Math.sqrt( xl*xl + yl*yl );

      if(((results.poseLandmarks[15].y < results.poseLandmarks[9].y) &&
          (dr < 3.5*mouthSize()) && !results.leftHandLandmarks) || 
          ((results.poseLandmarks[16].y < results.poseLandmarks[10].y) &&
          (dl < 3.5*mouthSize()) && !results.rightHandLandmarks)){
        return true
      } else {
        return false
      }
    }

    // Action once it detects
    if (handAboveMouth()) {
      setDetectionText("hand behind head");
    } else {
      setDetectionText("hand not behind head");
    }

    canvasCtx.restore();
  }
  // }

  // Getting window dimensions
  function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height
    };
  }
  
  function useWindowDimensions() {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());
  
    useEffect(() => {
      function handleResize() {
        setWindowDimensions(getWindowDimensions());
      }
  
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
  
    return windowDimensions;
  }

  // setInterval(())
  useEffect(() => {
    const holistic = new Holistic({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
      },
    });

    holistic.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: true,
      smoothSegmentation: true,
      refineFaceLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    holistic.onResults(onResults);

    // const faceMesh = new FaceMesh({
    //   locateFile: (file) => {
    //     return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
    //   },
    // });

    // faceMesh.setOptions({
    //   maxNumFaces: 1,
    //   minDetectionConfidence: 0.5,
    //   minTrackingConfidence: 0.5,
    // });

    // faceMesh.onResults(onResults);

    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null
    ) {
      camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          await holistic.send({ image: webcamRef.current.video });
        },
        width: 1280,
        height: 720,
      });
      camera.start();
    }
  }, []);
  return (
    <center>
      <div className="App">
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: useWindowDimensions().width,
            height: useWindowDimensions().height,
          }}
        />{" "}
        <canvas
          ref={canvasRef}
          className="output_canvas"
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 0.76*useWindowDimensions().width,
            height: useWindowDimensions().height,
          }}
        ></canvas>
      </div>
      <h1
        style={{
          color: "green",
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          textAlign: "center",
          zindex: 10,
        }}
      >
        {detectionText}
      </h1>
    </center>
  );
}

export default App;
