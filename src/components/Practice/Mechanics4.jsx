import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import VoiceAnalyser from "../../utils/VoiceAnalyser";
import MainLayout from "../Layouts.jsx/MainLayout";
// import useSound from "use-sound";
// import t from "../../assets/audio/t.mp3";
// import i from "../../assets/audio/i.mp3";
// import g from "../../assets/audio/g.mp3";
// import e from "../../assets/audio/e.mp3";
// import r from "../../assets/audio/r.mp3";
import correctSound from "../../assets/audio/correct.wav";
import wrongSound from "../../assets/audio/wrong.wav";
import addSound from "../../assets/audio/add.mp3";
import removeSound from "../../assets/audio/remove.wav";
import { splitGraphemes } from "split-graphemes";

const Mechanics4 = ({
  page,
  setPage,
  setVoiceText,
  setRecordedAudio,
  setVoiceAnimate,
  storyLine,
  type,
  handleNext,
  background,
  header,
  parentWords = "",
  image,
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
}) => {
  const [words, setWords] = useState(
    type === "word" ? [] : ["Friend", "She is", "My"]
  );
  const [wordsAfterSplit, setWordsAfterSplit] = useState([]);

  useEffect(() => {
    setSelectedWords([]);
  }, [contentId]);

  const [shake, setShake] = useState(false);

  function jumbleSentence(sentence) {
    // Split the sentence into words
    const words = sentence.split(" ");

    // Shuffle the words using Fisher-Yates (Durstenfeld) shuffle algorithm
    for (let i = words.length - 1; i > 0; i--) {
      // Pick a random index from 0 to i
      const j = Math.floor(Math.random() * (i + 1));

      // Swap words[i] with the element at random index
      [words[i], words[j]] = [words[j], words[i]];
    }

    // Join the jumbled words back into a sentence
    return words;
  }

  useEffect(() => {
    let wordsArr = jumbleSentence(parentWords);

    console.log(wordsArr);
    if (parentWords) {
      for (let i = wordsArr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * i);
        let k = wordsArr[i];
        wordsArr[i] = wordsArr[j];
        wordsArr[j] = k;
      }
      setWordsAfterSplit(wordsArr);
      setWords(wordsArr);
    }
  }, [parentWords]);

  const [selectedWords, setSelectedWords] = useState([]);

  // const [tPlay] = useSound(t);
  // const [iPlay] = useSound(i);
  // const [gPlay] = useSound(g);
  // const [ePlay] = useSound(e);
  // const [rPlay] = useSound(r);

  // const audioPlay = {
  //   T: tPlay,
  //   I: iPlay,
  //   G: gPlay,
  //   E: ePlay,
  //   R: rPlay,
  // };
  const handleWords = (word, isSelected) => {
    setShake(true);
    setTimeout(() => {
      setShake(false);
    }, 3000);
    // audioPlay[word]();
    if (selectedWords?.length + 1 !== wordsAfterSplit?.length || isSelected) {
      let audio = new Audio(isSelected ? removeSound : addSound);
      audio.play();
    }

    if (isSelected) {
      let selectedWordsArr = [...selectedWords];
      let index = selectedWordsArr?.findIndex((elem) => elem === word);
      selectedWordsArr?.splice(index, 1);
      setSelectedWords(selectedWordsArr);
      setWords([...words, word]);
    } else {
      let wordsArr = [...words];
      let index = wordsArr?.findIndex((elem) => elem === word);
      wordsArr?.splice(index, 1);
      setWords(wordsArr);
      setSelectedWords([...selectedWords, word]);
      if (selectedWords?.length + 1 === wordsAfterSplit?.length) {
        let audio = new Audio(
          [...selectedWords, word]?.join("") === parentWords
            ? correctSound
            : wrongSound
        );
        audio.play();
      }
    }
  };

  const answer =
    selectedWords?.length !== wordsAfterSplit?.length
      ? ""
      : selectedWords?.join(" ") === parentWords
      ? "correct"
      : "wrong";

  return (
    <MainLayout
      background={background}
      handleNext={handleNext}
      enableNext={enableNext}
      showTimer={showTimer}
      points={points}
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
          left: `calc(50% - 258px / 2)`,
          top: `calc(50% - 45px / 2 - 235.5px)`,
          fontFamily: "Quicksand",
          fontStyle: "normal",
          fontWeight: 600,
          fontSize: "36px",
          lineHeight: "45px",
          alignItems: "center",
          textAlign: "center",
          color: "#333F61",
        }}
      >
        {header}
      </div>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2, mt: 8 }}>
        <Box
          sx={{
            minWidth: "250px",
            minHeight: "75px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "15px",
            border: `2px solid ${
              answer === "correct"
                ? "#58CC02"
                : answer === "wrong"
                ? "#C30303"
                : !words?.length && !!selectedWords?.length && type === "word"
                ? "#1897DE"
                : "rgba(51, 63, 97, 0.10)"
            }`,
            cursor: "pointer",
            letterSpacing: answer != "correct" ? "5px" : "normal",
            background: "#FBFBFB",
            paddingX: type === "word" ? 0 : "20px",
          }}
        >
          {selectedWords?.map((elem) => (
            <span
              onClick={() => handleWords(elem, true)}
              className={
                answer === "wrong"
                  ? `audioSelectedWrongWord ${shake ? "shakeImage" : ""}`
                  : ""
              }
              style={{
                borderRadius: "12px",
                padding: "5px 10px 5px 10px",
                border:
                  answer != "wrong"
                    ? answer === "correct"
                      ? "none" // No border if the answer is correct
                      : answer === "wrong"
                      ? "2px solid #C30303" // Red border if the answer is wrong
                      : !words.length && selectedWords.length && type === "word"
                      ? "2px solid #1897DE" // Blue border for some specific condition
                      : "2px solid rgba(51, 63, 97, 0.15)"
                    : "", // Default light border,
                color:
                  type === "word"
                    ? answer === "correct"
                      ? "#58CC02"
                      : answer === "wrong"
                      ? "#C30303"
                      : "#1897DE"
                    : answer === "wrong"
                    ? "#C30303"
                    : "#333F61",
                fontWeight: type === "word" ? 600 : 700,
                fontSize: "40px",
                fontFamily: "Quicksand",
                cursor: "pointer",
                marginLeft:
                  type === "word" ? 0 : answer != "correct" ? "20px" : 0,
              }}
            >
              {elem}
            </span>
          ))}
        </Box>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        {words?.map((elem) => (
          <>
            {type === "word" ? (
              <Box
                onClick={() => handleWords(elem)}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "60px",
                  minWidth: "60px",
                  background: "#1897DE",
                  m: 1,
                  cursor: "pointer",
                  borderRadius: "12px",
                  border: "5px solid #10618E",
                }}
              >
                <span
                  style={{
                    color: "white",
                    fontWeight: 600,
                    fontSize: "40px",
                    fontFamily: "Quicksand",
                  }}
                >
                  {elem}
                </span>
              </Box>
            ) : (
              <Box
                onClick={() => handleWords(elem)}
                sx={{
                  textAlign: "center",
                  px: "25px",
                  py: "12px",
                  // background: "transparent",
                  m: 1,
                  textTransform: "none",
                  borderRadius: "12px",
                  border: `1px solid rgba(51, 63, 97, 0.10)`,
                  background: "#FFF",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    color: "#6F80B1",
                    fontWeight: 600,
                    fontSize: "32px",
                    fontFamily: "Quicksand",
                  }}
                >
                  {elem}
                </span>
              </Box>
            )}
          </>
        ))}
      </Box>
      {
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <VoiceAnalyser
            setVoiceText={setVoiceText}
            setRecordedAudio={setRecordedAudio}
            setVoiceAnimate={setVoiceAnimate}
            storyLine={storyLine}
            dontShowListen={type === "image" || isDiscover}
            // updateStory={updateStory}
            originalText={parentWords}
            {...{
              contentId,
              contentType,
              currentLine: currentStep - 1,
              playTeacherAudio,
              callUpdateLearner,
              isShowCase,
              setEnableNext,
              showOnlyListen: answer !== "correct",
              setOpenMessageDialog,
            }}
          />
        </Box>
      }
    </MainLayout>
  );
};

export default Mechanics4;
