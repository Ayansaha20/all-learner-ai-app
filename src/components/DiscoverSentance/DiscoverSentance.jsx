import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../node_modules/axios/index";
import elephant from "../../assets/images/elephant.svg";
import {
  callConfetti,
  getLocalData,
  sendTestRigScore,
  setLocalData,
} from "../../utils/constants";
import WordsOrImage from "../Mechanism/WordsOrImage";
import { uniqueId } from "../../services/utilService";
import useSound from "use-sound";
import LevelCompleteAudio from "../../assets/audio/levelComplete.wav";
import config from "../../utils/urlConstants.json";
import { MessageDialog } from "../Assesment/Assesment";
import { Log } from "../../services/telementryService";
import usePreloadAudio from "../../hooks/usePreloadAudio";
import {
  addPointer,
  fetchUserPoints,
  createLearnerProgress,
} from "../../services/orchestration/orchestrationService";
import { fetchGetSetResult } from "../../services/learnerAi/learnerAiService";
import {
  fetchAssessmentData,
  fetchPaginatedContent,
} from "../../services/content/contentService";

const SpeakSentenceComponent = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const navigate = useNavigate();
  const [recordedAudio, setRecordedAudio] = useState("");
  const [voiceText, setVoiceText] = useState("");
  const [storyLine, setStoryLine] = useState(0);
  const [assessmentResponse, setAssessmentResponse] = useState(undefined);
  const [currentContentType, setCurrentContentType] = useState("");
  const [currentCollectionId, setCurrentCollectionId] = useState("");
  const [voiceAnimate, setVoiceAnimate] = useState(false);
  const [points, setPoints] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [enableNext, setEnableNext] = useState(false);
  const [sentencePassedCounter, setSentencePassedCounter] = useState(0);
  const [assesmentCount, setAssesmentcount] = useState(0);
  const [initialAssesment, setInitialAssesment] = useState(true);
  const [disableScreen, setDisableScreen] = useState(false);
  // const [play] = useSound(LevelCompleteAudio);
  const [openMessageDialog, setOpenMessageDialog] = useState("");
  const [totalSyllableCount, setTotalSyllableCount] = useState("");
  const [isNextButtonCalled, setIsNextButtonCalled] = useState(false);

  const levelCompleteAudioSrc = usePreloadAudio(LevelCompleteAudio);

  const callConfettiAndPlay = () => {
    let audio = new Audio(levelCompleteAudioSrc);
    audio.play();
    callConfetti();
    window.telemetry?.syncEvents && window.telemetry.syncEvents();
  };

  useEffect(() => {
    if (questions?.length) setAssesmentcount(assesmentCount + 1);
  }, [questions]);

  useEffect(() => {
    if (questions?.length && !initialAssesment && currentQuestion === 0) {
      setDisableScreen(true);
      callConfettiAndPlay();
      setTimeout(() => {
        // alert();
        setOpenMessageDialog({
          message:
            "You have successfully completed assessment " + assesmentCount,
        });
        // setDisableScreen(false);
      }, 1200);
    }
  }, [currentQuestion]);

  useEffect(() => {
    if (!localStorage.getItem("contentSessionId")) {
      fetchUserPoints()
        .then((points) => {
          setPoints(points);
        })
        .catch((error) => {
          console.error("Error fetching user points:", error);
          setPoints(0);
        });
    }
  }, []);

  useEffect(() => {
    if (questions?.length) {
      setLocalData("sub_session_id", uniqueId());
    }
  }, [questions]);

  useEffect(() => {
    if (voiceText === "error") {
      // alert("");
      setOpenMessageDialog({
        message: "Sorry I couldn't hear a voice. Could you please speak again?",
        isError: true,
      });
      setVoiceText("");
      setEnableNext(false);
    }
    if (voiceText == "success") {
      // go_to_result(voiceText);
      setVoiceText("");
    }
    //eslint-disable-next-line
  }, [voiceText]);

  const handleNext = async () => {
    setIsNextButtonCalled(true);
    setEnableNext(false);

    try {
      const lang = getLocalData("lang");

      // await axios.post(
      //   `${process.env.REACT_APP_LEARNER_AI_ORCHESTRATION_HOST}/${config.URLS.ADD_LESSON}`,
      //   {
      //     userId: localStorage.getItem("virtualId"),
      //     sessionId: localStorage.getItem("sessionId"),
      //     milestone: `discoveryList/discovery/${currentCollectionId}`,
      //     lesson: localStorage.getItem("storyTitle"),
      //     progress: ((currentQuestion + 1) * 100) / questions.length,
      //     language: lang,
      //     milestoneLevel: "m0",
      //   }
      // );

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else if (currentQuestion === questions.length - 1) {
        const sub_session_id = getLocalData("sub_session_id");
        const getSetResultRes = await fetchGetSetResult(
          sub_session_id,
          currentContentType,
          currentCollectionId,
          totalSyllableCount
        );
        if (!(localStorage.getItem("contentSessionId") !== null)) {
          let point = 1;
          let milestone = "m0";

          if (point !== 1) {
            if (process.env.REACT_APP_IS_APP_IFRAME === "true") {
              navigate("/");
            } else {
              navigate("/discover-start");
            }
            return;
          }

          try {
            const result = await addPointer(point, milestone);
            const awardedPoints = result?.result?.points;
            if (awardedPoints !== 1) {
              if (process.env.REACT_APP_IS_APP_IFRAME === "true") {
                navigate("/");
              } else {
                navigate("/discover-start");
              }
              return;
            }
            setPoints(result?.result?.totalLanguagePoints || 0);
          } catch (error) {
            setPoints(0);
            console.error("Error adding points:", error);
          }
        } else {
          sendTestRigScore(5);
          // setPoints(localStorage.getItem("currentLessonScoreCount"));
        }

        setInitialAssesment(false);
        const { data: getSetData } = getSetResultRes;
        const data = JSON.stringify(getSetData);
        Log(data, "discovery", "ET");
        if (process.env.REACT_APP_POST_LEARNER_PROGRESS === "true") {
          try {
            const milestoneLevel = getSetData?.currentLevel;
            const result = await createLearnerProgress(
              sub_session_id,
              milestoneLevel
            );
          } catch (error) {
            console.error("Error creating learner progress:", error);
          }
        }
        if (
          getSetData.sessionResult === "pass" &&
          currentContentType === "Sentence" &&
          sentencePassedCounter < 2
        ) {
          if (getSetData.currentLevel !== "m0") {
            navigate("/discover-end");
          }
          const newSentencePassedCounter = sentencePassedCounter + 1;
          const sentences = assessmentResponse?.data?.filter(
            (elem) => elem.category === "Sentence"
          );
          const resSentencesPagination = await fetchPaginatedContent(
            sentences?.[newSentencePassedCounter]?.collectionId
          );
          setCurrentContentType("Sentence");
          setTotalSyllableCount(resSentencesPagination?.totalSyllableCount);
          setCurrentCollectionId(
            sentences?.[newSentencePassedCounter]?.collectionId
          );
          let quesArr = [...(resSentencesPagination?.data || [])];
          setCurrentQuestion(0);
          setSentencePassedCounter(newSentencePassedCounter);
          setQuestions(quesArr);
        } else if (getSetData.sessionResult === "pass") {
          navigate("/discover-end");
        } else if (
          getSetData.sessionResult === "fail" &&
          currentContentType === "Sentence"
        ) {
          if (getSetData.currentLevel !== "m0") {
            navigate("/discover-end");
          }
          const words = assessmentResponse?.data?.find(
            (elem) => elem.category === "Word"
          );
          const resWordsPagination = await fetchPaginatedContent(
            words?.collectionId
          );
          setCurrentContentType("Word");
          setTotalSyllableCount(resWordsPagination?.totalSyllableCount);
          setCurrentCollectionId(words?.collectionId);
          let quesArr = [...(resWordsPagination?.data || [])];
          setCurrentQuestion(0);
          setQuestions(quesArr);
        } else if (
          getSetData.sessionResult === "fail" &&
          currentContentType === "Word"
        ) {
          navigate("/discover-end");

          // const char = assessmentResponse?.data?.find(
          //   (elem) => elem.category === "Char"
          // );
          // const resCharPagination = await axios.get(
          //   `${process.env.REACT_APP_LEARNER_AI_APP_HOST}/content-service/v1/content/pagination?page=1&limit=5&collectionId=${char?.content?.[0]?.collectionId}`
          // );
          // setCurrentContentType("Char");
          // setCurrentCollectionId(char?.content?.[0]?.collectionId);
          // setCurrentQuestion(0);
          // let quesArr = [...(resCharPagination?.data?.data || [])];
          // setQuestions(quesArr);
        } else {
          navigate("/discover-end");
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    (async () => {
      let quesArr = [];
      try {
        const lang = getLocalData("lang");
        // Fetch assessment data
        const resAssessment = await fetchAssessmentData(lang);
        const sentences = resAssessment?.data?.find(
          (elem) => elem.category === "Sentence"
        );

        if (!sentences?.collectionId) {
          console.error("No collection ID found for sentences.");
          return;
        }
        // Fetch paginated content
        const resPagination = await fetchPaginatedContent(
          sentences.collectionId
        );

        // Update state
        setCurrentContentType("Sentence");
        setTotalSyllableCount(resPagination?.totalSyllableCount);
        setCurrentCollectionId(sentences?.collectionId);
        setAssessmentResponse(resAssessment);
        setLocalData("storyTitle", sentences?.name);
        quesArr = [...quesArr, ...(resPagination?.data || [])];
        setQuestions(quesArr);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    })();
  }, []);

  const handleBack = () => {
    const destination =
      process.env.REACT_APP_IS_APP_IFRAME === "true" ? "/" : "/discover-start";
    navigate(destination);
    // if (process.env.REACT_APP_IS_APP_IFRAME === 'true') {
    //   navigate("/");
    // } else {
    //   navigate("/discover-start")
    // }
  };

  useEffect(() => {
    localStorage.setItem("mechanism_id", "");
  }, []);

  return (
    <>
      {!!openMessageDialog && (
        <MessageDialog
          message={openMessageDialog.message}
          closeDialog={() => {
            setOpenMessageDialog("");
            setDisableScreen(false);
          }}
          isError={openMessageDialog.isError}
          dontShowHeader={openMessageDialog.dontShowHeader}
        />
      )}
      <WordsOrImage
        {...{
          background: "linear-gradient(45deg, #FF730E 30%, #FFB951 90%)",
          header:
            questions[currentQuestion]?.contentType === "image"
              ? `Guess the below image`
              : `Speak the below ${questions[currentQuestion]?.contentType}`,
          words: questions[currentQuestion]?.contentSourceData?.[0]?.text,
          contentType: currentContentType,
          contentId: questions[currentQuestion]?.contentId,
          setVoiceText,
          setRecordedAudio,
          setVoiceAnimate,
          storyLine,
          handleNext,
          type: questions[currentQuestion]?.contentType,
          // image: elephant,
          enableNext,
          showTimer: false,
          points,
          steps: questions?.length,
          currentStep: currentQuestion + 1,
          isDiscover: true,
          callUpdateLearner: true,
          disableScreen,
          handleBack,
          setEnableNext,
          isNextButtonCalled,
          setIsNextButtonCalled,
          setOpenMessageDialog,
        }}
      />
    </>
  );
};

export default SpeakSentenceComponent;
