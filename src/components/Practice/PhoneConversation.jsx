import React, { useEffect, useState, useRef } from "react";
import { Box, CircularProgress } from "@mui/material";
import Confetti from "react-confetti";
import {
  level13,
  level14,
  level10,
  level11,
  level12,
  level15,
} from "../../utils/levelData";
import { useMediaQuery, ThemeProvider, createTheme } from "@mui/material";
import listenImg2 from "../../assets/listen.png";
import spinnerStop from "../../assets/pause.png";
import MainLayout from "../Layouts.jsx/MainLayout";
import * as Assets from "../../utils/imageAudioLinks";
import {
  practiceSteps,
  getLocalData,
  NextButtonRound,
  RetryIcon,
} from "../../utils/constants";
import VoiceAnalyser from "../../utils/VoiceAnalyser";
import { fetchASROutput, handleTextEvaluation } from "../../utils/apiUtil";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import correctSound from "../../assets/correct.wav";
import wrongSound from "../../assets/audio/wrong.wav";
const theme = createTheme();

const levelMap = {
  10: level10,
  11: level11,
  12: level12,
  13: level13,
  14: level14,
  15: level15,
};

const PhoneConversation = ({
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
  fluency,
  startShowCase,
  setStartShowCase,
  livesData,
  setLivesData,
  gameOverData,
  highlightWords,
  matchedChar,
  isNextButtonCalled,
  setIsNextButtonCalled,
}) => {
  const [showQuestion, setShowQuestion] = useState(false);
  const [conversationData, setConversationData] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isPlaying, setIsPlaying] = useState(null);
  const [audioInstance, setAudioInstance] = useState(null);
  const [evaluationResults, setEvaluationResults] = useState({});
  const [recording, setRecording] = useState("no");
  const [isRecordingComplete, setIsRecordingComplete] = useState(false);
  const [recAudio, setRecAudio] = useState("");
  const [completeAudio, setCompleteAudio] = useState(null);
  const [imageData, setImageData] = useState({});
  const [loader, setLoader] = useState(false);
  const [apiResponse, setApiResponse] = useState("");
  const [correctAnswerText, setCorrectAnswerText] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const {
    transcript,
    interimTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const transcriptRef = useRef("");
  useEffect(() => {
    transcriptRef.current = transcript;
    console.log("Live Transcript:", transcript);
  }, [transcript]);

  console.log("showcase", fluency, isShowCase, livesData, gameOverData);

  steps = 1;

  const getConversation = (level, currentLevel) => {
    const levelData = levelMap[level];
    const conversationObj = levelData?.find(
      (item) => item.level === currentLevel
    );
    return conversationObj?.data || [];
  };

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

  const conversation = getConversation(level, currentLevel);

  useEffect(() => {
    if (tasks[currentTaskIndex]) {
      const currentTask = tasks[currentTaskIndex];
      const correctOption =
        currentTask.options.find((opt) => opt.id === currentTask.answer)
          ?.value || "Unknown";

      setCorrectAnswerText(correctOption);
    }
  }, [currentTaskIndex, tasks]);

  const playAudio = (audioKey) => {
    if (audioInstance) {
      // If already playing, stop the audio
      audioInstance.pause();
      audioInstance.currentTime = 0;
      setIsPlaying(null);
      setAudioInstance(null);
    }
    if (isPlaying !== audioKey) {
      if (Assets[audioKey]) {
        const audio = new Audio(Assets[audioKey]);

        audio.onended = () => {
          setIsPlaying(null);
          setAudioInstance(null);
        };

        audio.play();
        setAudioInstance(audio);
        setIsPlaying(audioKey);
      } else {
        console.error("Audio file not found:", audioKey);
      }
    }
  };

  useEffect(() => {
    setConversationData(conversation?.instructions?.content);
    setTasks(conversation?.tasks);
    setCurrentTaskIndex(0);
  }, []);

  useEffect(() => {
    setConversationData(conversation?.instructions?.content || []);
    setTasks(conversation?.tasks || []);
    setCurrentTaskIndex(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setShowConfetti(false);
    setShowQuestion(false);
  }, [currentLevel]);

  console.log("m1011", currentLevel, selectedOption, recAudio);

  const handleStartRecording = () => {
    if (!browserSupportsSpeechRecognition) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }
    resetTranscript();
    setIsRecording(true);
    SpeechRecognition.startListening({
      continuous: true,
      interimResults: true,
    });
  };

  const handleStopRecording = () => {
    SpeechRecognition.stopListening();
    setFinalTranscript(transcriptRef.current);
    setIsRecording(false);
    //console.log("Final Transcript:", transcriptRef.current);
  };

  const handleRecordingComplete = async (base64Data) => {
    if (base64Data) {
      setIsRecordingComplete(true);
      setRecAudio(base64Data);
      if (currentLevel === "S1" || currentLevel === "S2") {
        const comprehension = await handleTextEvaluation(
          correctAnswerText,
          transcriptRef.current
        );

        if (comprehension) {
          const options = {
            originalText: correctAnswerText,
            contentType: contentType,
            contentId: contentId,
            comprehension: comprehension,
          };

          fetchASROutput(base64Data, options, setLoader, setApiResponse);
        } else {
          console.error("Failed to get evaluation result.");
        }
      }
    } else {
      setIsRecordingComplete(false);
      setRecAudio("");
    }
  };

  const handleNextClick = () => {
    setShowQuestion(true);
  };

  const handleOptionClick = (optionId) => {
    setSelectedOption(optionId);
    //if (selectedOption !== null) return;

    if (currentLevel === "S1" || currentLevel === "S2") {
      const questionText = tasks[currentTaskIndex]?.question?.value;
      const isAnswerCorrect = optionId === tasks[currentTaskIndex].answer;

      setEvaluationResults((prevResults) => ({
        ...prevResults,
        [questionText]: isAnswerCorrect ? "Correct" : "Wrong",
      }));
      setRecording("recording");

      console.log("Evaluation Results:", {
        ...evaluationResults,
        [questionText]: isAnswerCorrect ? "Correct" : "Wrong",
      });
      return;
    }

    if (optionId === tasks[currentTaskIndex].answer) {
      setIsCorrect(true);
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        setRecording("recording");
      }, 2000);
    } else {
      setIsCorrect(false);
      setTimeout(() => {
        resetState();
      }, 500);
    }
  };

  const resetState = () => {
    setSelectedOption(null);
    setIsCorrect(null);
  };

  const loadNextTask = () => {
    setIsLoading(true);

    setTimeout(() => {
      setRecAudio(null);
      handleNext();
      if (currentTaskIndex < tasks.length - 1) {
        setCurrentTaskIndex(currentTaskIndex + 1);
        resetState();
      } else {
        setCurrentTaskIndex(0);
        resetState();
      }
      setIsLoading(false);
      setRecording("no");
    }, 2000);
  };

  const styles = {
    mainContainer: {
      background:
        "linear-gradient(0deg, rgba(241, 153, 32, 0.32) 0%, rgba(243, 159, 39, 0.32) 23%, rgba(247, 176, 59, 0.32) 58%, rgba(254, 204, 92, 0.32) 100%)",
      height: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: isMobile ? "10px" : "20px",
      overflowX: "hidden",
      position: "relative",
    },
    innerContainer: {
      backgroundColor: "#fff",
      borderRadius: "10px",
      padding: isMobile ? "15px" : "20px",
      width: "100%",
      position: "relative",
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
      overflowX: "hidden",
      //height: "80vh",
      overflowY: "hidden",
      marginBottom: isMobile ? "20px" : "40px",
    },
    phoneIcon: {
      marginLeft: "40px",
      display: "flex",
      alignItems: "center",
      fontWeight: "bold",
      fontSize: "18px",
    },
    messageContainer: {
      display: "flex",
      flexDirection: "column",
      gap: isMobile ? "20px" : isTablet ? "55px" : "40px",
      marginTop: isMobile ? "15px" : "35px",
    },

    message: {
      padding: isMobile ? "8px" : "10px",
      borderRadius: "10px",
      maxWidth: isMobile ? "80%" : "60%",
      fontSize: isMobile ? "14px" : "16px",
      position: "relative",
      whiteSpace: "pre-wrap",
      marginLeft: isMobile ? "60px" : "100px",
    },
    selectedNeutralOption: {
      backgroundColor: "#f0f0f0",
      //borderColor: '#aaa',
    },
    sonMessage: {
      backgroundColor: "#fde4b2",
      alignSelf: "flex-start",
      width: isMobile ? "80%" : isTablet ? "50%" : "300px",
      marginLeft: isMobile ? "40px" : "80px",
    },

    callerMessage: {
      backgroundColor: "#f1f1f1",
      alignSelf: "flex-end",
      width: isMobile ? "80%" : isTablet ? "50%" : "280px",
      marginRight: isMobile ? "40px" : isTablet ? "80px" : "180px",
    },
    ioIcon: {
      height: isMobile ? "50px" : "70px",
      cursor: "pointer",
      marginTop: isMobile ? "25px" : "45px",
    },
    boyIcon: {
      width: isMobile ? "20px" : "25px",
      height: isMobile ? "20px" : "25px",
      position: "absolute",
      left: isMobile ? "-40px" : "-70px",
      bottom: "10%",
      display: "flex",
      alignItems: "center",
      transform: "translateY(50%)",
      gap: "10px",
    },
    callerIconsContainer: {
      position: "absolute",
      right: isMobile ? "-40px" : "-80px",
      bottom: "10%",
      transform: "translateY(50%)",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    nextButton: {
      position: "absolute",
      bottom: isMobile ? "5px" : "10px",
      right: isMobile ? "5px" : "10px",
      width: isMobile ? "40px" : "50px",
      height: isMobile ? "40px" : "50px",
      cursor: "pointer",
      marginRight: isMobile ? "5px" : "10px",
    },
    questionBox: {
      backgroundColor: "#f8f2ff",
      borderRadius: "20px",
      padding: isMobile ? "10px" : "20px",
      fontWeight: "bold",
      border: "1px dashed #d8b6ff",
      fontSize: isMobile ? "18px" : isTablet ? "22px" : "25px",
      width: isMobile ? "90%" : isTablet ? "70%" : "50%",
      marginLeft: "auto",
      marginRight: "auto",
      marginTop: isMobile ? "20px" : "50px",
      textAlign: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    optionsContainer: {
      marginTop: "40px",
      display: "grid",
      gridTemplateColumns:
        tasks[currentTaskIndex]?.options?.length === 4 ||
        tasks[currentTaskIndex]?.options?.length === 5
          ? "repeat(2, 1fr)"
          : "repeat(2, 1fr)",
      gap: "20px",
      width: "80%",
      marginLeft: "auto",
      marginRight: "auto",
      padding: "20px",
      position: "relative",
    },

    option: {
      backgroundColor: "#fff",
      padding: "20px",
      borderRadius: "10px",
      border: "1px solid #ddd",
      cursor: "pointer",
      textAlign: "center",
      boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
      fontSize: "18px",
      transition: "background-color 0.3s ease",
    },

    thirdOption: {
      gridColumn: "1 / -1",
      justifySelf: "center",
      width: "50%",
    },

    correctOption: {
      backgroundColor: "#d4edda",
    },
    incorrectOption: {
      backgroundColor: "#FF7F361A",
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <MainLayout
        background={background}
        handleNext={handleNext}
        enableNext={enableNext}
        showTimer={showTimer}
        points={points}
        pageName={"m8"}
        //answer={answer}
        //isRecordingComplete={isRecordingComplete}
        parentWords={parentWords}
        fluency={false}
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
          isShowCase,
          startShowCase,
          setStartShowCase,
          livesData,
          gameOverData,
          setIsNextButtonCalled,
        }}
      >
        <div style={styles.mainContainer}>
          {showConfetti && <Confetti />}
          <div style={styles.innerContainer}>
            {!showQuestion ? (
              <>
                {/* <div style={styles.phoneIcon}>
                <img
                  src={phoneImg}
                  alt="Phone Icon"
                  style={{ width: "24px", marginRight: "5px" }}
                />
                <strong>Phone rings...</strong>
              </div> */}
                <div
                  style={{
                    ...styles.messageContainer,
                    height: "400px",
                    overflowY: "auto",
                  }}
                >
                  {conversationData?.map((msg, index) => (
                    <div
                      key={index}
                      style={{
                        ...styles.message,
                        ...(msg.role === "System"
                          ? styles.sonMessage
                          : styles.callerMessage),
                      }}
                    >
                      <span style={styles.boldText}>{msg.name}: </span>
                      {msg.message}
                      {msg?.role === "System" && (
                        <div style={styles.boyIcon}>
                          <img
                            src={
                              isPlaying === msg.audio ? spinnerStop : listenImg2
                            }
                            alt="Audio"
                            style={{
                              height: "25px",
                              width: "25px",
                              cursor: "pointer",
                            }}
                            onClick={() => playAudio(msg?.audio)}
                          />
                          <img
                            src={Assets.avatar1}
                            alt="Boy"
                            width={"25px"}
                            height={"25px"}
                          />
                        </div>
                      )}
                      {msg?.role === "User" && (
                        <div style={styles.callerIconsContainer}>
                          <img
                            src={Assets.avatar2}
                            alt="Boy"
                            width={"25px"}
                            height={"25px"}
                          />
                          <img
                            src={
                              isPlaying === msg.audio ? spinnerStop : listenImg2
                            }
                            alt="Audio"
                            style={{
                              height: "25px",
                              width: "25px",
                              cursor: "pointer",
                            }}
                            onClick={() => playAudio(msg?.audio)}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {/* <img
                src={Assets.nextimg}
                alt="Next"
                style={styles.nextButton}
                onClick={handleNextClick}
              /> */}
                <div onClick={handleNextClick} style={styles.nextButton}>
                  <NextButtonRound height={50} width={50} />
                </div>
              </>
            ) : (
              tasks[currentTaskIndex] && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  {!["S1", "S2"].includes(currentLevel) && (
                    <img
                      src={
                        isPlaying ? Assets.stopVoiceNote : Assets.startVoiceNote
                      }
                      alt="Audio"
                      style={{
                        height: "40px",
                        width: "190px",
                        cursor: "pointer",
                        marginTop: "10px",
                      }}
                      onClick={() => playAudio(conversationData[0].audio)}
                    />
                  )}
                  <div style={styles.questionBox}>
                    {tasks[currentTaskIndex]?.question?.value}
                  </div>
                  {recording === "no" && (
                    <div style={styles.optionsContainer}>
                      {tasks[currentTaskIndex]?.options.map((option, index) => (
                        <div
                          key={index}
                          style={{
                            ...styles.option,
                            ...(selectedOption === option.id &&
                              (currentLevel === "S1" ||
                                currentLevel === "S2") &&
                              styles.selectedNeutralOption),
                            ...(currentLevel !== "S1" &&
                              currentLevel !== "S2" &&
                              selectedOption === option.id &&
                              isCorrect === true &&
                              styles.correctOption),
                            ...(currentLevel !== "S1" &&
                              currentLevel !== "S2" &&
                              selectedOption === option.id &&
                              isCorrect === false &&
                              styles.incorrectOption),
                            ...(tasks[currentTaskIndex].options.length === 3 &&
                              index === 2 &&
                              styles.thirdOption),
                          }}
                          onClick={() => {
                            if (!showConfetti) {
                              handleOptionClick(option.id);
                            }
                          }}
                        >
                          {option.value}
                        </div>
                      ))}
                    </div>
                  )}
                  {recording === "recording" && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop:
                          currentLevel === "S1" || currentLevel === "S2"
                            ? "35px"
                            : "30px",
                        gap: "10px",
                      }}
                    >
                      {isLoading ? (
                        <Box sx={{ display: "flex" }}>
                          <CircularProgress
                            size="3rem"
                            sx={{ color: "#E15404" }}
                          />
                        </Box>
                      ) : (
                        <>
                          <VoiceAnalyser
                            pageName={"m8"}
                            setVoiceText={setVoiceText}
                            onAudioProcessed={handleRecordingComplete}
                            setRecordedAudio={setRecordedAudio}
                            setVoiceAnimate={setVoiceAnimate}
                            storyLine={storyLine}
                            dontShowListen={true}
                            handleNext={handleNext}
                            enableNext={enableNext}
                            originalText={parentWords}
                            audioLink={audio ? audio : completeAudio}
                            buttonAnimation={selectedOption}
                            handleStartRecording={handleStartRecording}
                            handleStopRecording={handleStopRecording}
                            {...{
                              contentId,
                              contentType,
                              currentLine: currentStep - 1,
                              playTeacherAudio,
                              callUpdateLearner,
                              isShowCase,
                              setEnableNext,
                              //showOnlyListen: answer !== "correct",
                              showOnlyListen: false,
                              setOpenMessageDialog,
                            }}
                          />
                          {currentLevel !== "S1" && currentLevel !== "S2"
                            ? selectedOption !== null &&
                              recAudio && (
                                <div
                                  onClick={loadNextTask}
                                  style={{
                                    cursor: "pointer",
                                    marginLeft: "35px",
                                  }}
                                >
                                  <NextButtonRound height={45} width={45} />
                                </div>
                              )
                            : recAudio && (
                                <div
                                  onClick={loadNextTask}
                                  style={{
                                    cursor: "pointer",
                                    marginLeft: "35px",
                                  }}
                                >
                                  <NextButtonRound height={45} width={45} />
                                </div>
                              )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </MainLayout>
    </ThemeProvider>
  );
};

export default PhoneConversation;
