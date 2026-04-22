import speech from "@google-cloud/speech";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "@ffmpeg-installer/ffmpeg";
import os from "os";

ffmpeg.setFfmpegPath(ffmpegStatic.path);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const credentialsPath = path.join(__dirname, "../../ooaauth-457522-119674c940f0.json");

const client = new speech.SpeechClient({
  keyFilename: credentialsPath,
});

async function convertM4AtoWAV(inputBuffer) {
  return new Promise((resolve, reject) => {
    const tempDir = os.tmpdir();
    const inputPath = path.join(tempDir, `audio-${Date.now()}.m4a`);
    const outputPath = path.join(tempDir, `audio-${Date.now()}.wav`);

    fs.writeFileSync(inputPath, inputBuffer);

    ffmpeg(inputPath)
      .toFormat("wav")
      .audioFrequency(16000)
      .audioChannels(1)
      .on("error", (err) => {
        fs.unlinkSync(inputPath);
        reject(err);
      })
      .on("end", () => {
        const wavBuffer = fs.readFileSync(outputPath);
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
        resolve(wavBuffer);
      })
      .save(outputPath);
  });
}

export const TranscribeService = {
  async transcribeAudio(audioBuffer) {
    try {
      console.log("🎤 Audio buffer size:", audioBuffer.length);
      console.log("🔄 Converting M4A to WAV...");

      const wavBuffer = await convertM4AtoWAV(audioBuffer);
      console.log("✅ Conversion complete, WAV size:", wavBuffer.length);

      const audio = {
        content: wavBuffer.toString("base64"),
      };

      const config = {
        encoding: "LINEAR16",
        sampleRateHertz: 16000,
        languageCode: "th-TH",
        audioChannelCount: 1,
      };

      console.log("🎯 Config:", JSON.stringify(config));

      const request = {
        audio: audio,
        config: config,
      };

      console.log("📤 Sending to Google Cloud...");
      const [response] = await client.recognize(request);
      console.log("✅ Google response:", response);

      const transcription = response.results
        .map((result) =>
          result.alternatives[0] ? result.alternatives[0].transcript : ""
        )
        .join("\n");

      console.log("✅ Transcribed:", transcription);
      return transcription.trim();
    } catch (err) {
      console.error("❌ Transcribe error:", err);
      throw new Error("Failed to transcribe audio: " + err.message);
    }
  },
};
