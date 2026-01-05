// @ts-nocheck
import * as faceapi from 'face-api.js';
import { Canvas, Image, ImageData, loadImage } from 'canvas';
import path from 'path';
import { fileURLToPath } from 'url';

faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let modelsLoaded = false;

/**
 * Load FaceAPI Models
 */
export const loadModels = async () => {
  if (modelsLoaded) return;

  const modelPath = path.join(__dirname, '../models');
  
  try {
    console.log(`Loading FaceAPI models from ${modelPath}...`);
    
  
    await faceapi.nets.tinyFaceDetector.loadFromDisk(modelPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
    
    modelsLoaded = true;
    console.log("FaceAPI Models Loaded Successfully (Tiny Face Detector)");
  } catch (error) {
    console.error("Error loading FaceAPI models:", error);
    throw new Error("Gagal memuat model pengenalan wajah");
  }
};

 /** 
 * @param {Buffer} imageBuffer 
 * @returns {Promise<Float32Array | null>}
 */
export const getFaceDescriptor = async (imageBuffer) => {
  if (!modelsLoaded) await loadModels();

  try {
    const img = await loadImage(imageBuffer);
    
    const options = new faceapi.TinyFaceDetectorOptions({ 
      inputSize: 512, 
      scoreThreshold: 0.5 
    });

    // Detect face
    const detection = await faceapi.detectSingleFace(img, options)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) return null;
    
    return detection.descriptor;
  } catch (error) {
    console.error("Error detecting face:", error);
    return null;
  }
};

/**
 * Verify if two descriptors match
 * @param {Float32Array} descriptor1 
 * @param {Float32Array} descriptor2 
 * @param {number} threshold Default 0.6
 * @returns {boolean}
 */
export const verifyFace = (descriptor1, descriptor2, threshold = 0.6) => {
  const dist = faceapi.euclideanDistance(descriptor1, descriptor2);
  console.log(`Face Distance: ${dist}`);
  return dist < threshold;
};
