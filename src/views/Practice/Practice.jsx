import React, { useEffect, useState } from "react";
import Mechanics2 from "../../components/Practice/Mechanics2";
import Mechanics3 from "../../components/Practice/Mechanics3";
import Mechanics4 from "../../components/Practice/Mechanics4";
import Mechanics5 from "../../components/Practice/Mechanics5";
import BingoCard from "../../components/Practice/BingoCard";
import SyllablePuzzle from "../../components/Practice/SyllablePuzzle";
import ReadAloud from "../../components/Practice/ReadAloud";
import R3 from "../../components/Practice/R3";
import R1 from "../../RFlow/R1";
import R2 from "../../RFlow/R2";
import R3Flow from "../../RFlow/R3";
import R4 from "../../RFlow/R4";
import McqFlow from "../../components/Practice/McqFlow";
import JumbledWord from "../../components/Practice/JumbledWord";
import AskMoreM14 from "../../components/Practice/AskMoreM14";
import ActOutM13 from "../../components/Practice/ActOutM13";
import PhoneConversation from "../../components/Practice/PhoneConversation";
import PhrasesInAction from "../../components/Practice/PhrasesInAction";
import WhatsMissing from "../../components/Practice/WhatsMissing";
import ArrangePicture from "../../components/Practice/ArrangePicture";
import AnouncementFlow from "../../components/Practice/AnouncementFlow";
import { useNavigate } from "react-router-dom";
import {
  callConfetti,
  getLocalData,
  levelGetContent,
  practiceSteps,
  sendTestRigScore,
  setLocalData,
} from "../../utils/constants";
import axios from "axios";
import WordsOrImage from "../../components/Mechanism/WordsOrImage";
import { uniqueId } from "../../services/utilService";
import LevelCompleteAudio from "../../assets/audio/levelComplete.wav";
import { splitGraphemes } from "split-graphemes";
import { Typography } from "@mui/material";
import config from "../../utils/urlConstants.json";
import { MessageDialog } from "../../components/Assesment/Assesment";
import { Log } from "../../services/telementryService";
import Mechanics6 from "../../components/Practice/Mechanics6";
import Mechanics7 from "../../components/Practice/Mechanics7";
import * as Assets from "../../utils/imageAudioLinks";
import * as s3Assets from "../../utils/s3Links";
import { getAssetUrl } from "../../utils/s3Links";
import { getAssetAudioUrl } from "../../utils/s3Links";
import { PutBucketInventoryConfigurationRequestFilterSensitiveLog } from "@aws-sdk/client-s3";
import usePreloadAudio from "../../hooks/usePreloadAudio";
import { levelMapping } from "../../utils/levelData";
import { jwtDecode } from "jwt-decode";

import {
  addLesson,
  addPointer,
  fetchUserPoints,
  createLearnerProgress,
  getLessonProgressByID,
} from "../../services/orchestration/orchestrationService";
import {
  getContent,
  getFetchMilestoneDetails,
  getSetResultPractice,
} from "../../services/learnerAi/learnerAiService";

const Practice = () => {
  const [page, setPage] = useState("");
  const [recordedAudio, setRecordedAudio] = useState("");
  const [voiceText, setVoiceText] = useState("");
  const [storyLine, setStoryLine] = useState(0);
  const [voiceAnimate, setVoiceAnimate] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const navigate = useNavigate();
  const [assessmentResponse, setAssessmentResponse] = useState(undefined);
  const [currentContentType, setCurrentContentType] = useState("");
  const [currentCollectionId, setCurrentCollectionId] = useState("");
  const [points, setPoints] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [enableNext, setEnableNext] = useState(false);
  const [progressData, setProgressData] = useState({});
  const [currentImage, setCurrentImage] = useState({});
  const [parentWords, setParentWords] = useState({});
  const [levelOneWord, setLevelOneWord] = useState("");
  const [level, setLevel] = useState(0);
  const [isShowCase, setIsShowCase] = useState(false);
  const [startShowCase, setStartShowCase] = useState(false);
  const limit = 5;
  const [disableScreen, setDisableScreen] = useState(false);
  const [mechanism, setMechanism] = useState("");

  const [livesData, setLivesData] = useState();
  const [gameOverData, setGameOverData] = useState();
  const [loading, setLoading] = useState();
  const LIVES = 5;
  const TARGETS_PERCENTAGE = 0.3;
  const [openMessageDialog, setOpenMessageDialog] = useState("");
  const lang = getLocalData("lang");
  const [totalSyllableCount, setTotalSyllableCount] = useState("");
  const [percentage, setPercentage] = useState("");
  const [fluency, setFluency] = useState(false);
  const [isNextButtonCalled, setIsNextButtonCalled] = useState(false);
  const [rStep, setRStep] = useState(() => {
    return Number(getLocalData("rStep")) || 2;
  });

  const levels = {
    L1: [
      {
        completeWord: "Apple",
        syllable: ["Ap", "ple"],
        img: getAssetUrl(s3Assets.Apple) || Assets.Apple,
        syllablesAudio: [
          {
            name: "Ap",
            audio: getAssetAudioUrl(s3Assets.apAudio) || Assets.apAudio,
          },
          {
            name: "ple",
            audio: getAssetAudioUrl(s3Assets.pleAudio) || Assets.pleAudio,
          },
        ],
        completeAudio:
          getAssetAudioUrl(s3Assets.appleAudio) || Assets.appleAudio,
      },
      {
        completeWord: "Tiger",
        syllable: ["Ti", "ger"],
        img: getAssetUrl(s3Assets.TigerNewImg) || Assets.TigerNewImg,
        syllablesAudio: [
          {
            name: "Ti",
            audio: getAssetAudioUrl(s3Assets.tiAudio) || Assets.tiAudio,
          },
          {
            name: "ger",
            audio: getAssetAudioUrl(s3Assets.gerAudio) || Assets.gerAudio,
          },
        ],
        completeAudio:
          getAssetAudioUrl(s3Assets.tigerAudio) || Assets.tigerAudio,
      },
      {
        completeWord: "Happy",
        syllable: ["Hap", "py"],
        img: getAssetUrl(s3Assets.happyImg) || Assets.happyImg,
        syllablesAudio: [
          {
            name: "Hap",
            audio: getAssetAudioUrl(s3Assets.hapAudio) || Assets.hapAudio,
          },
          {
            name: "py",
            audio: getAssetAudioUrl(s3Assets.pyAudio) || Assets.pyAudio,
          },
        ],
        completeAudio:
          getAssetAudioUrl(s3Assets.happyAudio) || Assets.happyAudio,
      },
      {
        completeWord: "Pencil",
        syllable: ["Pen", "cil"],
        img: getAssetUrl(s3Assets.pencilImg) || Assets.pencilImg,
        syllablesAudio: [
          {
            name: "Pen",
            audio: Assets.penAudio,
          },
          {
            name: "cil",
            audio: getAssetAudioUrl(s3Assets.cilAudio) || Assets.cilAudio,
          },
        ],
        completeAudio:
          getAssetAudioUrl(s3Assets.pencilAudio) || Assets.pencilAudio,
      },
      {
        completeWord: "Rocket",
        syllable: ["Rock", "et"],
        img: getAssetUrl(s3Assets.RocketNewImg) || Assets.RocketNewImg,
        syllablesAudio: [
          {
            name: "Rock",
            audio: getAssetAudioUrl(s3Assets.Rock) || Assets.Rock,
          },
          { name: "Et", audio: getAssetAudioUrl(s3Assets.Et) || Assets.Et },
        ],
        completeAudio: getAssetAudioUrl(s3Assets.RocketS) || Assets.RocketS,
      },
    ],
    L2: [
      {
        completeWord: "Basket",
        syllable: ["Bas", "ket"],
        img: getAssetUrl(s3Assets.Basket) || Assets.Basket,
        syllablesAudio: [
          { name: "Bas", audio: getAssetAudioUrl(s3Assets.Bas) || Assets.Bas },
          { name: "Ket", audio: Assets.Ket },
        ],
        completeAudio: getAssetAudioUrl(s3Assets.BasketS) || Assets.BasketS,
      },
      {
        completeWord: "Dinner",
        syllable: ["Din", "ner"],
        img: getAssetUrl(s3Assets.DinnerNewImg) || Assets.DinnerNewImg,
        syllablesAudio: [
          {
            name: "Din",
            audio: getAssetAudioUrl(s3Assets.dinAudio) || Assets.dinAudio,
          },
          {
            name: "ner",
            audio: getAssetAudioUrl(s3Assets.nerAudio) || Assets.nerAudio,
          },
        ],
        completeAudio:
          getAssetAudioUrl(s3Assets.dinnerAudio) || Assets.dinnerAudio,
      },
      {
        completeWord: "Window",
        syllable: ["Win", "dow"],
        img: getAssetUrl(s3Assets.WindowNewImg) || Assets.WindowNewImg,
        syllablesAudio: [
          {
            name: "Win",
            audio: getAssetAudioUrl(s3Assets.winAudio) || Assets.winAudio,
          },
          {
            name: "dow",
            audio: getAssetAudioUrl(s3Assets.dowAudio) || Assets.dowAudio,
          },
        ],
        completeAudio:
          getAssetAudioUrl(s3Assets.windowAudio) || Assets.windowAudio,
      },
      {
        completeWord: "Magnet",
        syllable: ["Mag", "net"],
        img: getAssetUrl(s3Assets.MagnetNewImg) || Assets.MagnetNewImg,
        syllablesAudio: [
          {
            name: "Mag",
            audio: getAssetAudioUrl(s3Assets.magAudio) || Assets.magAudio,
          },
          {
            name: "net",
            audio: getAssetAudioUrl(s3Assets.netAudio) || Assets.netAudio,
          },
        ],
        completeAudio:
          getAssetAudioUrl(s3Assets.magnetAudio) || Assets.magnetAudio,
      },
      {
        completeWord: "Tennis",
        syllable: ["Ten", "nis"],
        img: getAssetUrl(s3Assets.TennisNewImg) || Assets.TennisNewImg,
        syllablesAudio: [
          {
            name: "Ten",
            audio: getAssetAudioUrl(s3Assets.tenAudio) || Assets.tenAudio,
          },
          {
            name: "nis",
            audio: getAssetAudioUrl(s3Assets.nisAudio) || Assets.nisAudio,
          },
        ],
        completeAudio:
          getAssetAudioUrl(s3Assets.tennisAudio) || Assets.tennisAudio,
      },
    ],
    P1: [
      { completeWord: "River", syllable: ["Ri", "ver"] },
      { completeWord: "Signal", syllable: ["Sig", "nal"] },
      { completeWord: "Boring", syllable: ["Bor", "ing"] },
      { completeWord: "Table", syllable: ["Ta", "ble"] },
      { completeWord: "Carpet", syllable: ["Car", "pet"] },
    ],
    P2: [
      { completeWord: "Rabbit", syllable: ["Rab", "bit"] },
      { completeWord: "Table", syllable: ["Ta", "ble"] },
      { completeWord: "Lemon", syllable: ["Le", "mon"] },
      { completeWord: "Tomato", syllable: ["To", "ma", "to"] },
      { completeWord: "Apple", syllable: ["Ap", "ple"] },
    ],
    S1: [
      { completeWord: "Tiger", syllable: ["Ti", "ger"] },
      { completeWord: "Rocket", syllable: ["Rock", "et"] },
      { completeWord: "Lemon", syllable: ["Le", "mon"] },
      { completeWord: "Tomato", syllable: ["To", "ma", "to"] },
      { completeWord: "Mango", syllable: ["Man", "go"] },
    ],
    L3: [
      {
        completeWord: "Picture",
        syllable: ["Pic", "ture"],
        img: getAssetUrl(s3Assets.PictureNewImg) || Assets.PictureNewImg,
        syllablesAudio: [
          {
            name: "Pic",
            audio: getAssetAudioUrl(s3Assets.picAudio) || Assets.picAudio,
          },
          {
            name: "ture",
            audio: getAssetAudioUrl(s3Assets.tureAudio) || Assets.tureAudio,
          },
        ],
        completeAudio:
          getAssetAudioUrl(s3Assets.pictureAudio) || Assets.pictureAudio,
      },
      {
        completeWord: "Number",
        syllable: ["Num", "ber"],
        img: getAssetUrl(s3Assets.NumberNewImg) || Assets.NumberNewImg,
        syllablesAudio: [
          {
            name: "Num",
            audio: getAssetAudioUrl(s3Assets.numAudio) || Assets.numAudio,
          },
          {
            name: "ber",
            audio: getAssetAudioUrl(s3Assets.berAudio) || Assets.berAudio,
          },
        ],
        completeAudio:
          getAssetAudioUrl(s3Assets.numberAudio) || Assets.numberAudio,
      },
      {
        completeWord: "Doctor",
        syllable: ["Doc", "tor"],
        img: getAssetUrl(s3Assets.DoctorNewImg) || Assets.DoctorNewImg,
        syllablesAudio: [
          {
            name: "Doc",
            audio: getAssetAudioUrl(s3Assets.docAudio) || Assets.docAudio,
          },
          {
            name: "tor",
            audio: getAssetAudioUrl(s3Assets.torAudio) || Assets.torAudio,
          },
        ],
        completeAudio:
          getAssetAudioUrl(s3Assets.doctorAudio) || Assets.doctorAudio,
      },
      {
        completeWord: "Paper",
        syllable: ["Pa", "per"],
        img: getAssetUrl(s3Assets.questionPaperImg) || Assets.questionPaperImg,
        syllablesAudio: [
          {
            name: "Pa",
            audio: getAssetAudioUrl(s3Assets.paAudio) || Assets.paAudio,
          },
          {
            name: "per",
            audio: getAssetAudioUrl(s3Assets.perAudio) || Assets.perAudio,
          },
        ],
        completeAudio:
          getAssetAudioUrl(s3Assets.paperAudio) || Assets.paperAudio,
      },
      {
        completeWord: "Monkey",
        syllable: ["Mon", "key"],
        img: getAssetUrl(s3Assets.MonkeyNewImg) || Assets.MonkeyNewImg,
        syllablesAudio: [
          {
            name: "Mon",
            audio: getAssetAudioUrl(s3Assets.monAudio) || Assets.monAudio,
          },
          {
            name: "key",
            audio: getAssetAudioUrl(s3Assets.keyAudio) || Assets.keyAudio,
          },
        ],
        completeAudio:
          getAssetAudioUrl(s3Assets.monkeyAudio) || Assets.monkeyAudio,
      },
    ],
    L4: [
      {
        completeWord: "Garden",
        syllable: ["Gar", "den"],
        img: getAssetUrl(s3Assets.gardenImg) || Assets.GardenNewImg,
        syllablesAudio: [
          {
            name: "Gar",
            audio: getAssetAudioUrl(s3Assets.garAudio) || Assets.garAudio,
          },
          {
            name: "den",
            audio: getAssetAudioUrl(s3Assets.denAudio) || Assets.denAudio,
          },
        ],
        completeAudio:
          getAssetAudioUrl(s3Assets.GardenAudio) || Assets.GardenAudio,
      },
      {
        completeWord: "Helmet",
        syllable: ["Hel", "met"],
        img: getAssetUrl(s3Assets.helmetImg) || Assets.helmetImg,
        syllablesAudio: [
          {
            name: "Hel",
            audio: getAssetAudioUrl(s3Assets.helAudio) || Assets.helAudio,
          },
          {
            name: "met",
            audio: getAssetAudioUrl(s3Assets.metAudio) || Assets.metAudio,
          },
        ],
        completeAudio:
          getAssetAudioUrl(s3Assets.helmetAudio) || Assets.helmetAudio,
      },
      {
        completeWord: "Kitten",
        syllable: ["Kit", "ten"],
        img: getAssetUrl(s3Assets.catImage) || Assets.catImage,
        syllablesAudio: [
          { name: "Kit", audio: getAssetAudioUrl(s3Assets.Kit) || Assets.Kit },
          { name: "ten", audio: getAssetAudioUrl(s3Assets.Ten) || Assets.Ten },
        ],
        completeAudio: getAssetAudioUrl(s3Assets.KittenS) || Assets.KittenS,
      },
      {
        completeWord: "Jacket",
        syllable: ["Jack", "et"],
        img: getAssetUrl(s3Assets.Jacket) || Assets.Jacket,
        syllablesAudio: [
          {
            name: "Jack",
            audio: getAssetAudioUrl(s3Assets.Jack) || Assets.Jack,
          },
          { name: "et", audio: getAssetAudioUrl(s3Assets.Et) || Assets.Et },
        ],
        completeAudio: getAssetAudioUrl(s3Assets.JacketS) || Assets.JacketS,
      },
      {
        completeWord: "Pocket",
        syllable: ["Pock", "et"],
        img: getAssetUrl(s3Assets.pocketImage) || Assets.pocketImage,
        syllablesAudio: [
          {
            name: "Pock",
            audio: getAssetAudioUrl(s3Assets.Pock) || Assets.Pock,
          },
          { name: "et", audio: getAssetAudioUrl(s3Assets.Et) || Assets.Et },
        ],
        completeAudio: getAssetAudioUrl(s3Assets.PocketS) || Assets.PocketS,
      },
    ],
    P3: [
      { completeWord: "Basket", syllable: ["Bas", "ket"] },
      { completeWord: "Tunnel", syllable: ["Tun", "nel"] },
      { completeWord: "Sunset", syllable: ["Sun", "set"] },
      { completeWord: "Candle", syllable: ["Can", "dle"] },
      { completeWord: "Button", syllable: ["But", "ton"] },
    ],
    P4: [
      { completeWord: "Pocket", syllable: ["Pock", "et"] },
      { completeWord: "Dinner", syllable: ["Din", "ner"] },
      { completeWord: "Tunnel", syllable: ["Tun", "nel"] },
      { completeWord: "Sunset", syllable: ["Sun", "set"] },
      { completeWord: "Tablet", syllable: ["Tab", "let"] },
    ],
    S2: [
      { completeWord: "Basket", syllable: ["Bas", "ket"] },
      { completeWord: "Tablet", syllable: ["Tab", "let"] },
      { completeWord: "Sunset", syllable: ["Sun", "set"] },
      { completeWord: "Button", syllable: ["But", "ton"] },
      { completeWord: "Window", syllable: ["Win", "dow"] },
    ],
  };

  const levelTwo = {
    P1: [
      { completeWord: "Sister", syllable: ["Sis", "ter"] },
      { completeWord: "Brother", syllable: ["Bro", "ther"] },
      { completeWord: "Eraser", syllable: ["E", "raser"] },
      { completeWord: "Teacher", syllable: ["Tea", "cher"] },
      { completeWord: "Bottle", syllable: ["Bot", "tle"] },
    ],
    P2: [
      { completeWord: "Table", syllable: ["Ta", "ble"] },
      { completeWord: "Temple", syllable: ["Tem", "ple"] },
      { completeWord: "Jacket", syllable: ["Jack", "et"] },
      { completeWord: "Summer", syllable: ["Sum", "mer"] },
      { completeWord: "Winter", syllable: ["Win", "ter"] },
    ],
    S1: [
      { completeWord: "Rainy", syllable: ["Rai", "ny"] },
      { completeWord: "Picture", syllable: ["Pic", "ture"] },
      { completeWord: "Sunday", syllable: ["Sun", "day"] },
      { completeWord: "Morning", syllable: ["Mor", "ning"] },
      { completeWord: "Evening", syllable: ["Eve", "ning"] },
    ],
    P3: [
      { completeWord: "Dinner", syllable: ["Din", "ner"] },
      { completeWord: "Pocket", syllable: ["Poc", "ket"] },
      { completeWord: "Butter", syllable: ["But", "ter"] },
      { completeWord: "Orange", syllable: ["O", "range"] },
      { completeWord: "Lemon", syllable: ["Le", "mon"] },
    ],
    P4: [
      { completeWord: "Circle", syllable: ["Cir", "cle"] },
      { completeWord: "Rabbit", syllable: ["Rab", "bit"] },
      { completeWord: "Color", syllable: ["Co", "lor"] },
      { completeWord: "Village", syllable: ["Vil", "lage"] },
      { completeWord: "Farmer", syllable: ["Far", "mer"] },
    ],
    S2: [
      { completeWord: "Coward", syllable: ["Cow", "ard"] },
      { completeWord: "Ladder", syllable: ["Lad", "der"] },
      { completeWord: "River", syllable: ["Ri", "ver"] },
      { completeWord: "People", syllable: ["Peo", "ple"] },
      { completeWord: "Silver", syllable: ["Sil", "ver"] },
    ],
    L1: [
      { completeWord: "Coward", syllable: ["Cow", "ard"] },
      { completeWord: "Ladder", syllable: ["Lad", "der"] },
      { completeWord: "River", syllable: ["Ri", "ver"] },
      { completeWord: "People", syllable: ["Peo", "ple"] },
      { completeWord: "Silver", syllable: ["Sil", "ver"] },
    ],
    L2: [
      { completeWord: "Coward", syllable: ["Cow", "ard"] },
      { completeWord: "Ladder", syllable: ["Lad", "der"] },
      { completeWord: "River", syllable: ["Ri", "ver"] },
      { completeWord: "People", syllable: ["Peo", "ple"] },
      { completeWord: "Silver", syllable: ["Sil", "ver"] },
    ],
    L3: [
      { completeWord: "Coward", syllable: ["Cow", "ard"] },
      { completeWord: "Ladder", syllable: ["Lad", "der"] },
      { completeWord: "River", syllable: ["Ri", "ver"] },
      { completeWord: "People", syllable: ["Peo", "ple"] },
      { completeWord: "Silver", syllable: ["Sil", "ver"] },
    ],
    L4: [
      { completeWord: "Coward", syllable: ["Cow", "ard"] },
      { completeWord: "Ladder", syllable: ["Lad", "der"] },
      { completeWord: "River", syllable: ["Ri", "ver"] },
      { completeWord: "People", syllable: ["Peo", "ple"] },
      { completeWord: "Silver", syllable: ["Sil", "ver"] },
    ],
  };

  const levelThree = {
    P1: [
      { completeWord: "I run.", syllable: ["I", "run."] },
      { completeWord: "We play.", syllable: ["We", "play."] },
      { completeWord: "She reads.", syllable: ["She", "reads."] },
      { completeWord: "He eats.", syllable: ["He", "eats."] },
      { completeWord: "They jump.", syllable: ["They", "jump."] },
    ],
    P2: [
      { completeWord: "We walk.", syllable: ["We", "walk."] },
      { completeWord: "I sleep.", syllable: ["I", "sleep."] },
      { completeWord: "You swim.", syllable: ["You", "swim."] },
      { completeWord: "She sings.", syllable: ["She", "sings."] },
      { completeWord: "He dances.", syllable: ["He", "dances."] },
    ],
    P3: [
      { completeWord: "It rains.", syllable: ["It", "rains."] },
      { completeWord: "We win.", syllable: ["We", "win."] },
      { completeWord: "You cook.", syllable: ["You", "cook."] },
      { completeWord: "They laugh.", syllable: ["They", "laugh."] },
      { completeWord: "I dream.", syllable: ["I", "dream."] },
    ],
    P4: [
      { completeWord: "You learn.", syllable: ["You", "learn."] },
      { completeWord: "We talk.", syllable: ["We", "talk."] },
      { completeWord: "He listens.", syllable: ["He", "listens."] },
      { completeWord: "She smiles.", syllable: ["She", "smiles."] },
      { completeWord: "Birds fly.", syllable: ["Birds", "fly."] },
    ],
    S1: [
      { completeWord: "Cats meow.", syllable: ["Cats", "meow."] },
      { completeWord: "Dogs bark.", syllable: ["Dogs", "bark."] },
      { completeWord: "Fish swim.", syllable: ["Fish", "swim."] },
      { completeWord: "Sun shines.", syllable: ["Sun", "shines."] },
      { completeWord: "Stars twinkle.", syllable: ["Stars", "twinkle."] },
    ],
    S2: [
      { completeWord: "Baby cries.", syllable: ["Baby", "cries."] },
      { completeWord: "Fire burns.", syllable: ["Fire", "burns."] },
      { completeWord: "Flowers bloom.", syllable: ["Flowers", "bloom."] },
      { completeWord: "Wind blows.", syllable: ["Wind", "blows."] },
      { completeWord: "Bells ring.", syllable: ["Bells", "ring."] },
    ],
    L1: [
      { completeWord: "I run.", syllable: ["I", "run."] },
      { completeWord: "We play.", syllable: ["We", "play."] },
      { completeWord: "She reads.", syllable: ["She", "reads."] },
      { completeWord: "He eats.", syllable: ["He", "eats."] },
      { completeWord: "They jump.", syllable: ["They", "jump."] },
    ],
    L2: [
      { completeWord: "I run.", syllable: ["I", "run."] },
      { completeWord: "We play.", syllable: ["We", "play."] },
      { completeWord: "She reads.", syllable: ["She", "reads."] },
      { completeWord: "He eats.", syllable: ["He", "eats."] },
      { completeWord: "They jump.", syllable: ["They", "jump."] },
    ],
    L3: [
      { completeWord: "I run.", syllable: ["I", "run."] },
      { completeWord: "We play.", syllable: ["We", "play."] },
      { completeWord: "She reads.", syllable: ["She", "reads."] },
      { completeWord: "He eats.", syllable: ["He", "eats."] },
      { completeWord: "They jump.", syllable: ["They", "jump."] },
    ],
    L4: [
      { completeWord: "I run.", syllable: ["I", "run."] },
      { completeWord: "We play.", syllable: ["We", "play."] },
      { completeWord: "She reads.", syllable: ["She", "reads."] },
      { completeWord: "He eats.", syllable: ["He", "eats."] },
      { completeWord: "They jump.", syllable: ["They", "jump."] },
    ],
  };

  const handleComplete = (nextStep) => {
    setRStep(nextStep);
    setLocalData("rStep", nextStep);
  };

  let progressDatas = getLocalData("practiceProgress");
  const virtualId = String(getLocalData("virtualId"));

  if (typeof progressDatas === "string") {
    progressDatas = JSON.parse(progressDatas);
  }

  let currentPracticeStep;
  if (progressDatas) {
    currentPracticeStep = progressDatas?.currentPracticeStep;
  }

  const currentLevel = practiceSteps?.[currentPracticeStep]?.title || "P1";

  console.log("prog", progressDatas);

  const rFlow = String(getLocalData("rFlow"));

  useEffect(() => {
    if (lang !== "en") {
      setLocalData("rFlow", false);
    }
  }, [lang]);

  useEffect(() => {
    console.log("levelsssss", level, rFlow, rStep);

    let currentLevelMap;
    let currentImageMap;

    if (level === 2) {
      currentLevelMap = practiceSteps?.[currentPracticeStep]?.titleNew || "P1";
      currentImageMap =
        practiceSteps[progressData.currentPracticeStep]?.titleNew || "P1";
    } else if (level === 3) {
      currentLevelMap =
        practiceSteps?.[currentPracticeStep]?.titleThree || "P1";
      currentImageMap =
        practiceSteps[progressData.currentPracticeStep]?.titleThree || "P1";
    } else {
      currentLevelMap = practiceSteps?.[currentPracticeStep]?.title || "P1";
      currentImageMap =
        practiceSteps[progressData.currentPracticeStep]?.title || "P1";
    }

    if (
      progressData?.currentPracticeStep !== undefined &&
      progressData?.currentPracticeStep !== null
    ) {
      const selectedLevels =
        level === 2 ? levelTwo : level === 3 ? levelThree : levels;

      const levelData = selectedLevels[currentLevelMap];
      const levelImage = selectedLevels[currentImageMap];
      console.log("levelsNew", level, levelData);
      const currentWord = levelData[currentQuestion];

      setCurrentImage(levelImage[currentQuestion]);
      setParentWords(currentWord?.syllable?.join(" "));
      setLevelOneWord(levelImage[currentQuestion]?.completeWord);
    }
  }, [progressData]);

  const gameOver = (data, isUserPass) => {
    const userWon = isUserPass;
    const meetsFluencyCriteria = livesData?.meetsFluencyCriteria;
    setGameOverData({ gameOver: true, userWon, ...data, meetsFluencyCriteria });
  };

  useEffect(() => {
    if (startShowCase) {
      setLivesData({ ...livesData, lives: LIVES });
    }
  }, [startShowCase]);

  const levelCompleteAudioSrc = usePreloadAudio(LevelCompleteAudio);

  const callConfettiAndPlay = () => {
    const audio = new Audio(levelCompleteAudioSrc);
    audio.play();
    callConfetti();
    window.telemetry?.syncEvents && window.telemetry.syncEvents();
  };

  useEffect(() => {
    let currentPracticeStep = progressData.currentPracticeStep;
    let fromBack = progressData.fromBack;
    if (
      questions?.length &&
      Number(currentPracticeStep + 1) > 0 &&
      currentQuestion === 0 &&
      !fromBack
    ) {
      setDisableScreen(true);
      callConfettiAndPlay();

      setTimeout(() => {
        const step = practiceSteps[currentPracticeStep];
        let stepName;

        if (level === 1) {
          stepName = step.fullNameMOne;
        } else if (level === 2) {
          stepName = step.fullNameMTwo;
        } else if (level === 3) {
          stepName = step.fullNameMThree;
        } else {
          stepName = step.fullName;
        }
        setOpenMessageDialog({
          message: `You have successfully completed ${stepName} `,
        });
      }, 1200);
    }
  }, [currentQuestion]);

  useEffect(() => {
    if (isShowCase) {
      setLocalData("sub_session_id", uniqueId());
    }
  }, [isShowCase]);

  useEffect(() => {
    if (voiceText === "error") {
      setOpenMessageDialog({
        message: "Sorry I couldn't hear a voice. Could you please speak again?",
        isError: true,
      });
      setVoiceText("");
      setEnableNext(false);
    }
    if (voiceText == "success") {
      setVoiceText("");
    }
  }, [voiceText]);

  const checkFluency = (contentType, fluencyScore) => {
    switch (contentType.toLowerCase()) {
      case "word":
        setFluency(fluencyScore < 2);
        break;
      case "sentence":
        setFluency(fluencyScore < 6);
        break;
      case "paragraph":
        setFluency(fluencyScore < 10);
        break;
      default:
        setFluency(true);
    }
  };

  const handleNext = async (isGameOver) => {
    setIsNextButtonCalled(true);
    setEnableNext(false);
    try {
      const lang = getLocalData("lang");

      const virtualId = getLocalData("virtualId");
      const sessionId = getLocalData("sessionId");

      let practiceProgress = getLocalData("practiceProgress");

      if (levelMapping[virtualId] !== undefined) {
        setLevel(levelMapping[virtualId]);
      } else {
        const token = getLocalData("token");
        if (token) {
          try {
            const decoded = jwtDecode(token);
            const emisUsername = String(decoded.emis_username);
            console.log("emu", emisUsername);

            if (levelMapping[emisUsername] !== undefined) {
              setLevel(levelMapping[emisUsername]);
            }
          } catch (error) {
            console.error("Error decoding JWT token:", error);
          }
        }
      }

      console.log("Assigned LEVEL:", level);
      const token = getLocalData("token");
      let emisUsername = null;

      if (token) {
        try {
          const decoded = jwtDecode(token);
          emisUsername = String(decoded.emis_username);
          console.log("emu", emisUsername);
        } catch (error) {
          console.error("Error decoding JWT token:", error);
        }
      }

      let updatedLevel;

      if (levelMapping[virtualId] || levelMapping[emisUsername]) {
        updatedLevel = levelMapping[virtualId] || levelMapping[emisUsername];

        setLevel(updatedLevel);
      }

      practiceProgress = practiceProgress ? JSON.parse(practiceProgress) : {};

      let currentPracticeStep = "";
      let currentPracticeProgress = "";

      if (practiceProgress) {
        currentPracticeStep = practiceProgress.currentPracticeStep;
        currentPracticeProgress = Math.round(
          ((currentQuestion + 1 + currentPracticeStep * limit) /
            (practiceSteps.length * limit)) *
            100
        );
      }

      let showcasePercentage = ((currentQuestion + 1) * 100) / questions.length;

      let newPracticeStep =
        currentQuestion === questions.length - 1 || isGameOver
          ? currentPracticeStep + 1
          : currentPracticeStep;
      newPracticeStep = Number(newPracticeStep);
      let newQuestionIndex =
        currentQuestion === questions.length - 1 ? 0 : currentQuestion + 1;

      const currentGetContent = getCurrentContent(newPracticeStep);

      console.log("cqer", currentQuestion, questions, level);

      // if(updatedLevel === 14){
      //   setCurrentQuestion(currentQuestion + 1);
      // }else{

      if (currentQuestion === questions.length - 1 || isGameOver) {
        let currentPracticeStep = practiceProgress.currentPracticeStep;
        let isShowCase = currentPracticeStep === 4 || currentPracticeStep === 9; // P4 or P8

        if (localStorage.getItem("contentSessionId") !== null) {
          setPoints(1);
          if (isShowCase) {
            sendTestRigScore(5);
          }
        } else {
          let points = 1;
          let milestone = `m${level}`;

          if (points !== 1) {
            if (process.env.REACT_APP_IS_APP_IFRAME === "true") {
              navigate("/");
            } else {
              navigate("/discover-start");
            }
            return;
          }
          const result = await addPointer(points, milestone);
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
        }

        if (isShowCase || isGameOver) {
          const sub_session_id = getLocalData("sub_session_id");
          const getSetResultRes = await getSetResultPractice({
            subSessionId: sub_session_id,
            currentContentType,
            sessionId,
            totalSyllableCount,
            mechanism,
          });
          const { data: getSetData } = getSetResultRes;

          const data = JSON.stringify(getSetData);
          Log(data, "practice", "ET");
          setPercentage(getSetData?.percentage);
          checkFluency(currentContentType, getSetData?.fluency);
          if (process.env.REACT_APP_POST_LEARNER_PROGRESS === "true") {
            await createLearnerProgress(
              sub_session_id,
              getSetData?.currentLevel,
              totalSyllableCount
            );
          }
          //setLocalData("previous_level", getSetData.data.previous_level);
          setLocalData("previous_level", getSetData.previous_level);
          if (getSetData.sessionResult === "pass") {
            if (
              level === 15 &&
              (currentLevel === "S1" || currentLevel === "S2")
            ) {
              setLocalData("allCompleted", true);
              gameOver({ link: "/assesment-end" }, true);
              return;
            }

            try {
              await addLesson({
                sessionId,
                milestone: `practice`,
                lesson: "0",
                progress: 0,
                language: lang,
                milestoneLevel: getSetData.currentLevel,
              });
              gameOver({ link: "/assesment-end" }, true);
              return;
            } catch (e) {
              // catch error
            }
          } else if (
            currentLevel === "S2" &&
            lang === "en" &&
            (level === 1 || level === 2)
          ) {
            setLocalData("mFail", true);
            setTimeout(() => {
              setLocalData("rFlow", true);
            }, 10000);
          }
        }

        let quesArr = [];

        if (newPracticeStep === 10) {
          newPracticeStep = 0;
          currentPracticeProgress = 0;
        }
        await addLesson({
          sessionId: sessionId,
          milestone: `practice`,
          lesson: newPracticeStep,
          progress: currentPracticeProgress,
          language: lang,
          milestoneLevel: `m${level}`,
        });

        if (newPracticeStep === 0 || newPracticeStep === 5 || isGameOver) {
          gameOver();
          return;
        }

        if (![10, 11, 12, 13, 14, 15].includes(level)) {
          const resGetContent = await getContent(
            currentGetContent.criteria,
            lang,
            limit,
            {
              mechanismId: currentGetContent?.mechanism?.id,
              competency: currentGetContent?.competency,
              tags: currentGetContent?.tags,
              storyMode: currentGetContent?.storyMode,
            }
          );

          setTotalSyllableCount(resGetContent?.totalSyllableCount);
          setLivesData({
            ...livesData,
            totalTargets: resGetContent?.totalSyllableCount,
            targetsForLives:
              resGetContent?.subsessionTargetsCount * TARGETS_PERCENTAGE,
            targetPerLive:
              (resGetContent?.subsessionTargetsCount * TARGETS_PERCENTAGE) /
              LIVES,
          });

          let showcaseLevel =
            currentPracticeStep === 3 || currentPracticeStep === 8;
          setIsShowCase(showcaseLevel);
          // TODO: API returns contents if 200 status
          quesArr = [...quesArr, ...(resGetContent?.content || [])];
          setCurrentContentType(resGetContent?.content?.[0]?.contentType);
          setCurrentCollectionId(resGetContent?.content?.[0]?.collectionId);

          // // TODO: API returns contents if 200 status
          // quesArr = [...quesArr, ...(resGetContent?.data?.content || [])];
          // setCurrentContentType(resGetContent?.data?.content?.[0]?.contentType);
          // setCurrentCollectionId(
          //   resGetContent?.data?.content?.[0]?.collectionId
          // );

          // TODO: not required - not using this anywhere
          setAssessmentResponse(resGetContent);

          setCurrentQuestion(0);
          // TODO: not required - we are geting this data from API
          practiceProgress = {
            currentQuestion: newQuestionIndex,
            currentPracticeProgress,
            currentPracticeStep: newPracticeStep,
          };
          setLocalData("practiceProgress", JSON.stringify(practiceProgress));
          setProgressData(practiceProgress);
          setLocalData("storyTitle", resGetContent?.name);

          // // TODO: not required - we are geting this data from API
          // practiceProgress = {
          //   currentQuestion: newQuestionIndex,
          //   currentPracticeProgress,
          //   currentPracticeStep: newPracticeStep,
          // };
          // setLocalData("practiceProgress", JSON.stringify(practiceProgress));
          // setProgressData(practiceProgress);
          // localStorage.setItem("storyTitle", resGetContent?.name);

          setQuestions(quesArr);
        }

        if ([10, 11, 12, 13, 14, 15].includes(level)) {
          let showcaseLevel =
            currentPracticeStep === 3 || currentPracticeStep === 8;
          setIsShowCase(showcaseLevel);
          setCurrentQuestion(0);

          practiceProgress = {
            currentQuestion: newQuestionIndex,
            currentPracticeProgress,
            currentPracticeStep: newPracticeStep,
          };
          setLocalData("practiceProgress", JSON.stringify(practiceProgress));
          setProgressData(practiceProgress);

          const dummyQuestions = Array.from({ length: 5 }, (_, i) => ({
            id: `dummy-${i + 1}`,
          }));

          setQuestions(dummyQuestions);
        }

        // TODO: needs to revisit this logic
        setTimeout(() => {
          setMechanism(currentGetContent.mechanism);
        }, 1000);

        // if(virtualId === "6760800019"){
        //   setLevel(12);
        //   //setMechanism({ id: "read_aloud", name: "readAloud" });
        // }

        // if(virtualId === "1621936833"){
        //   setLevel(13);
        //   setMechanism({ id: "r3", name: "r3" });
        // }
        // if(virtualId === "9526496994"){
        //   setLevel(14);
        // }
        // if(virtualId === "7656513916"){
        //   setLevel(4);
        // }
        // if(virtualId === "3464419415"){
        //   setLevel(5);
        // }
        // if(virtualId === "6131132191"){
        //   setLevel(6);
        // }
        // if(virtualId === "8909322850"){
        //   setLevel(7);
        // }

        if (levelMapping[virtualId] !== undefined) {
          setLevel(levelMapping[virtualId]);
        } else {
          const token = getLocalData("token");
          if (token) {
            try {
              const decoded = jwtDecode(token);
              const emisUsername = String(decoded.emis_username);
              console.log("emu", emisUsername);

              if (levelMapping[emisUsername] !== undefined) {
                setLevel(levelMapping[emisUsername]);
              }
            } catch (error) {
              console.error("Error decoding JWT token:", error);
            }
          }
        }

        console.log("Assigned LEVEL:", level);
      } else if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);

        practiceProgress = {
          currentQuestion: newQuestionIndex,
          currentPracticeProgress,
          currentPracticeStep: newPracticeStep,
        };
        setLocalData("practiceProgress", JSON.stringify(practiceProgress));
        setProgressData(practiceProgress);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const [temp_audio, set_temp_audio] = useState(null);
  const [audioPlayFlag, setAudioPlayFlag] = useState(true); // base64url of teachertext

  const learnAudio = () => {
    if (temp_audio !== null) {
      temp_audio.play();
      setAudioPlayFlag(!audioPlayFlag);
      temp_audio.addEventListener("ended", () => setAudioPlayFlag(true));
    }
  };

  useEffect(() => {
    learnAudio();
  }, [temp_audio]);

  const playTeacherAudio = () => {
    const contentId = questions[currentQuestion]?.contentId;
    let audio = new Audio(
      `${process.env.REACT_APP_AWS_S3_BUCKET_CONTENT_URL}/all-audio-files/${lang}/${contentId}.wav`
    );
    audio.addEventListener("canplaythrough", () => {
      set_temp_audio(
        new Audio(
          `${process.env.REACT_APP_AWS_S3_BUCKET_CONTENT_URL}/all-audio-files/${lang}/${contentId}.wav`
        )
      );
    });
  };

  const fetchDetails = async () => {
    let quesArr = [];
    try {
      setLoading(true);
      const lang = getLocalData("lang");
      const virtualId = getLocalData("virtualId");
      let sessionId = getLocalData("sessionId");

      if (!sessionId) {
        sessionId = uniqueId();
        setLocalData("sessionId", sessionId);
      }
      const getMilestoneDetails = await getFetchMilestoneDetails(lang);

      // TODO: validate the getMilestoneDetails API return
      setLocalData("getMilestone", JSON.stringify({ ...getMilestoneDetails }));

      let level =
        Number(getMilestoneDetails?.data?.milestone_level?.replace("m", "")) ||
        1;

      console.log("curGetCont3", level, getMilestoneDetails);

      setLevel(level);

      const resLessons = await getLessonProgressByID(lang);

      // TODO: Handle Error for lessons - no lesson progress - starting point should be P1

      if (
        process.env.REACT_APP_IS_APP_IFRAME !== "true" &&
        (localStorage.getItem("contentSessionId") !== null ||
          process.env.REACT_APP_IS_IN_APP_AUTHORISATION === "true")
      ) {
        fetchUserPoints()
          .then((points) => {
            setPoints(points);
          })
          .catch((error) => {
            console.error("Error fetching user points:", error);
            setPoints(0);
          });
      }

      let userState = Number.isInteger(Number(resLessons?.result?.lesson))
        ? Number(resLessons.result?.lesson)
        : 0;

      // TODO: revisit this - looks like not required
      let practiceProgress = getLocalData("practiceProgress");
      practiceProgress = practiceProgress ? JSON.parse(practiceProgress) : {};

      practiceProgress = {
        currentQuestion: 0,
        currentPracticeProgress: (userState / practiceSteps.length) * 100,
        currentPracticeStep: userState || 0,
      };

      const getCurrentContent = (stepKey) => {
        const lang = getLocalData("lang") || "en";
        console.log("curGetCont2", lang, level);
        return levelGetContent[lang]?.[level]?.find(
          (elem) => elem.title === practiceSteps?.[stepKey]?.name
        );
      };

      const currentGetContent = getCurrentContent(userState);

      console.log("curGetCont", userState, currentGetContent);

      if (![10, 11, 12, 13, 14, 15].includes(level)) {
        const resWord = await getContent(
          currentGetContent.criteria,
          lang,
          limit,
          {
            mechanismId: currentGetContent?.mechanism?.id,
            competency: currentGetContent?.competency,
            tags: currentGetContent?.tags,
            storyMode: currentGetContent?.storyMode,
          }
        );
        // TODO: handle error if resWord is empty

        setTotalSyllableCount(resWord?.totalSyllableCount);
        setLivesData({
          ...livesData,
          totalTargets: resWord?.totalSyllableCount,
          targetsForLives: resWord?.subsessionTargetsCount * TARGETS_PERCENTAGE,
          targetPerLive:
            (resWord?.subsessionTargetsCount * TARGETS_PERCENTAGE) / LIVES,
        });
        quesArr = [...quesArr, ...(resWord?.content || [])];
        setCurrentContentType(currentGetContent.criteria);

        setCurrentCollectionId(resWord?.content?.[0]?.collectionId);
        setAssessmentResponse(resWord);

        setLocalData("storyTitle", resWord?.name);

        localStorage.setItem("storyTitle", resWord?.name);

        setQuestions(quesArr);
      }

      if ([10, 11, 12, 13, 14, 15].includes(level)) {
        const dummyQuestions = Array.from({ length: 5 }, (_, i) => ({
          id: `dummy-${i + 1}`,
        }));

        setQuestions(dummyQuestions);
      }
      setMechanism(currentGetContent.mechanism);

      // if (virtualId === "6760800019" || level == 12) {
      //   //setMechanism({ id: "read_aloud", name: "readAloud" });
      // }

      // if (virtualId === "1621936833" || level == 13) {
      //   setMechanism({ id: "r3", name: "r3" });
      // }

      let showcaseLevel = userState === 4 || userState === 9;
      setIsShowCase(showcaseLevel);
      if (showcaseLevel) {
        await addLesson({
          sessionId: sessionId,
          milestone: "showcase",
          lesson: userState,
          progress: 0,
          language: lang,
          milestoneLevel: `m${level}`,
        });
      }
      setCurrentQuestion(practiceProgress?.currentQuestion || 0);
      setLocalData("practiceProgress", JSON.stringify(practiceProgress));
      setProgressData(practiceProgress);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("err", error);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  useEffect(() => {
    setLocalData("mechanism_id", (mechanism && mechanism.id) || "");
  }, [mechanism]);

  const getCurrentContent = (stepKey) => {
    const lang = getLocalData("lang") || "en";
    console.log("curGetCont2", lang, level);
    return levelGetContent[lang]?.[level]?.find(
      (elem) => elem.title === practiceSteps?.[stepKey]?.name
    );
  };

  const handleBack = async () => {
    if (progressData.currentPracticeStep > 0) {
      const virtualId = getLocalData("virtualId");
      const sessionId = getLocalData("sessionId");
      const lang = getLocalData("lang");
      let practiceProgress = {};
      let newCurrentPracticeStep =
        progressData.currentPracticeStep === 5
          ? 3
          : progressData.currentPracticeStep - 1;
      practiceProgress = {
        currentQuestion: 0,
        currentPracticeProgress:
          (newCurrentPracticeStep / practiceSteps.length) * 100,
        currentPracticeStep: newCurrentPracticeStep,
        fromBack: true,
      };
      await addLesson({
        sessionId: sessionId,
        milestone: "practice",
        lesson: newCurrentPracticeStep,
        progress: (newCurrentPracticeStep / practiceSteps.length) * 100,
        language: lang,
        milestoneLevel: `m${level}`,
      });

      setProgressData(practiceProgress);

      const currentGetContent = getCurrentContent(newCurrentPracticeStep);

      let quesArr = [];

      if (![10, 11, 12, 13, 14, 15].includes(level)) {
        const resWord = await getContent(
          currentGetContent.criteria,
          lang,
          limit,
          {
            mechanismId: currentGetContent?.mechanism?.id,
            competency: currentGetContent?.competency,
            tags: currentGetContent?.tags,
            storyMode: currentGetContent?.storyMode,
          }
        );
        setTotalSyllableCount(resWord?.totalSyllableCount);
        setLivesData({
          ...livesData,
          totalTargets: resWord?.totalSyllableCount,
          targetsForLives: resWord?.subsessionTargetsCount * TARGETS_PERCENTAGE,
          targetPerLive:
            (resWord?.subsessionTargetsCount * TARGETS_PERCENTAGE) / LIVES,
        });
        quesArr = [...quesArr, ...(resWord?.content || [])];
        setCurrentContentType(currentGetContent.criteria);
        setCurrentCollectionId(resWord?.content?.[0]?.collectionId);
        setAssessmentResponse(resWord);

        setLocalData("storyTitle", resWord?.name);
        setQuestions(quesArr);
      }

      if ([10, 11, 12, 13, 14, 15].includes(level)) {
        const dummyQuestions = Array.from({ length: 5 }, (_, i) => ({
          id: `dummy-${i + 1}`,
        }));

        setQuestions(dummyQuestions);
      }

      setTimeout(() => {
        setMechanism(currentGetContent.mechanism);
      }, 1000);
      setCurrentQuestion(practiceProgress?.currentQuestion || 0);
      setLocalData("practiceProgress", JSON.stringify(practiceProgress));
    } else {
      if (process.env.REACT_APP_IS_APP_IFRAME === "true") {
        navigate("/");
      } else {
        navigate("/discover-start");
      }
    }
  };

  useEffect(() => {
    if (livesData?.scoreData) {
      if (livesData?.redLivesToShow <= 0) {
        handleNext(true);
      }
    }
  }, [livesData]);

  function highlightWords(sentence, matchedChar, color) {
    const words = sentence.split(" ");
    matchedChar.sort(function (str1, str2) {
      return str2.length - str1.length;
    });

    let type = currentContentType?.toLowerCase();
    if (type === "char" || type === "word") {
      const word = splitGraphemes(words[0].toLowerCase()).filter(
        (item) => item !== "‌" && item !== "" && item !== " "
      );
      let highlightedString = [];
      for (let i = 0; i < word.length; i++) {
        let matchFound = false;
        for (let j = 0; j < matchedChar.length; j++) {
          let length = splitGraphemes(matchedChar[j]).filter(
            (item) => item !== "‌" && item !== "" && item !== " "
          ).length;
          const substr = word.slice(i, i + length).join("");
          if (substr.includes(matchedChar[j])) {
            highlightedString.push(
              <React.Fragment key={i}>
                <Typography
                  variant="h5"
                  component="h4"
                  sx={{
                    fontSize: "clamp(1.6rem, 2.5vw, 3.8rem)",
                    fontWeight: 700,
                    fontFamily: "Quicksand",
                    lineHeight: "50px",
                    background: "#FFF0BD",
                    color: color,
                  }}
                >
                  {i === 0 ? substr.toUpperCase() : substr}
                </Typography>
              </React.Fragment>
            );
            i += length - 1;
            matchFound = true;
            break;
          }
        }
        if (!matchFound) {
          highlightedString.push(
            <React.Fragment key={i}>
              <Typography
                variant="h5"
                component="h4"
                sx={{
                  color: color,
                  fontSize: "clamp(1.6rem, 2.5vw, 3.8rem)",
                  fontWeight: 700,
                  fontFamily: "Quicksand",
                  lineHeight: "50px",
                }}
              >
                {i === 0 ? word[i].toUpperCase() : word[i]}
              </Typography>
            </React.Fragment>
          );
        }
      }
      return highlightedString;
    } else {
      const highlightedSentence = words.map((word, index) => {
        const isMatched = matchedChar.some((char) =>
          word.toLowerCase().includes(char)
        );
        if (isMatched) {
          return (
            <React.Fragment key={index}>
              <Typography
                variant="h5"
                component="h4"
                ml={1}
                sx={{
                  fontSize: "clamp(1.6rem, 2.5vw, 3.8rem)",
                  fontWeight: 700,
                  fontFamily: "Quicksand",
                  lineHeight: "50px",
                  background: "#FFF0BD",
                }}
              >
                {word}
              </Typography>{" "}
            </React.Fragment>
          );
        } else {
          return (
            <Typography
              variant="h5"
              component="h4"
              ml={1}
              sx={{
                color: "#333F61",
                fontSize: "clamp(1.6rem, 2.5vw, 3.8rem)",
                fontWeight: 700,
                fontFamily: "Quicksand",
                lineHeight: "50px",
              }}
              key={index}
            >
              {word + " "}
            </Typography>
          );
        }
      });
      return highlightedSentence;
    }
  }

  useEffect(() => {
    if (questions[currentQuestion]?.contentSourceData) {
      if (process.env.REACT_APP_IS_APP_IFRAME === "true") {
        const contentSourceData =
          questions[currentQuestion]?.contentSourceData || [];
        const stringLengths = contentSourceData.map((item) => item.text.length);
        const length =
          questions[currentQuestion]?.mechanics_data &&
          (questions[currentQuestion]?.mechanics_data[0]?.mechanics_id ===
            "mechanic_2" ||
            questions[currentQuestion]?.mechanics_data[0]?.mechanics_id ===
              "mechanic_1")
            ? 500
            : stringLengths[0];
        window.parent.postMessage(
          { type: "stringLengths", length },
          window?.location?.ancestorOrigins?.[0] ||
            window.parent.location.origin
        );
      }
    }
  }, [questions[currentQuestion]]);

  console.log("mec", mechanism, level, rFlow, currentLevel);

  const renderMechanics = () => {
    if (
      (!mechanism && rFlow !== "true") ||
      (mechanism?.id === "mechanic_15" && rFlow !== "true")
    ) {
      const mechanics_data = questions[currentQuestion]?.mechanics_data;

      return (
        <WordsOrImage
          {...{
            level: level,
            audioLink:
              mechanism?.id === "mechanic_15"
                ? `${process.env.REACT_APP_AWS_S3_BUCKET_CONTENT_URL}/mechanics_audios/${mechanics_data?.[0]?.audio_url}`
                : null,
            mechanism_id: mechanism?.id,
            header:
              mechanism?.id &&
              (mechanism?.id === "mechanic_15"
                ? "Read the question and record your response"
                : questions[currentQuestion]?.contentType === "image"
                ? `Guess the below image`
                : `Speak the below ${questions[currentQuestion]?.contentType}`),
            words:
              lang === "en" && (level === 1 || level === 2 || level === 3)
                ? levelOneWord
                : mechanism?.id === "mechanic_15"
                ? questions[currentQuestion]?.mechanics_data?.[0]?.text
                : questions[currentQuestion]?.contentSourceData?.[0]?.text,
            hints: questions[currentQuestion]?.mechanics_data?.[0]?.hints?.text,
            contentType: currentContentType,
            contentId: questions[currentQuestion]?.contentId,
            setVoiceText,
            setRecordedAudio,
            setVoiceAnimate,
            storyLine,
            handleNext,
            type: questions[currentQuestion]?.contentType,
            image:
              mechanism?.id === "mechanic_15"
                ? `${process.env.REACT_APP_AWS_S3_BUCKET_CONTENT_URL}/mechanics_images/${questions[currentQuestion]?.mechanics_data[0]?.image_url}`
                : "",
            // image: elephant,
            enableNext,
            showTimer: false,
            points,
            steps: questions?.length,
            currentStep: currentQuestion + 1,
            progressData,
            showProgress: true,
            background:
              isShowCase &&
              "linear-gradient(281.02deg, #AE92FF 31.45%, #555ADA 100%)",
            playTeacherAudio,
            callUpdateLearner: isShowCase,
            disableScreen,
            isShowCase,
            startShowCase,
            setStartShowCase,
            handleBack: !isShowCase && handleBack,
            livesData,
            setLivesData,
            gameOverData,
            highlightWords,
            matchedChar: !isShowCase && questions[currentQuestion]?.matchedChar,
            loading,
            percentage,
            fluency,
            setOpenMessageDialog,
            setEnableNext,
            isNextButtonCalled,
            setIsNextButtonCalled,
          }}
        />
      );
    } else if (rFlow === "true" && level === 1) {
      return (
        <R1
          page={page}
          setPage={setPage}
          {...{
            level: level,
            header:
              questions[currentQuestion]?.contentType === "image"
                ? `Guess the below image`
                : `Speak the below word`,
            //
            currentImg: currentImage,
            parentWords: parentWords,
            contentType: currentContentType,
            contentId: questions[currentQuestion]?.contentId,
            setVoiceText,
            setRecordedAudio,
            setVoiceAnimate,
            storyLine,
            handleNext,
            type: "word",
            // image: elephant,
            enableNext,
            showTimer: false,
            points,
            steps: questions?.length,
            currentStep: currentQuestion + 1,
            progressData,
            showProgress: true,
            background:
              isShowCase &&
              "linear-gradient(281.02deg, #AE92FF 31.45%, #555ADA 100%)",
            playTeacherAudio,
            callUpdateLearner: isShowCase,
            disableScreen,
            isShowCase,
            handleBack: !isShowCase && handleBack,
            setEnableNext,
            loading,
            setOpenMessageDialog,
          }}
        />
      );
    } else if (rFlow === "true" && level === 2 && rStep === 2) {
      return (
        <R2
          page={page}
          setPage={setPage}
          rStep={rStep}
          onComplete={() => handleComplete(3)}
          {...{
            level: level,
            header:
              questions[currentQuestion]?.contentType === "image"
                ? `Guess the below image`
                : `Speak the below word`,
            //
            currentImg: currentImage,
            parentWords: parentWords,
            contentType: currentContentType,
            contentId: questions[currentQuestion]?.contentId,
            setVoiceText,
            setRecordedAudio,
            setVoiceAnimate,
            storyLine,
            handleNext,
            type: "word",
            // image: elephant,
            enableNext,
            showTimer: false,
            points,
            steps: questions?.length,
            currentStep: currentQuestion + 1,
            progressData,
            showProgress: true,
            background:
              isShowCase &&
              "linear-gradient(281.02deg, #AE92FF 31.45%, #555ADA 100%)",
            playTeacherAudio,
            callUpdateLearner: isShowCase,
            disableScreen,
            isShowCase,
            handleBack: !isShowCase && handleBack,
            setEnableNext,
            loading,
            setOpenMessageDialog,
          }}
        />
      );
    } else if (rFlow === "true" && level === 2 && rStep === 3) {
      return (
        <R3Flow
          page={page}
          setPage={setPage}
          rStep={rStep}
          onComplete={() => handleComplete(4)}
          {...{
            level: level,
            header:
              questions[currentQuestion]?.contentType === "image"
                ? `Guess the below image`
                : `Speak the below word`,
            //
            currentImg: currentImage,
            parentWords: parentWords,
            contentType: currentContentType,
            contentId: questions[currentQuestion]?.contentId,
            setVoiceText,
            setRecordedAudio,
            setVoiceAnimate,
            storyLine,
            handleNext,
            type: "word",
            // image: elephant,
            enableNext,
            showTimer: false,
            points,
            steps: questions?.length,
            currentStep: currentQuestion + 1,
            progressData,
            showProgress: true,
            background:
              isShowCase &&
              "linear-gradient(281.02deg, #AE92FF 31.45%, #555ADA 100%)",
            playTeacherAudio,
            callUpdateLearner: isShowCase,
            disableScreen,
            isShowCase,
            handleBack: !isShowCase && handleBack,
            setEnableNext,
            loading,
            setOpenMessageDialog,
          }}
        />
      );
    } else if (rFlow === "true" && level === 2 && rStep === 4) {
      return (
        <R4
          page={page}
          setPage={setPage}
          rStep={rStep}
          {...{
            level: level,
            header:
              questions[currentQuestion]?.contentType === "image"
                ? `Guess the below image`
                : `Speak the below word`,
            //
            currentImg: currentImage,
            parentWords: parentWords,
            contentType: currentContentType,
            contentId: questions[currentQuestion]?.contentId,
            setVoiceText,
            setRecordedAudio,
            setVoiceAnimate,
            storyLine,
            handleNext,
            type: "word",
            // image: elephant,
            enableNext,
            showTimer: false,
            points,
            steps: questions?.length,
            currentStep: currentQuestion + 1,
            progressData,
            showProgress: true,
            background:
              isShowCase &&
              "linear-gradient(281.02deg, #AE92FF 31.45%, #555ADA 100%)",
            playTeacherAudio,
            callUpdateLearner: isShowCase,
            disableScreen,
            isShowCase,
            handleBack: !isShowCase && handleBack,
            setEnableNext,
            loading,
            setOpenMessageDialog,
          }}
        />
      );
    } else if (mechanism.name === "fillInTheBlank" && mechanism.id !== "") {
      return (
        <Mechanics3
          page={page}
          setPage={setPage}
          {...{
            level: !isShowCase && level,
            header:
              mechanism.name === "fillInTheBlank"
                ? "Fill in the blank"
                : questions[currentQuestion]?.contentType === "image"
                ? `Guess the below image`
                : `Speak the below ${questions[currentQuestion]?.contentType}`,
            parentWords: questions[currentQuestion]?.mechanics_data?.[0]?.text,
            contentType: currentContentType,
            contentId: questions[currentQuestion]?.contentId,
            setVoiceText,
            type: mechanism.name,
            setRecordedAudio,
            setVoiceAnimate,
            storyLine,
            handleNext,
            image: questions[currentQuestion]?.mechanics_data
              ? `${process.env.REACT_APP_AWS_S3_BUCKET_CONTENT_URL}/mechanics_images/` +
                questions[currentQuestion]?.mechanics_data[0]?.image_url
              : null,
            audio: questions[currentQuestion]?.mechanics_data
              ? `${process.env.REACT_APP_AWS_S3_BUCKET_CONTENT_URL}/mechanics_audios/` +
                questions[currentQuestion]?.mechanics_data[0]?.audio_url
              : null,
            enableNext,
            showTimer: false,
            points,
            steps: questions?.length,
            currentStep: currentQuestion + 1,
            progressData,
            showProgress: true,
            background:
              isShowCase &&
              "linear-gradient(281.02deg, #AE92FF 31.45%, #555ADA 100%)",
            playTeacherAudio,
            callUpdateLearner: isShowCase,
            disableScreen,
            isShowCase,
            handleBack: !isShowCase && handleBack,
            setEnableNext,
            allWords:
              questions?.map((elem) => elem?.contentSourceData?.[0]?.text) ||
              [],
            loading,
            setOpenMessageDialog,
            options: questions[currentQuestion]?.mechanics_data
              ? questions[currentQuestion]?.mechanics_data[0]?.options
              : [],
            isNextButtonCalled,
            setIsNextButtonCalled,
          }}
        />
      );
    } else if (mechanism.name === "formAWord") {
      return (
        <Mechanics4
          page={page}
          setPage={setPage}
          {...{
            level: !isShowCase && level,
            header:
              questions[currentQuestion]?.contentType === "image"
                ? `Guess the below image`
                : `Speak the below ${questions[currentQuestion]?.contentType}`,
            parentWords:
              questions[currentQuestion]?.contentSourceData?.[0]?.text,
            contentType: currentContentType,
            contentId: questions[currentQuestion]?.contentId,
            setVoiceText,
            setRecordedAudio,
            setVoiceAnimate,
            storyLine,
            handleNext,
            type: "word",
            // image: elephant,
            enableNext,
            showTimer: false,
            points,
            steps: questions?.length,
            currentStep: currentQuestion + 1,
            progressData,
            showProgress: true,
            background:
              isShowCase &&
              "linear-gradient(281.02deg, #AE92FF 31.45%, #555ADA 100%)",
            playTeacherAudio,
            callUpdateLearner: isShowCase,
            disableScreen,
            isShowCase,
            handleBack: !isShowCase && handleBack,
            setEnableNext,
            loading,
            setOpenMessageDialog,
            isNextButtonCalled,
            setIsNextButtonCalled,
          }}
        />
      );
    } else if (mechanism.name === "formAWord2") {
      return (
        <Mechanics7
          page={page}
          setPage={setPage}
          {...{
            level: level,
            header:
              questions[currentQuestion]?.contentType === "image"
                ? `Guess the below image`
                : `Speak the below word`,
            //
            currentImg: currentImage,
            parentWords: parentWords,
            contentType: currentContentType,
            contentId: questions[currentQuestion]?.contentId,
            setVoiceText,
            setRecordedAudio,
            setVoiceAnimate,
            storyLine,
            handleNext,
            type: "word",
            // image: elephant,
            enableNext,
            showTimer: false,
            points,
            steps: questions?.length,
            currentStep: currentQuestion + 1,
            progressData,
            showProgress: true,
            background:
              isShowCase &&
              "linear-gradient(281.02deg, #AE92FF 31.45%, #555ADA 100%)",
            playTeacherAudio,
            callUpdateLearner: isShowCase,
            disableScreen,
            isShowCase,
            handleBack: !isShowCase && handleBack,
            setEnableNext,
            loading,
            setOpenMessageDialog,
          }}
        />
      );
    } else if (mechanism.name === "bingoCard") {
      return (
        <BingoCard
          page={page}
          setPage={setPage}
          {...{
            level: level,
            header:
              questions[currentQuestion]?.contentType === "image"
                ? `Guess the below image`
                : `Speak the below word`,
            //
            currentImg: currentImage,
            parentWords: parentWords,
            contentType: currentContentType,
            contentId: questions[currentQuestion]?.contentId,
            setVoiceText,
            setRecordedAudio,
            setVoiceAnimate,
            storyLine,
            handleNext,
            type: "word",
            // image: elephant,
            enableNext,
            showTimer: false,
            points,
            steps: questions?.length,
            currentStep: currentQuestion + 1,
            progressData,
            showProgress: true,
            background:
              isShowCase &&
              "linear-gradient(281.02deg, #AE92FF 31.45%, #555ADA 100%)",
            playTeacherAudio,
            callUpdateLearner: isShowCase,
            disableScreen,
            isShowCase,
            handleBack: !isShowCase && handleBack,
            setEnableNext,
            loading,
            setOpenMessageDialog,
          }}
        />
      );
    } else if (mechanism.name === "syllablePuzzle") {
      return (
        <SyllablePuzzle
          page={page}
          setPage={setPage}
          {...{
            level: level,
            header:
              questions[currentQuestion]?.contentType === "image"
                ? `Guess the below image`
                : `Speak the below word`,
            //
            currentImg: currentImage,
            parentWords: parentWords,
            contentType: currentContentType,
            contentId: questions[currentQuestion]?.contentId,
            setVoiceText,
            setRecordedAudio,
            setVoiceAnimate,
            storyLine,
            handleNext,
            type: "word",
            // image: elephant,
            enableNext,
            showTimer: false,
            points,
            steps: questions?.length,
            currentStep: currentQuestion + 1,
            progressData,
            showProgress: true,
            background:
              isShowCase &&
              "linear-gradient(281.02deg, #AE92FF 31.45%, #555ADA 100%)",
            playTeacherAudio,
            callUpdateLearner: isShowCase,
            disableScreen,
            isShowCase,
            handleBack: !isShowCase && handleBack,
            setEnableNext,
            loading,
            setOpenMessageDialog,
          }}
        />
      );
    } else if (mechanism.name === "readTheImage") {
      const options = questions[currentQuestion]?.mechanics_data
        ? questions[currentQuestion]?.mechanics_data[0]?.options
        : [];
      const audioLink =
        options && options.length > 0
          ? options.find((option) => option.isAns === true)?.audio_url || null
          : null;

      const mechanics_data = questions[currentQuestion]?.mechanics_data;
      return (
        <Mechanics5
          page={page}
          setPage={setPage}
          {...{
            level: !isShowCase && level,
            header:
              mechanism?.id === "mechanic_16"
                ? "Read the question and select correct answer"
                : "Look at the picture and speak the correct answer from below",
            parentWords: mechanics_data
              ? mechanics_data[0].text
              : questions[currentQuestion]?.contentSourceData?.[0]?.text,
            contentType: currentContentType,
            question_audio: mechanics_data
              ? `${process.env.REACT_APP_AWS_S3_BUCKET_CONTENT_URL}/mechanics_audios/` +
                mechanics_data[0].audio_url
              : questions[currentQuestion]?.contentSourceData?.[0]?.audio_url,
            contentId: questions[currentQuestion]?.contentId,
            setVoiceText,
            options: options,
            correctness: mechanics_data ? mechanics_data[0]?.correctness : null,
            setRecordedAudio,
            setVoiceAnimate,
            storyLine,
            handleNext,
            type: "word",
            mechanism: mechanism?.id,
            image: mechanics_data
              ? `${process.env.REACT_APP_AWS_S3_BUCKET_CONTENT_URL}/mechanics_images/` +
                mechanics_data[0]?.image_url
              : null,

            audio: mechanics_data
              ? `${process.env.REACT_APP_AWS_S3_BUCKET_CONTENT_URL}/mechanics_audios/` +
                audioLink
              : null,
            enableNext,
            showTimer: false,
            points,
            steps: questions?.length,
            currentStep: currentQuestion + 1,
            progressData,
            showProgress: true,
            background:
              isShowCase &&
              "linear-gradient(281.02deg, #AE92FF 31.45%, #555ADA 100%)",
            playTeacherAudio,
            callUpdateLearner: isShowCase,
            disableScreen,
            isShowCase,
            handleBack: !isShowCase && handleBack,
            setEnableNext,
            loading,
            setOpenMessageDialog,
            startShowCase,
            setStartShowCase,
            livesData,
            setLivesData,
            gameOverData,
            highlightWords,
            matchedChar: !isShowCase && questions[currentQuestion]?.matchedChar,
            percentage,
            fluency,
            isNextButtonCalled,
            setIsNextButtonCalled,
          }}
        />
      );
    } else if (mechanism.name === "formASentence") {
      return (
        <Mechanics4
          page={page}
          setPage={setPage}
          {...{
            level: !isShowCase && level,
            header: "Form a sentence using the words and speak",
            parentWords:
              questions[currentQuestion]?.contentSourceData?.[0]?.text,
            contentType: currentContentType,
            jumbled_text:
              questions[currentQuestion]?.mechanics_data?.[0]?.jumbled_text,
            contentId: questions[currentQuestion]?.contentId,
            setVoiceText,
            type: mechanism.name,
            setRecordedAudio,
            setVoiceAnimate,
            storyLine,
            handleNext,
            // image: elephant,
            audio: questions[currentQuestion]?.mechanics_data
              ? `${process.env.REACT_APP_AWS_S3_BUCKET_CONTENT_URL}/mechanics_audios/` +
                questions[currentQuestion]?.mechanics_data[0]?.audio_url
              : null,
            enableNext,
            showTimer: false,
            points,
            steps: questions?.length,
            currentStep: currentQuestion + 1,
            progressData,
            showProgress: true,
            background:
              isShowCase &&
              "linear-gradient(281.02deg, #AE92FF 31.45%, #555ADA 100%)",
            playTeacherAudio,
            callUpdateLearner: isShowCase,
            disableScreen,
            isShowCase,
            handleBack: !isShowCase && handleBack,
            setEnableNext,
            allWords:
              questions?.map((elem) => elem?.contentSourceData?.[0]?.text) ||
              [],
            loading,
            setOpenMessageDialog,
            isNextButtonCalled,
            setIsNextButtonCalled,
          }}
        />
      );
    } else if (mechanism.name === "readAloud") {
      return (
        <ReadAloud
          page={page}
          setPage={setPage}
          {...{
            level: level,
            header:
              questions[currentQuestion]?.contentType === "image"
                ? `Guess the below image`
                : `Speak the below word`,
            //
            currentImg: currentImage,
            parentWords: parentWords,
            contentType: currentContentType,
            contentId: questions[currentQuestion]?.contentId,
            setVoiceText,
            setRecordedAudio,
            setVoiceAnimate,
            storyLine,
            handleNext,
            type: "word",
            // image: elephant,
            enableNext,
            showTimer: false,
            points,
            steps: questions?.length,
            currentStep: currentQuestion + 1,
            progressData,
            showProgress: true,
            background:
              isShowCase &&
              "linear-gradient(281.02deg, #AE92FF 31.45%, #555ADA 100%)",
            playTeacherAudio,
            callUpdateLearner: isShowCase,
            disableScreen,
            isShowCase,
            handleBack: !isShowCase && handleBack,
            setEnableNext,
            loading,
            setOpenMessageDialog,
          }}
        />
      );
    } else if (mechanism.name === "jumbledWord") {
      return (
        <JumbledWord
          page={page}
          setPage={setPage}
          {...{
            level: level,
            header:
              questions[currentQuestion]?.contentType === "image"
                ? `Guess the below image`
                : `Speak the below word`,
            //
            currentImg: currentImage,
            parentWords: parentWords,
            contentType: currentContentType,
            contentId: questions[currentQuestion]?.contentId,
            setVoiceText,
            setRecordedAudio,
            setVoiceAnimate,
            storyLine,
            handleNext,
            type: "word",
            // image: elephant,
            enableNext,
            showTimer: false,
            points,
            steps: questions?.length,
            currentStep: currentQuestion + 1,
            progressData,
            showProgress: true,
            background:
              isShowCase &&
              "linear-gradient(281.02deg, #AE92FF 31.45%, #555ADA 100%)",
            playTeacherAudio,
            callUpdateLearner: isShowCase,
            disableScreen,
            isShowCase,
            handleBack: !isShowCase && handleBack,
            setEnableNext,
            loading,
            setOpenMessageDialog,
          }}
        />
      );
    } else if (mechanism.name === "r3") {
      return (
        <R3
          page={page}
          setPage={setPage}
          {...{
            level: level,
            header:
              questions[currentQuestion]?.contentType === "image"
                ? `Guess the below image`
                : `Speak the below word`,
            //
            currentImg: currentImage,
            parentWords: parentWords,
            contentType: currentContentType,
            contentId: questions[currentQuestion]?.contentId,
            setVoiceText,
            setRecordedAudio,
            setVoiceAnimate,
            storyLine,
            handleNext,
            type: "word",
            // image: elephant,
            enableNext,
            showTimer: false,
            points,
            steps: questions?.length,
            currentStep: currentQuestion + 1,
            progressData,
            showProgress: true,
            background:
              isShowCase &&
              "linear-gradient(281.02deg, #AE92FF 31.45%, #555ADA 100%)",
            playTeacherAudio,
            callUpdateLearner: isShowCase,
            disableScreen,
            isShowCase,
            handleBack: !isShowCase && handleBack,
            setEnableNext,
            loading,
            setOpenMessageDialog,
          }}
        />
      );
    } else if (mechanism.name === "askMore") {
      return (
        <AskMoreM14
          page={page}
          setPage={setPage}
          {...{
            level: level,
            header:
              questions[currentQuestion]?.contentType === "image"
                ? `Guess the below image`
                : `Speak the below word`,
            //
            currentImg: currentImage,
            parentWords: parentWords,
            contentType: currentContentType,
            contentId: questions[currentQuestion]?.contentId,
            setVoiceText,
            setRecordedAudio,
            setVoiceAnimate,
            storyLine,
            handleNext,
            type: "word",
            // image: elephant,
            enableNext,
            showTimer: false,
            points,
            steps: questions?.length,
            currentStep: currentQuestion + 1,
            progressData,
            showProgress: true,
            background:
              isShowCase &&
              "linear-gradient(281.02deg, #AE92FF 31.45%, #555ADA 100%)",
            playTeacherAudio,
            callUpdateLearner: isShowCase,
            disableScreen,
            isShowCase,
            handleBack: !isShowCase && handleBack,
            setEnableNext,
            loading,
            setOpenMessageDialog,
            startShowCase,
            setStartShowCase,
            livesData,
            setLivesData,
            gameOverData,
            highlightWords,
            matchedChar: !isShowCase && questions[currentQuestion]?.matchedChar,
            percentage,
            fluency,
            isNextButtonCalled,
            setIsNextButtonCalled,
          }}
        />
      );
    } else if (mechanism.name === "actOut") {
      return (
        <ActOutM13
          page={page}
          setPage={setPage}
          {...{
            level: level,
            header:
              questions[currentQuestion]?.contentType === "image"
                ? `Guess the below image`
                : `Speak the below word`,
            //
            currentImg: currentImage,
            parentWords: parentWords,
            contentType: currentContentType,
            contentId: questions[currentQuestion]?.contentId,
            setVoiceText,
            setRecordedAudio,
            setVoiceAnimate,
            storyLine,
            handleNext,
            type: "word",
            // image: elephant,
            enableNext,
            showTimer: false,
            points,
            steps: questions?.length,
            currentStep: currentQuestion + 1,
            progressData,
            showProgress: true,
            background:
              isShowCase &&
              "linear-gradient(281.02deg, #AE92FF 31.45%, #555ADA 100%)",
            playTeacherAudio,
            callUpdateLearner: isShowCase,
            disableScreen,
            isShowCase,
            handleBack: !isShowCase && handleBack,
            setEnableNext,
            loading,
            setOpenMessageDialog,
            startShowCase,
            setStartShowCase,
            livesData,
            setLivesData,
            gameOverData,
            highlightWords,
            matchedChar: !isShowCase && questions[currentQuestion]?.matchedChar,
            percentage,
            fluency,
            isNextButtonCalled,
            setIsNextButtonCalled,
          }}
        />
      );
    } else if (mechanism.name === "ReadAloudMcqM10") {
      return (
        <PhoneConversation
          page={page}
          setPage={setPage}
          {...{
            level: level,
            header:
              questions[currentQuestion]?.contentType === "image"
                ? `Guess the below image`
                : `Speak the below word`,
            //
            currentImg: currentImage,
            parentWords: parentWords,
            contentType: currentContentType,
            contentId: questions[currentQuestion]?.contentId,
            setVoiceText,
            setRecordedAudio,
            setVoiceAnimate,
            storyLine,
            handleNext,
            type: "word",
            // image: elephant,
            enableNext,
            showTimer: false,
            points,
            steps: questions?.length,
            currentStep: currentQuestion + 1,
            progressData,
            showProgress: true,
            background:
              isShowCase &&
              "linear-gradient(281.02deg, #AE92FF 31.45%, #555ADA 100%)",
            playTeacherAudio,
            callUpdateLearner: isShowCase,
            disableScreen,
            isShowCase,
            handleBack: !isShowCase && handleBack,
            setEnableNext,
            loading,
            setOpenMessageDialog,
            startShowCase,
            setStartShowCase,
            livesData,
            setLivesData,
            gameOverData,
            highlightWords,
            matchedChar: !isShowCase && questions[currentQuestion]?.matchedChar,
            percentage,
            fluency,
            isNextButtonCalled,
            setIsNextButtonCalled,
          }}
        />
      );
    } else if (mechanism.name === "WhatsMissing") {
      return (
        <WhatsMissing
          page={page}
          setPage={setPage}
          {...{
            level: level,
            header:
              questions[currentQuestion]?.contentType === "image"
                ? `Guess the below image`
                : `Speak the below word`,
            //
            currentImg: currentImage,
            parentWords: parentWords,
            contentType: currentContentType,
            contentId: questions[currentQuestion]?.contentId,
            setVoiceText,
            setRecordedAudio,
            setVoiceAnimate,
            storyLine,
            handleNext,
            type: "word",
            // image: elephant,
            enableNext,
            showTimer: false,
            points,
            steps: questions?.length,
            currentStep: currentQuestion + 1,
            progressData,
            showProgress: true,
            background:
              isShowCase &&
              "linear-gradient(281.02deg, #AE92FF 31.45%, #555ADA 100%)",
            playTeacherAudio,
            callUpdateLearner: isShowCase,
            disableScreen,
            isShowCase,
            handleBack: !isShowCase && handleBack,
            setEnableNext,
            loading,
            setOpenMessageDialog,
          }}
        />
      );
    } else if (mechanism.name === "arrangePicture") {
      return (
        <ArrangePicture
          page={page}
          setPage={setPage}
          {...{
            level: level,
            header:
              questions[currentQuestion]?.contentType === "image"
                ? `Guess the below image`
                : `Speak the below word`,
            //
            currentImg: currentImage,
            parentWords: parentWords,
            contentType: currentContentType,
            contentId: questions[currentQuestion]?.contentId,
            setVoiceText,
            setRecordedAudio,
            setVoiceAnimate,
            storyLine,
            handleNext,
            type: "word",
            // image: elephant,
            enableNext,
            showTimer: false,
            points,
            steps: questions?.length,
            currentStep: currentQuestion + 1,
            progressData,
            showProgress: true,
            background:
              isShowCase &&
              "linear-gradient(281.02deg, #AE92FF 31.45%, #555ADA 100%)",
            playTeacherAudio,
            callUpdateLearner: isShowCase,
            disableScreen,
            isShowCase,
            handleBack: !isShowCase && handleBack,
            setEnableNext,
            loading,
            setOpenMessageDialog,
          }}
        />
      );
    } else if (mechanism.name === "AnouncementFlow") {
      return (
        <AnouncementFlow
          page={page}
          setPage={setPage}
          {...{
            level: level,
            header:
              questions[currentQuestion]?.contentType === "image"
                ? `Guess the below image`
                : `Speak the below word`,
            //
            currentImg: currentImage,
            parentWords: parentWords,
            contentType: currentContentType,
            contentId: questions[currentQuestion]?.contentId,
            setVoiceText,
            setRecordedAudio,
            setVoiceAnimate,
            storyLine,
            handleNext,
            type: "word",
            // image: elephant,
            enableNext,
            showTimer: false,
            points,
            steps: questions?.length,
            currentStep: currentQuestion + 1,
            progressData,
            showProgress: true,
            background:
              isShowCase &&
              "linear-gradient(281.02deg, #AE92FF 31.45%, #555ADA 100%)",
            playTeacherAudio,
            callUpdateLearner: isShowCase,
            disableScreen,
            isShowCase,
            handleBack: !isShowCase && handleBack,
            setEnableNext,
            loading,
            setOpenMessageDialog,
            startShowCase,
            setStartShowCase,
            livesData,
            setLivesData,
            gameOverData,
            highlightWords,
            matchedChar: !isShowCase && questions[currentQuestion]?.matchedChar,
            percentage,
            fluency,
            isNextButtonCalled,
            setIsNextButtonCalled,
          }}
        />
      );
    } else if (mechanism.name === "PhrasesInAction") {
      return (
        <PhrasesInAction
          page={page}
          setPage={setPage}
          {...{
            level: level,
            header:
              questions[currentQuestion]?.contentType === "image"
                ? `Guess the below image`
                : `Speak the below word`,
            //
            currentImg: currentImage,
            parentWords: parentWords,
            contentType: currentContentType,
            contentId: questions[currentQuestion]?.contentId,
            setVoiceText,
            setRecordedAudio,
            setVoiceAnimate,
            storyLine,
            handleNext,
            type: "word",
            // image: elephant,
            enableNext,
            showTimer: false,
            points,
            steps: questions?.length,
            currentStep: currentQuestion + 1,
            progressData,
            showProgress: true,
            background:
              isShowCase &&
              "linear-gradient(281.02deg, #AE92FF 31.45%, #555ADA 100%)",
            playTeacherAudio,
            callUpdateLearner: isShowCase,
            disableScreen,
            isShowCase: true,
            handleBack: !isShowCase && handleBack,
            setEnableNext,
            loading,
            setOpenMessageDialog,
          }}
        />
      );
    } else if (mechanism.name === "McqFlow") {
      return (
        <McqFlow
          page={page}
          setPage={setPage}
          {...{
            level: level,
            header:
              questions[currentQuestion]?.contentType === "image"
                ? `Guess the below image`
                : `Speak the below word`,
            //
            currentImg: currentImage,
            parentWords: parentWords,
            contentType: currentContentType,
            contentId: questions[currentQuestion]?.contentId,
            setVoiceText,
            setRecordedAudio,
            setVoiceAnimate,
            storyLine,
            handleNext,
            type: "word",
            // image: elephant,
            enableNext,
            showTimer: false,
            points,
            steps: questions?.length,
            currentStep: currentQuestion + 1,
            progressData,
            showProgress: true,
            background:
              isShowCase &&
              "linear-gradient(281.02deg, #AE92FF 31.45%, #555ADA 100%)",
            playTeacherAudio,
            callUpdateLearner: isShowCase,
            disableScreen,
            isShowCase: true,
            handleBack: !isShowCase && handleBack,
            setEnableNext,
            loading,
            setOpenMessageDialog,
          }}
        />
      );
    } else if (
      mechanism.name === "audio" ||
      (mechanism.name === "fillInTheBlank" && mechanism.id === "")
    ) {
      return (
        <Mechanics6
          page={page}
          setPage={setPage}
          {...{
            level: !isShowCase && level,
            header:
              mechanism.name === "fillInTheBlank"
                ? "Fill in the blank"
                : questions[currentQuestion]?.contentType === "image"
                ? `Guess the below image`
                : `Speak the below ${questions[currentQuestion]?.contentType}`,
            parentWords:
              questions[currentQuestion]?.contentSourceData?.[0]?.text,
            contentType: currentContentType,
            contentId: questions[currentQuestion]?.contentId,
            setVoiceText,
            type: mechanism.name,
            setRecordedAudio,
            setVoiceAnimate,
            storyLine,
            handleNext,
            image: questions[currentQuestion]?.mechanics_data
              ? `${process.env.REACT_APP_AWS_S3_BUCKET_CONTENT_URL}/mechanics_images/` +
                questions[currentQuestion]?.mechanics_data[0]?.image_url
              : null,
            audio: questions[currentQuestion]?.mechanics_data
              ? `${process.env.REACT_APP_AWS_S3_BUCKET_CONTENT_URL}/mechanics_audios/` +
                questions[currentQuestion]?.mechanics_data[0]?.audio_url
              : null,
            enableNext,
            showTimer: false,
            points,
            steps: questions?.length,
            currentStep: currentQuestion + 1,
            progressData,
            showProgress: true,
            background:
              isShowCase &&
              "linear-gradient(281.02deg, #AE92FF 31.45%, #555ADA 100%)",
            playTeacherAudio,
            callUpdateLearner: isShowCase,
            disableScreen,
            isShowCase,
            handleBack: !isShowCase && handleBack,
            setEnableNext,
            allWords:
              questions?.map((elem) => elem?.contentSourceData?.[0]?.text) ||
              [],
            loading,
            setOpenMessageDialog,
            options: questions[currentQuestion]?.mechanics_data
              ? questions[currentQuestion]?.mechanics_data[0]?.options
              : [],
            isNextButtonCalled,
            setIsNextButtonCalled,
          }}
        />
      );
    } else if (page === 1) {
      return <Mechanics2 page={page} setPage={setPage} />;
    }
  };

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
      {renderMechanics()}
    </>
  );
};

export default Practice;
