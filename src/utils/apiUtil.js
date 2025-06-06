import axios from "axios";
import { compareArrays, getLocalData, replaceAll } from "./constants";
import config from "./urlConstants.json";
import calcCER from "../../node_modules/character-error-rate/index";
import { response } from "../services/telementryService";
import S3Client from "../config/awsS3";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const getHeaders = () => {
  const token = localStorage.getItem("apiToken");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

export const fetchASROutput = async (base64Data, options, setLoader) => {
  try {
    setLoader(true);

    const lang = getLocalData("lang");
    const virtualId = getLocalData("virtualId");
    const sessionId = getLocalData("sessionId");
    const sub_session_id = getLocalData("sub_session_id");

    const requestBody = {
      original_text: options.originalText || "",
      audio: base64Data,
      user_id: virtualId,
      session_id: sessionId,
      language: lang,
      date: new Date(),
      sub_session_id,
      contentId: "c637b060-898c-4d7c-8172-6422681c0a5a",
      contentType: "Paragraph",
      mechanics_id: localStorage.getItem("mechanism_id") || "",
      //comprehension: options.comprehension || "",
      ans_key: [`1. ${options.originalText}` || ""],
      question_text: [`1. ${options.questionText}` || ""],
    };

    for (let key in requestBody) {
      if (typeof requestBody[key] === "string") {
        requestBody[key] = requestBody[key]
          .replace(/<script.*?>.*?<\/script>/gi, "")
          .replace(/javascript:/gi, "")
          .trim();
      }
    }

    const { data } = await axios.post(
      `${process.env.REACT_APP_LEARNER_AI_APP_HOST}/${config.URLS.UPDATE_LEARNER_PROFILE}/${lang}`,
      requestBody,
      getHeaders()
    );

    return data;
  } catch (error) {
    console.error("Error in fetchASROutput:", error);
    return "";
  } finally {
    setLoader(false);
  }
};

export const handleTextEvaluation = async (teacherText, studentText) => {
  try {
    const formData = new FormData();
    formData.append("teacherText", `1. ${teacherText}`);
    formData.append("studentText", `1. ${studentText}`);

    const response = await fetch(
      "https://dev-ekstep-tell-ocr-service-985885894164.asia-south1.run.app/api/v1/ocr/gemini/evaluateText",
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();
    console.log("Evaluation API Response:", result);

    const evalResult = result?.responseObj?.responseDataParams?.data?.[0] || {};

    return {
      marks: evalResult.marks || 0,
      grades: evalResult.marks || 0,
      semantics: evalResult.semantics || 0,
      context: evalResult.context || 0,
      grammar: evalResult.grammar || 0,
      accuracy: evalResult.accuracy || 0,
      overall: evalResult.overall || 0,
    };
  } catch (error) {
    console.error("Error in evaluateText API:", error);
    return null;
  }
};

export const callTelemetryApi = async (
  originalText,
  sessionId,
  currentLine,
  base64Data,
  responseStartTime,
  responseText
) => {
  //const responseStartTime = new Date().getTime();
  const responseEndTime = new Date().getTime();
  const responseDuration = Math.round(
    (responseEndTime - responseStartTime) / 1000
  );

  let texttemp = responseText.toLowerCase();
  texttemp = replaceAll(texttemp, ".", "");
  texttemp = replaceAll(texttemp, "'", "");
  texttemp = replaceAll(texttemp, ",", "");
  texttemp = replaceAll(texttemp, "!", "");
  texttemp = replaceAll(texttemp, "|", "");
  texttemp = replaceAll(texttemp, "?", "");
  const studentTextArray = texttemp.split(" ");

  let tempteacherText = originalText.toLowerCase();
  tempteacherText = tempteacherText.replace(/\u00A0/g, " ");
  tempteacherText = tempteacherText.trim();
  tempteacherText = replaceAll(tempteacherText, ".", "");
  tempteacherText = replaceAll(tempteacherText, "'", "");
  tempteacherText = replaceAll(tempteacherText, ",", "");
  tempteacherText = replaceAll(tempteacherText, "!", "");
  tempteacherText = replaceAll(tempteacherText, "|", "");
  tempteacherText = replaceAll(tempteacherText, "?", "");
  const teacherTextArray = tempteacherText.split(" ");

  let student_correct_words_result = [];
  let student_incorrect_words_result = [];
  let originalwords = teacherTextArray.length;
  let studentswords = studentTextArray.length;
  let wrong_words = 0;
  let correct_words = 0;
  let result_per_words = 0;

  let word_result_array = compareArrays(teacherTextArray, studentTextArray);

  for (let i = 0; i < studentTextArray.length; i++) {
    if (teacherTextArray.includes(studentTextArray[i])) {
      correct_words++;
      student_correct_words_result.push(studentTextArray[i]);
    } else {
      wrong_words++;
      student_incorrect_words_result.push(studentTextArray[i]);
    }
  }
  //calculation method
  if (originalwords >= studentswords) {
    result_per_words = Math.round(
      Number((correct_words / originalwords) * 100)
    );
  } else {
    result_per_words = Math.round(
      Number((correct_words / studentswords) * 100)
    );
  }

  const errorRate = calcCER(responseText, tempteacherText);
  let finalScore = 100 - errorRate * 100;

  finalScore = finalScore < 0 ? 0 : finalScore;

  let word_result = finalScore === 100 ? "correct" : "incorrect";

  // TODO: Remove false when REACT_APP_AWS_S3_BUCKET_NAME and keys added
  let audioFileName = "";
  if (process.env.REACT_APP_CAPTURE_AUDIO === "true") {
    let getContentId = currentLine;
    audioFileName = `${
      process.env.REACT_APP_CHANNEL
    }/${sessionId}-${Date.now()}-${getContentId}.wav`;

    const command = new PutObjectCommand({
      Bucket: process.env.REACT_APP_AWS_S3_BUCKET_NAME,
      Key: audioFileName,
      Body: Uint8Array.from(window.atob(base64Data), (c) => c.charCodeAt(0)),
      ContentType: "audio/wav",
    });
    try {
      await S3Client.send(command);
    } catch (err) {}
  }

  response(
    {
      // Required
      target:
        process.env.REACT_APP_CAPTURE_AUDIO === "true"
          ? `${audioFileName}`
          : "", // Required. Target of the response
      //"qid": "", // Required. Unique assessment/question id
      type: "SPEAK", // Required. Type of response. CHOOSE, DRAG, SELECT, MATCH, INPUT, SPEAK, WRITE
      values: [
        { original_text: originalText },
        { response_text: responseText },
        { response_correct_words_array: student_correct_words_result },
        { response_incorrect_words_array: student_incorrect_words_result },
        { response_word_array_result: word_result_array },
        { response_word_result: word_result },
        { accuracy_percentage: finalScore },
        { duration: responseDuration },
      ],
    },
    "ET"
  );
};
