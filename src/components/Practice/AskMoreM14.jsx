import React, { useState, useEffect } from "react";
import * as Assets from "../../utils/imageAudioLinks";
import { useMediaQuery, ThemeProvider, createTheme } from "@mui/material";
import { practiceSteps, getLocalData } from "../../utils/constants";
import MainLayout from "../Layouts.jsx/MainLayout";
import {
  level13,
  level14,
  level10,
  level11,
  level12,
  level15,
} from "../../utils/levelData";
import {
  ListenButton,
  RetryIcon,
  SpeakButton,
  StopButton,
} from "../../utils/constants";
import RecordVoiceVisualizer from "../../utils/RecordVoiceVisualizer";
import { Box, CircularProgress } from "@mui/material";
import correctSound from "../../assets/correct.wav";
import wrongSound from "../../assets/audio/wrong.wav";

const levelMap = {
  10: level10,
  11: level11,
  12: level12,
  13: level13,
  14: level14,
  15: level15,
};

const theme = createTheme();

const content = {
  conversation: [
    {
      speaker: "Good morning, dear! How can I help you?",
      user: "Good morning, sir.\nI need some potatoes",
    },
    { speaker: "How many kilos do you want?", user: "Two kilograms, please." },
    {
      speaker: "One kilo of potatoes costs Rs. 30.",
      user: "That’s fine. I also need half a kilo of carrots and beans.",
    },
    {
      speaker: "Anything else?",
      user: "No, that’s all. What is the total amount?",
    },
    {
      speaker: "The total amount is Rs. 100",
      user: "Here is the money. Thank you, sir.",
    },
  ],
};

const AskMoreM14 = ({
  setVoiceText,
  setRecordedAudio,
  setVoiceAnimate,
  storyLine,
  type,
  handleNext,
  background,
  parentWords = "",
  enableNext,
  showTimer,
  points,
  steps,
  currentStep,
  contentId,
  contentType,
  level,
  isDiscover,
  progressData,
  showProgress,
  playTeacherAudio = () => {},
  callUpdateLearner,
  disableScreen,
  isShowCase,
  handleBack,
  setEnableNext,
  loading,
  setOpenMessageDialog,
  audio,
  currentImg,
}) => {
  const [currentSteps, setCurrentStep] = useState(-1);
  const [isMikeClicked, setIsMikeClicked] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [cloudText, setCloudText] = useState("......");
  const [showPandaText, setShowPandaText] = useState(false);
  const [showClock, setShowClock] = useState(false);
  const [imageData, setImageData] = useState({});
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const getPulseAnimationStyle = (color) => ({
    position: "absolute",
    width: "90px",
    height: "90px",
    backgroundColor: color,
    borderRadius: "50%",
    animation: "pulse 1.2s linear infinite",
    "@keyframes pulse": {
      "0%": {
        transform: "scale(0.6)",
        opacity: 0,
      },
      "50%": {
        opacity: 1,
      },
      "100%": {
        transform: "scale(1.4)",
        opacity: 0,
      },
    },
  });

  const getConversation = (level, currentLevel) => {
    const levelData = levelMap[level];
    const conversationObj = levelData?.find(
      (item) => item.level === currentLevel
    );
    return conversationObj?.data?.conversation || [];
  };

  const getImages = (level, currentLevel) => {
    const levelData = levelMap[level];
    const conversationObj = levelData?.find(
      (item) => item.level === currentLevel
    );
    return conversationObj?.data || [];
  };

  steps = 1;

  let progressDatas = getLocalData("practiceProgress");
  const virtualId = String(getLocalData("virtualId"));

  if (typeof progressDatas === "string") {
    progressDatas = JSON.parse(progressDatas);
  }

  let currentPracticeStep;
  if (progressDatas?.[virtualId]) {
    currentPracticeStep = progressDatas[virtualId].currentPracticeStep;
  }

  const currentLevel = practiceSteps?.[currentPracticeStep]?.name || "P1";

  //const conversation = contentM14[level]?.[currentLevel]?.conversation || content?.conversation;

  const conversation = getConversation(level, currentLevel);

  useEffect(() => {
    setImageData(getImages(level, currentLevel));
  }, [currentLevel]);

  console.log(
    "levelM14",
    level,
    currentStep,
    currentLevel,
    conversation,
    steps,
    imageData
  );

  useEffect(() => {
    setCurrentStep(-1);
    setIsMikeClicked(false);
    setShowModal(true);
    setCloudText("......");
    setShowPandaText(false);
    setShowClock(false);
  }, [currentLevel]);

  useEffect(() => {
    if (currentSteps >= 0 && currentSteps < conversation.length) {
      if (currentSteps === 0) {
        setTimeout(() => {
          setCloudText(conversation[0].speaker);
          setShowPandaText(true);
        }, 2000);
      } else {
        setCloudText(conversation[currentSteps].speaker);
        setShowPandaText(true);
      }
    }
  }, [currentSteps]);

  const generateCloudPositions = () => {
    const positions = [];
    const cloudCount = 6;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    for (let i = 0; i < cloudCount; i++) {
      const top = i % 2 === 0 ? screenHeight * 0.1 : screenHeight * 0.0;
      const left = (i * (screenWidth / cloudCount)) % screenWidth;
      positions.push({ top, left });
    }

    return positions;
  };

  const cloudPositions = generateCloudPositions();

  const handlePauseClick = () => {
    if (currentSteps < conversation.length - 1) {
      const audio = new Audio(correctSound);
      audio.play();
      setCurrentStep((prev) => prev + 1);
      handleNext();
    } else {
      const audio = new Audio(correctSound);
      audio.play();
      setCurrentStep(conversation.length);
      //console.log('texxxxxt');
      handleNext();
      // for (let i = 0; i < 5; i++) {
      //   handleNext();
      // }
    }
    setIsMikeClicked(false);
    setShowClock(false);
  };

  const handleMikeClick = () => {
    setIsMikeClicked(true);
    setShowClock(true);
  };

  const handlePlayClick = () => {
    setShowModal(false);
    setCurrentStep(0);
    setShowPandaText(false);
  };

  return (
    <MainLayout
      background={background}
      handleNext={handleNext}
      enableNext={enableNext}
      showTimer={showTimer}
      points={points}
      pageName={"m14"}
      //answer={answer}
      //isRecordingComplete={isRecordingComplete}
      parentWords={parentWords}
      //={recAudio}
      {...{
        steps,
        currentStep,
        level,
        progressData,
        showProgress,
        playTeacherAudio,
        handleBack,
        disableScreen,
        loading,
      }}
    >
      <div
        style={{
          position: "relative",
          height: "100vh",
          background: "#B6E4FA",
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {cloudPositions?.map((pos, index) => (
          <img
            key={index}
            src={Assets.cloudyImg}
            alt="Cloudy Background"
            style={{
              position: "absolute",
              top: `${pos.top}px`,
              left: `${pos.left}px`,
              width: "200px",

              opacity: 0.7,
            }}
          />
        ))}
        {showModal && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "17px",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "24px",
                fontWeight: "bold",
                color: "white",
              }}
            >
              Ask More!
            </span>
            <img src={Assets.modalImg} alt="Modal" style={{ width: "500px" }} />
            <img
              src={Assets.playImg}
              alt="Play Button"
              style={{
                position: "absolute",
                top: "60%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                cursor: "pointer",
                width: isMobile ? "80px" : isTablet ? "100px" : "120px",
              }}
              onClick={handlePlayClick}
            />
          </div>
        )}
        {/* {showClock && (
        <div style={{ position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <img src={clockImg} alt="Clock" style={{ width: '30px' }} />
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#333F61' }}>00:10</span>
        </div>
      )} */}
        <img
          src={Assets.sunImg}
          alt="Sun"
          style={{
            position: "absolute",
            top: "5%",
            left: "10%",
            width: "100px",
          }}
        />
        <img
          src={Assets[imageData?.images?.imageOne] || Assets.beerImg}
          alt="Left Character"
          style={{
            position: "absolute",
            bottom: "15%",
            left: isMobile || isTablet ? "2%" : "10%",
            //width: "210px",
            height: isMobile || isTablet ? "230px" : "250px",
            zIndex: 2,
          }}
        />
        <img
          src={Assets[imageData?.images?.imageTwo] || Assets.pandaImg}
          alt="Right Character"
          style={{
            position: "absolute",
            bottom: "15%",
            right: isMobile || isTablet ? "0%" : "8%",
            //width: "210px",
            height: isMobile || isTablet ? "230px" : "250px",
            zIndex: 2,
          }}
        />

        {currentSteps >= 0 && currentSteps < conversation.length ? (
          <>
            <div
              style={{
                position: "absolute",
                top: "19%",
                left: isMobile || isTablet ? "8%" : "17%",
                width: "250px",
                textAlign: "center",
              }}
            >
              <img
                src={Assets.cloudImg}
                alt="Cloud"
                style={{ width: "100%" }}
              />
              <span
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: "15px",
                  fontWeight: "bold",
                  color: "#333F61",
                  textAlign: "center",
                }}
              >
                {cloudText}
              </span>
            </div>

            {showPandaText && (
              <div
                style={{
                  position: "absolute",
                  top: "18%",
                  right: isMobile || isTablet ? "16%" : "21%",
                  width: "195px",
                  textAlign: "center",
                }}
              >
                <img
                  src={Assets.cloudPandaImg}
                  alt="Cloud Panda"
                  style={{ width: isMobile || isTablet ? "120%" : "130%" }}
                />
                <span
                  style={{
                    position: "absolute",
                    top: "33%",
                    left: "60%",
                    transform: "translate(-50%, -50%)",
                    fontSize: "15px",
                    fontWeight: "bold",
                    color: "#333F61",
                    textAlign: "center",
                    wordBreak: "wrap",
                    width: "165px",
                  }}
                >
                  {conversation[currentSteps].user}
                </span>
              </div>
            )}
            {!isMikeClicked ? (
              // <img
              //   src={Assets.mikeImg}
              //   alt="Microphone"
              //   style={{
              //     position: "absolute",
              //     top: "70%",
              //     left: "50%",
              //     transform: "translate(-50%, -50%)",
              //     width: "35px",
              //     cursor: "pointer",
              //     zIndex: "9999",
              //   }}
              //   onClick={handleMikeClick}
              // />
              <Box
                // marginLeft={
                //   !props.dontShowListen || props.recordedAudio
                //     ? "32px"
                //     : "0px"
                // }
                style={{
                  position: "absolute",
                  top: "70%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "35px",
                  cursor: "pointer",
                  zIndex: "9999",
                }}
                sx={{ cursor: "pointer" }}
                onClick={handleMikeClick}
              >
                <Box
                  sx={{
                    width: "90px",
                    height: "90px",
                    borderRadius: "50%",
                    position: "relative",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Box sx={getPulseAnimationStyle("#58CC0233")} />
                  <Box
                    sx={{
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    <SpeakButton height={45} width={45} />
                  </Box>
                </Box>
              </Box>
            ) : (
              <>
                <Box
                  // marginLeft={
                  //   !props.dontShowListen || props.recordedAudio
                  //     ? "32px"
                  //     : "0px"
                  // }
                  style={{
                    position: "absolute",
                    top: "70%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "35px",
                    cursor: "pointer",
                    zIndex: "9999",
                  }}
                  sx={{ cursor: "pointer" }}
                  onClick={handlePauseClick}
                >
                  <Box
                    sx={{
                      width: "90px",
                      height: "90px",
                      borderRadius: "50%",
                      position: "relative",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Box sx={getPulseAnimationStyle("#FF4B4B33")} />
                    <Box
                      sx={{
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      <StopButton height={45} width={45} />
                    </Box>
                  </Box>
                </Box>
              </>
            )}
          </>
        ) : (
          !showModal && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: "24px",
                fontWeight: "bold",
                color: "white",
              }}
            >
              Conversation Complete!
            </div>
          )
        )}

        <img
          src={Assets.sandImg}
          alt="Sand"
          style={{
            position: "relative",
            bottom: "0",
            width: "100%",
            height: "auto",
            marginTop: "450px",
          }}
        />
      </div>
    </MainLayout>
  );
};

export default AskMoreM14;
