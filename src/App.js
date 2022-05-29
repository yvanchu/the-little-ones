import { FaceMesh } from "@mediapipe/face_mesh";
import { Holistic } from "@mediapipe/holistic";
import React, { useRef, useEffect, useState } from "react";
import * as Facemesh from "@mediapipe/face_mesh";
import * as holisticLib from "@mediapipe/holistic";
import * as cam from "@mediapipe/camera_utils";
import Webcam from "react-webcam";

const { Device } = require("twilio-client");

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const connect = window.drawConnectors;
  const landmark = window.drawLandmarks;
  var camera = null;
  const [detectionText, setDetectionText] = useState("hello world");
  const [textSent, setTextSent] = useState(false);

  function onResults(results) {
    //TODO: moving on result stuff
    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;

    // Set canvas width
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

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
      color: "darkgreen",
      lineWidth: 2,
    });
    connect(
      canvasCtx,
      results.faceLandmarks,
      holisticLib.FACEMESH_TESSELATION,
      {
        color: "gray",
        lineWidth: 1,
      }
    );
    connect(
      canvasCtx,
      results.leftHandLandmarks,
      holisticLib.HAND_CONNECTIONS,
      {
        color: "purple",
        lineWidth: 5,
      }
    );
    // console.log(results.leftHandLandmarks);
    if (results.leftHandLandmarks && results.leftHandLandmarks[0].y < 0.5) {
      setDetectionText("left hand is up");
    } else {
      setDetectionText("left hand is down");
    }
    landmark(canvasCtx, results.leftHandLandmarks, {
      color: "white",
      lineWidth: 2,
    });
    connect(
      canvasCtx,
      results.rightHandLandmarks,
      holisticLib.HAND_CONNECTIONS,
      {
        color: "gold",
        lineWidth: 5,
      }
    );
    landmark(canvasCtx, results.rightHandLandmarks, {
      color: "black",
      lineWidth: 2,
    });

    canvasCtx.restore();
  }
  // }

  // setInterval(())
  useEffect(() => {
    const device = new Device();

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
            width: 1280,
            height: 720,
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
            width: 1280,
            height: 720,
          }}
        ></canvas>
      </div>
      <h1
        style={{
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
      <div
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          textAlign: "center",
          zindex: 11,
        }}
      ></div>
    </center>
  );
}

export default App;
