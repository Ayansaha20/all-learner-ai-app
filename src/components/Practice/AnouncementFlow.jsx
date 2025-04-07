import React, { useEffect, useState, useRef } from "react";
import { Box, CircularProgress, useMediaQuery } from "@mui/material";
import listenImg2 from "../../assets/listen.png";
import Confetti from "react-confetti";
import { createTheme } from "@mui/material";
import {
  level13,
  level14,
  level10,
  level11,
  level12,
  level15,
} from "../../utils/levelData";
import MainLayout from "../Layouts.jsx/MainLayout";
import * as Assets from "../../utils/imageAudioLinks";
import {
  practiceSteps,
  getLocalData,
  NextButtonRound,
  RetryIcon,
} from "../../utils/constants";
import spinnerStop from "../../assets/pause.png";
import raMic from "../../assets/listen.png";
import raStop from "../../assets/pause.png";
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

const AnouncementFlow = ({
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioInstance, setAudioInstance] = useState(null);
  const [evaluationResults, setEvaluationResults] = useState({});
  const [recording, setRecording] = useState("no");
  const [step, setStep] = useState("initiate");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [highlightedWord, setHighlightedWord] = useState(null);
  const utteranceRef = useRef(null);
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

  // let mediaRecorder;
  // let recordedChunks = [];

  // const startAudioRecording = () => {
  //   navigator.mediaDevices
  //     .getUserMedia({ audio: true })
  //     .then((stream) => {
  //       mediaRecorder = new MediaRecorder(stream);
  //       mediaRecorder.ondataavailable = (event) => {
  //         if (event.data.size > 0) {
  //           recordedChunks.push(event.data);
  //         }
  //       };
  //       mediaRecorder.start();
  //     })
  //     .catch((error) => {
  //       console.error("Error accessing audio stream:", error);
  //     });
  // };

  // const stopAudioRecording = () => {
  //   if (mediaRecorder) {
  //     mediaRecorder.stop();
  //     mediaRecorder.onstop = () => {
  //       const audioBlob = new Blob(recordedChunks, { type: "audio/webm" });
  //       setRecordedAudioBlob(audioBlob);
  //       recordedChunks = [];
  //     };
  //   }
  // };

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

  //const conversation = contentM14[level]?.[currentLevel]?.conversation || content?.conversation;

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

  // const playAudio = (audioKey) => {
  //   if (Assets[audioKey]) {
  //     const audio = new Audio(Assets[audioKey]);
  //     audio.play();
  //   } else {
  //     console.error("Audio file not found:", audioKey);
  //   }
  // };

  const handleHintClick = () => {
    setStep("start");
  };

  const playAudio = (audioKey) => {
    if (isPlaying) {
      // If already playing, stop the audio
      audioInstance.pause();
      audioInstance.currentTime = 0;
      setIsPlaying(false);
    } else {
      if (Assets[audioKey]) {
        const audio = new Audio(Assets[audioKey]);

        audio.onended = () => setIsPlaying(false);

        audio.play();
        setAudioInstance(audio);
        setIsPlaying(true);
      } else {
        console.error("Audio file not found:", audioKey);
      }
    }
  };

  const data = {
    data: {
      instructions: {
        type: "chat",
        content: [
          {
            role: "System",
            message:
              "Start at the bus stop near the supermarket. Walk straight on George Street for about five minutes. You will see a bank on your left and a coffee shop on your right. Keep walking until you reach the traffic signal. Turn right at the signal and walk past the park. The library is next to the school, on the left side of the street. You will see a banyan tree in front of the library. The library has a big blue sign, so it is easy to find!",
            audio: "level12P1Audio",
          },
        ],
      },
      tasks: [
        {
          question: {
            type: "text",
            value: "Where do you start your journey?",
          },
          options: [
            {
              type: "text",
              id: "option1",
              value: "At the school",
            },
            {
              type: "text",
              id: "option2",
              value: "At the bus stop",
            },

            {
              type: "text",
              id: "option3",
              value: "At the library",
            },
          ],
          answer: "option2",
        },
        {
          question: {
            type: "text",
            value: "Which street do you walk on?",
          },
          options: [
            {
              type: "text",
              id: "option1",
              value: "George Street",
            },
            {
              type: "text",
              id: "option2",
              value: "East Street",
            },
            {
              type: "text",
              id: "option3",
              value: "North Street",
            },
          ],
          answer: "option1",
        },
        {
          question: {
            type: "text",
            value: "How long should you walk on George Street?",
          },
          options: [
            {
              type: "text",
              id: "option1",
              value: "Two minutes",
            },
            {
              type: "text",
              id: "option2",
              value: "Five minutes",
            },
            {
              type: "text",
              id: "option3",
              value: "Ten minutes",
            },
          ],
          answer: "option2",
        },
        {
          question: {
            type: "text",
            value: "What is on your left after walking for a while?",
          },
          options: [
            {
              type: "text",
              id: "option1",
              value: "A park",
            },
            {
              type: "text",
              id: "option2",
              value: "A bank",
            },
            {
              type: "text",
              id: "option3",
              value: "A school",
            },
          ],
          answer: "option2",
        },
        {
          question: {
            type: "text",
            value: "What is on your right after walking for a while?",
          },
          options: [
            {
              type: "text",
              id: "option1",
              value: "A bank",
            },
            {
              type: "text",
              id: "option2",
              value: "A coffee shop",
            },
            {
              type: "text",
              id: "option3",
              value: "A supermarket",
            },
          ],
          answer: "option2",
        },
      ],
    },
  };

  useEffect(() => {
    setConversationData(conversation?.instructions?.content);
    //setImageData(conversation?.instructions);
    setCompleteAudio(conversation?.instructions?.content[0]?.audio);
    setTasks(conversation?.tasks);
    setCurrentTaskIndex(0);
  }, []);

  useEffect(() => {
    setConversationData(conversation?.instructions?.content || []);
    setImageData(conversation?.instructions);
    setTasks(conversation?.tasks || []);
    setCurrentTaskIndex(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setShowConfetti(false);
    setShowQuestion(false);
    setStep("initiate");
  }, [currentLevel]);

  console.log(
    "m10",
    tasks,
    currentTaskIndex,
    currentLevel,
    evaluationResults,
    recAudio
  );

  const allTexts = conversationData[0]?.message;

  const handleReadAloud = () => {
    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
      setHighlightedWord(null);
      setStep("stopped");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(allTexts);
    utteranceRef.current = utterance;

    utterance.onboundary = (event) => {
      const charIndex = event.charIndex;
      const words = allTexts.split(" ");
      let cumulativeLength = 0;
      let currentWordIndex = 0;

      for (let i = 0; i < words.length; i++) {
        cumulativeLength += words[i].length + 1;
        if (cumulativeLength > charIndex) {
          currentWordIndex = i;
          break;
        }
      }

      setHighlightedWord({
        word: words[currentWordIndex],
        index: currentWordIndex,
      });
    };

    utterance.onend = () => {
      utteranceRef.current = null;
      setHighlightedWord(null);
      setStep("stopped");
    };

    setStep("playing");
    window.speechSynthesis.speak(utterance);
  };

  const handleReplay = () => {
    setStep("start");
    handleReadAloud();
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

    //setSelectedOption(optionId);

    if (optionId === tasks[currentTaskIndex].answer) {
      const audio = new Audio(correctSound);
      audio.play();
      setIsCorrect(true);
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        setRecording("recording");
        //handleNext();
      }, 3000);
    } else {
      const audio = new Audio(wrongSound);
      audio.play();
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
    }, 2000);
  };

  const styles = {
    mainContainer: {
      background:
        "linear-gradient(0deg, rgba(241, 153, 32, 0.32) 0%, rgba(243, 159, 39, 0.32) 23%, rgba(247, 176, 59, 0.32) 58%, rgba(254, 204, 92, 0.32) 100%)",
      height: "100%",
      //minHeight: "70vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      alignItems: "flex-end",
      padding: isMobile ? "10px" : "20px",
      overflowX: "hidden",
      position: "relative",
    },
    innerContainer: {
      backgroundColor: "#fff",
      borderRadius: "10px",
      padding: isMobile ? "10px" : "20px",
      width: "100%",
      position: "relative",
      maargin: "20px",
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
      overflowX: "hidden",
      //minHeight: "60vh",
      overflowY: "hidden",
      //marginBottom: "40px",
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
      gap: "50px",
      marginTop: "15px",
    },
    message: {
      padding: "10px",
      borderRadius: "10px",
      maxWidth: "60%",
      fontSize: "16px",
      position: "relative",
      whiteSpace: "pre-wrap",
      marginLeft: "100px",
    },
    selectedNeutralOption: {
      backgroundColor: "#f0f0f0",
      //borderColor: '#aaa',
    },
    sonMessage: {
      //backgroundColor: "#fde4b2",
      alignSelf: "flex-start",
      width: "300px",
      marginLeft: "80px",
    },
    callerMessage: {
      //backgroundColor: "#f1f1f1",
      alignSelf: "flex-end",
      width: "280px",
      marginRight: "180px",
      marginBottom: "-60px",
    },
    boldText: {
      fontWeight: "bold",
    },
    highlighted: {
      backgroundColor: "#f8d7da",
      padding: "2px 4px",
      borderRadius: "4px",
    },
    audioIcon: {
      //width: "30px",
      height: "70px",
      cursor: "pointer",
      marginTop: "50px",
    },
    profileIcon: {
      width: "25px",
      height: "25px",
      borderRadius: "50%",
    },
    boyIcon: {
      width: "25px",
      height: "25px",
      position: "absolute",
      left: "-30px",
      bottom: "10%",
      transform: "translateY(50%)",
    },
    callerIconsContainer: {
      position: "absolute",
      right: "-80px",
      bottom: "10%",
      transform: "translateY(50%)",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    nextButton: {
      position: "absolute",
      bottom: "10px",
      right: "10px",
      width: "50px",
      height: "50px",
      cursor: "pointer",
    },
    questionBox: {
      backgroundColor: "#f8f2ff",
      borderRadius: "20px",
      padding: isMobile ? "10px" : "15px",
      fontWeight: "bold",
      //display: "relative",
      border: "1px dashed #d8b6ff",
      fontSize: isMobile ? "18px" : isTablet ? "20px" : "24px",
      width: isMobile ? "90%" : isTablet ? "70%" : "50%",

      marginLeft: "auto",
      marginRight: "auto",
      //marginLeft: "400px",
      marginTop: isMobile ? "50px" : "20px",
      textAlign: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      //minHeight: "100px",
    },
    optionsContainer: {
      marginTop: "20px",
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
      padding: "10px",
      position: "relative",
    },

    option: {
      backgroundColor: "#fff",
      padding: "15px",
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
        //fluency = false,
        isShowCase,
        startShowCase,
        setStartShowCase,
        livesData,
        gameOverData,
        setIsNextButtonCalled,
      }}
    >
      <div style={styles.mainContainer}>
        {!showQuestion && (
          <div
            style={{
              display: "flex",
              position: "absolute",
              justifyContent: "space-between",
              width: "100%",
              alignItems: "flex-end",
            }}
          >
            <img
              src={Assets[imageData?.imageOne] || Assets.atm}
              alt="Next"
              height={"130px"}
              //width={"75px"}
              //onClick={handleNextClick}
              style={{ cursor: "pointer", marginTop: "0px", zIndex: "9999" }}
            />
            <img
              src={Assets[imageData?.imageTwo] || Assets.mall}
              alt="Next"
              height={"130px"}
              //width={"75px"}
              //onClick={handleNextClick}
              style={{ cursor: "pointer", marginTop: "0px", zIndex: "9999" }}
            />
          </div>
        )}
        {showConfetti && <Confetti />}
        <div style={styles.innerContainer}>
          {!showQuestion ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                alignItems: "center",
              }}
            >
              {step !== "questions" &&
                step !== "initiate" &&
                step !== "finished" &&
                step !== "stoppedRecording" &&
                step !== "recording" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "10px",
                      marginTop: "20px",
                    }}
                  >
                    {/* {allTexts.split(". ").map((sentence, index) => (
                              <div key={index}>
                                {sentence.split(" ").map((word, wordIndex) => (
                                  <span
                                    key={wordIndex}
                                    style={{
                                      backgroundColor:
                                        word === highlightedWord
                                          ? "#833B1C40"
                                          : "transparent",
                                      transition: "background-color 0.2s ease",
                                      border:
                                        word === highlightedWord
                                          ? "1px solid #42210B"
                                          : "none",
                                      color: "#000000",
                                      fontSize: "20px",
                                      fontWeight: "500",
                                    }}
                                  >
                                    {word}{" "}
                                  </span>
                                ))}
                              </div>
                            ))} */}
                    <div
                      style={{
                        whiteSpace: "pre-wrap",
                        width: "75%",
                        lineHeight: "1.8",
                      }}
                    >
                      {allTexts?.split(" ").map((word, wordIndex) => (
                        <span
                          key={wordIndex}
                          style={{
                            backgroundColor:
                              highlightedWord &&
                              highlightedWord.index === wordIndex
                                ? "#833B1C40"
                                : "transparent",
                            transition: "background-color 0.2s ease",
                            border:
                              highlightedWord &&
                              highlightedWord.index === wordIndex
                                ? "1px solid #42210B"
                                : "none",
                            color: "#000000",
                            fontSize: "18px",
                            fontWeight: "600",
                            textAlign: "center",
                            alignContent: "center",
                            alignSelf: "center",
                            alignItems: "center",
                            width: "50px",
                            fontFamily: "Quicksand",
                          }}
                        >
                          {word}{" "}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Start Button */}
              {step === "initiate" && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "17px",
                    marginBottom: "150px",
                    marginTop: "130px",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      padding: "0",
                      cursor: "pointer",
                    }}
                    onClick={handleHintClick}
                  >
                    <img
                      src={Assets.hintNew}
                      alt="Hint"
                      style={{
                        width: "50px",
                        height: "50px",
                        marginLeft: "12px",
                      }}
                    />
                  </div>
                  <img
                    src={isPlaying ? spinnerStop : listenImg2}
                    alt="Audio"
                    style={{
                      height: "50px",
                      width: "50px",
                      cursor: "pointer",
                      //marginTop: "5px",
                      //marginRight: "15px"
                    }}
                    onClick={() => playAudio(conversationData[0]?.audio)}
                  />
                  {/* <img
                    src={raNext}
                    alt="Next"
                    height={"70px"}
                    width={"70px"}
                    onClick={handleNextClick}
                    style={{ cursor: "pointer" }}
                  /> */}
                  <div onClick={handleNextClick} style={{ cursor: "pointer" }}>
                    <NextButtonRound height={50} width={50} />
                  </div>
                </div>
              )}

              {step === "start" && (
                <img
                  src={raMic}
                  alt="Start"
                  height={"70px"}
                  width={"70px"}
                  onClick={handleReadAloud}
                  style={{ cursor: "pointer", marginTop: "50px" }}
                />
              )}

              {/* Stop Button */}
              {step === "playing" && (
                <img
                  src={raStop}
                  alt="Stop"
                  height={"70px"}
                  width={"70px"}
                  onClick={handleReadAloud}
                  style={{ cursor: "pointer", marginTop: "50px" }}
                />
              )}

              {/* Replay & Next Buttons */}
              {step === "stopped" && (
                <div
                  style={{ display: "flex", gap: "20px", marginTop: "50px" }}
                >
                  {/* <img
                    src={raRetry}
                    alt="Retry"
                    height={"70px"}
                    width={"75px"}
                    onClick={handleReplay}
                    style={{ cursor: "pointer", marginTop: "80px" }}
                  /> */}
                  <div onClick={handleReplay} style={{ cursor: "pointer" }}>
                    <RetryIcon height={70} width={70} />
                  </div>
                  {/* <img
                    src={raNext}
                    alt="Next"
                    height={"70px"}
                    width={"75px"}
                    onClick={handleNextClick}
                    style={{ cursor: "pointer", marginTop: "80px" }}
                  /> */}
                  <div onClick={handleNextClick} style={{ cursor: "pointer" }}>
                    <NextButtonRound height={70} width={70} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            tasks[currentTaskIndex] && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <img
                  src={isPlaying ? spinnerStop : listenImg2}
                  alt="Audio"
                  style={{
                    height: "50px",
                    width: "50px",
                    cursor: "pointer",
                    //: "5px",
                  }}
                  onClick={() => playAudio(conversationData[0].audio)}
                />
                <div style={styles.questionBox}>
                  {tasks[currentTaskIndex]?.question?.value}
                </div>
                {/* {recording === "no" && ( */}
                {currentLevel !== "S1" && currentLevel !== "S2" && (
                  <div style={styles.optionsContainer}>
                    {tasks[currentTaskIndex]?.options.map((option, index) => (
                      <div
                        key={index}
                        style={{
                          ...styles.option,
                          ...(selectedOption === option.id &&
                            (currentLevel === "S1" || currentLevel === "S2") &&
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
                {/* // )} */}
                {/* {recording === "recording" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "80px",
                      marginTop: "15px"
                    }}
                  >
                    <img
                      onClick={() => {
                        setRecording("startRec");
                      }}
                      src={pzMic}
                      alt="mic"
                      style={{ width: "70px", height: "70px" }}
                    />
                  </div>
                )}
                {recording === "startRec" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "80px",
                      marginTop: "15px"
                    }}
                  >
                    <img
                      src={spinnerWave}
                      alt="Wave"
                      style={{ width: "300px", height: "80px" }}
                    />
                    <img
                      onClick={() => {
                        setRecording("no");
                        loadNextTask();
                      }}
                      src={spinnerStop}
                      alt="Stop"
                      style={{
                        width: "60px",
                        height: "60px",
                        cursor: "pointer",
                      }}
                    />
                  </div>
                )} */}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop:
                      currentLevel === "S1" || currentLevel === "S2"
                        ? "30px"
                        : "15px",
                    gap: "10px",
                  }}
                >
                  {isLoading ? (
                    <Box sx={{ display: "flex" }}>
                      <CircularProgress size="3rem" sx={{ color: "#E15404" }} />
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
                              style={{ cursor: "pointer", marginLeft: "35px" }}
                            >
                              <NextButtonRound height={45} width={45} />
                            </div>
                          )
                        : recAudio && (
                            <div
                              onClick={loadNextTask}
                              style={{ cursor: "pointer", marginLeft: "35px" }}
                            >
                              <NextButtonRound height={45} width={45} />
                            </div>
                          )}
                    </>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default AnouncementFlow;
