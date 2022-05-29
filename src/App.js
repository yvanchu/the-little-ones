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

  const [twilioState, setTwilioState] = useState({
    identity: "",
    status: "",
    ready: false,
  });
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

    setTwilioState({
      ...twilioState,
      device: device,
    });

    device.on("incoming", (connection) => {
      // immediately accepts incoming connection
      connection.accept();

      setTwilioState({
        ...twilioState,
        status: connection.status(),
      });
    });

    device.on("ready", (device) => {
      setTwilioState({
        ...twilioState,
        status: "device ready",
        ready: true,
      });
    });

    device.on("connect", (connection) => {
      setTwilioState({
        ...twilioState,
        status: connection.status(),
      });
    });

    device.on("disconnect", (connection) => {
      setTwilioState({
        ...twilioState,
        status: connection.status(),
      });
    });

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

  const setup = (event) => {
    // prevents form submission and page refresh
    event.preventDefault();
    fetch(
      `https://token-service-1440-dev.twil.io/token?identity=${twilioState.identity}`
    )
      .then((response) => {
        response.json();
      })
      .then((data) => {
        console.log(data);
        twilioState.device.setup(data.accessToken);
        twilioState.device.audio.incoming(false);
        twilioState.device.audio.outgoing(false);
        twilioState.device.audio.disconnect(false);
      })
      .catch((err) => console.log(err));
  };

  const connectAudio = () => {
    const recipient =
      twilioState.identity === "friend1" ? "friend2" : "friend1";
    twilioState.device.connect({ recipient: recipient });
  };

  const disconnectAudio = () => {
    twilioState.device.disconnectAll();
  };

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
      {/* <button
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          textAlign: "center",
          zindex: 11,
        }}
        onClick={() => {
          makeOutgoingCall();
        }}
      >
        Call
      </button> */}
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
      >
        {twilioState.ready ? (
          <button>Press to Talk</button>
        ) : (
          <div>
            <p>Enter your name to begin.</p>
            <form onSubmit={(e) => setup(e)}>
              <input
                type="text"
                placeholder="What's your name?"
                value={twilioState.identity}
                onChange={(e) =>
                  setTwilioState({ ...twilioState, identity: e.target.value })
                }
              ></input>
              <input type="submit" value="Begin Session"></input>
            </form>
            <button onMouseDown={connectAudio} onMouseUp={disconnectAudio}>
              Press to Talk
            </button>
          </div>
        )}
        <p>{twilioState.status}</p>
      </div>
    </center>
  );
}

export default App;
