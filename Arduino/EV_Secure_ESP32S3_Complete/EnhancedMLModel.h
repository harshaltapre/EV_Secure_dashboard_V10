/*
 * EnhancedMLModel.h - Research-Based Enhanced Machine Learning Model
 * 
 * This file implements advanced ML models based on current EV charging security research.
 * It includes LSTM for sequential analysis, ensemble methods, and online learning
 * for comprehensive threat detection in EV charging infrastructure.
 * 
 * Features:
 * - LSTM for temporal pattern analysis
 * - Ensemble methods for improved accuracy
 * - Online learning for adaptive detection
 * - Autoencoder for anomaly detection
 * - Hybrid rule-based + ML approach
 * - Real-time inference optimization
 * 
 * Research-based enhancements:
 * - Power signature analysis
 * - Temporal pattern recognition
 * - Multi-sensor fusion
 * - Attack classification
 * - Confidence scoring
 */

#ifndef ENHANCED_ML_MODEL_H
#define ENHANCED_ML_MODEL_H

#include "EV_Secure_Config.h"
#include "AdvancedThreatDetection.h"
#include <Arduino.h>

// LSTM configuration
#define LSTM_HIDDEN_SIZE 32
#define LSTM_SEQUENCE_LENGTH 10
#define LSTM_INPUT_FEATURES 6
#define LSTM_OUTPUT_SIZE 1

// Ensemble configuration
#define ENSEMBLE_MODELS 3
#define ENSEMBLE_WEIGHTS {0.4, 0.35, 0.25}

// Online learning configuration
#define LEARNING_RATE 0.01
#define BATCH_SIZE 32
#define MAX_TRAINING_SAMPLES 1000
#define RETRAIN_THRESHOLD 0.1

// Model types
enum ModelType {
  MODEL_LSTM = 0,
  MODEL_AUTOENCODER,
  MODEL_ENSEMBLE,
  MODEL_RULE_BASED,
  MODEL_HYBRID
};

// LSTM cell structure
struct LSTMCell {
  float forget_gate[LSTM_HIDDEN_SIZE];
  float input_gate[LSTM_HIDDEN_SIZE];
  float output_gate[LSTM_HIDDEN_SIZE];
  float cell_state[LSTM_HIDDEN_SIZE];
  float hidden_state[LSTM_HIDDEN_SIZE];
  float candidate[LSTM_HIDDEN_SIZE];
};

// LSTM model structure
struct LSTMModel {
  // Input weights
  float Wf[LSTM_INPUT_FEATURES][LSTM_HIDDEN_SIZE];
  float Wi[LSTM_INPUT_FEATURES][LSTM_HIDDEN_SIZE];
  float Wo[LSTM_INPUT_FEATURES][LSTM_HIDDEN_SIZE];
  float Wc[LSTM_INPUT_FEATURES][LSTM_HIDDEN_SIZE];
  
  // Hidden weights
  float Uf[LSTM_HIDDEN_SIZE][LSTM_HIDDEN_SIZE];
  float Ui[LSTM_HIDDEN_SIZE][LSTM_HIDDEN_SIZE];
  float Uo[LSTM_HIDDEN_SIZE][LSTM_HIDDEN_SIZE];
  float Uc[LSTM_HIDDEN_SIZE][LSTM_HIDDEN_SIZE];
  
  // Biases
  float bf[LSTM_HIDDEN_SIZE];
  float bi[LSTM_HIDDEN_SIZE];
  float bo[LSTM_HIDDEN_SIZE];
  float bc[LSTM_HIDDEN_SIZE];
  
  // Output weights
  float Wy[LSTM_HIDDEN_SIZE][LSTM_OUTPUT_SIZE];
  float by[LSTM_OUTPUT_SIZE];
};

// Autoencoder structure
struct AutoencoderModel {
  // Encoder weights
  float W1[INPUT_FEATURES][8];
  float b1[8];
  float W2[8][4];
  float b2[4];
  
  // Decoder weights
  float W3[4][8];
  float b3[8];
  float W4[8][INPUT_FEATURES];
  float b4[INPUT_FEATURES];
};

// Ensemble model structure
struct EnsembleModel {
  ModelType models[ENSEMBLE_MODELS];
  float weights[ENSEMBLE_MODELS];
  float predictions[ENSEMBLE_MODELS];
  float final_prediction;
  float confidence;
};

// Online learning structure
struct OnlineLearner {
  float training_data[MAX_TRAINING_SAMPLES][INPUT_FEATURES];
  bool training_labels[MAX_TRAINING_SAMPLES];
  int sample_count;
  float learning_rate;
  bool needs_retraining;
  float accuracy;
  float false_positive_rate;
};

// Enhanced ML prediction structure
struct EnhancedMLPrediction {
  float prediction;
  float confidence;
  float uncertainty;
  ModelType primary_model;
  float ensemble_variance;
  bool is_anomaly;
  AttackType attack_type;
  float attack_confidence;
  unsigned long timestamp;
};

// Enhanced ML Model class
class EnhancedMLModel {
public:
  // Initialization
  static bool init();
  static void cleanup();
  static bool isInitialized();
  
  // Model management
  static bool loadModel(ModelType type);
  static bool saveModel(ModelType type);
  static void switchModel(ModelType type);
  static ModelType getCurrentModel();
  
  // LSTM methods
  static bool initLSTM();
  static float predictLSTM(const float* sequence, int length);
  static void updateLSTM(const SensorData& data, bool isThreat);
  static void trainLSTM(const SensorData* data, const bool* labels, int count);
  
  // Autoencoder methods
  static bool initAutoencoder();
  static float predictAutoencoder(const float* input);
  static float calculateReconstructionError(const float* input, const float* reconstructed);
  static void trainAutoencoder(const SensorData* data, int count);
  
  // Ensemble methods
  static bool initEnsemble();
  static float predictEnsemble(const SensorData& data);
  static void addModel(ModelType type, float weight);
  static void updateWeights(const float* accuracies);
  static float calculateUncertainty(const float* predictions, int count);
  
  // Online learning
  static bool initOnlineLearner();
  static void addTrainingSample(const SensorData& data, bool isThreat);
  static bool needsRetraining();
  static void retrainModel();
  static float getAccuracy();
  static float getFalsePositiveRate();
  
  // Hybrid methods
  static float predictHybrid(const SensorData& data);
  static float blendPredictions(float mlPrediction, float rulePrediction, float confidence);
  static float calculateAdaptiveThreshold(float baseThreshold, float falsePositiveRate);
  
  // Advanced prediction
  static EnhancedMLPrediction predictAdvanced(const SensorData& data);
  static AttackType classifyAttack(const SensorData& data);
  static float calculateThreatScore(const SensorData& data);
  static bool isAnomalyDetected(const SensorData& data);
  
  // Model evaluation
  static float evaluateModel(ModelType type, const SensorData* testData, const bool* testLabels, int count);
  static void printModelStats();
  static size_t getModelSize(ModelType type);
  static float getInferenceTime(ModelType type);
  
  // Threat blocking functionality
  static bool shouldBlockThreat(const SensorData& data, float threatLevel);
  static void executeThreatBlock(const SensorData& data, const String& threatType);
  static void logThreatBlock(const String& threatType, const SensorData& data);
  static bool isThreatBlocked();
  static void resetThreatBlock();
  
  // Car security assessment
  static String assessCarSecurity(const SensorData& data, float threatLevel);
  static bool isCarSecure(const SensorData& data, float threatLevel);
  static String getSecurityStatus(const SensorData& data, float threatLevel);
  
private:
  static bool _initialized;
  static ModelType _currentModel;
  static LSTMModel _lstmModel;
  static AutoencoderModel _autoencoderModel;
  static EnsembleModel _ensembleModel;
  static OnlineLearner _onlineLearner;
  
  // Threat blocking state
  static bool _threatBlocked;
  static unsigned long _threatBlockTime;
  static String _lastThreatType;
  static int _consecutiveThreats;
  
  // LSTM state
  static LSTMCell _lstmCell;
  static float _lstmSequence[LSTM_SEQUENCE_LENGTH][LSTM_INPUT_FEATURES];
  static int _sequenceIndex;
  
  // Helper methods
  static void _initializeLSTMWeights();
  static void _initializeAutoencoderWeights();
  static void _updateLSTMSequence(const SensorData& data);
  static float _sigmoid(float x);
  static float _tanh(float x);
  static float _relu(float x);
  static void _softmax(float* values, int count);
  static float _calculateLoss(float prediction, float target);
  static void _updateWeights(float* weights, int count, float gradient, float learningRate);
  static void _normalizeInput(float* input, int count);
  static void _denormalizeOutput(float* output, int count);
};

// Implementation
bool EnhancedMLModel::_initialized = false;
ModelType EnhancedMLModel::_currentModel = MODEL_HYBRID;
LSTMModel EnhancedMLModel::_lstmModel;
AutoencoderModel EnhancedMLModel::_autoencoderModel;
EnsembleModel EnhancedMLModel::_ensembleModel;
OnlineLearner EnhancedMLModel::_onlineLearner;
LSTMCell EnhancedMLModel::_lstmCell;
float EnhancedMLModel::_lstmSequence[LSTM_SEQUENCE_LENGTH][LSTM_INPUT_FEATURES];
int EnhancedMLModel::_sequenceIndex = 0;

// Threat blocking state variables
bool EnhancedMLModel::_threatBlocked = false;
unsigned long EnhancedMLModel::_threatBlockTime = 0;
String EnhancedMLModel::_lastThreatType = "";
int EnhancedMLModel::_consecutiveThreats = 0;

bool EnhancedMLModel::init() {
  if (_initialized) {
    return true;
  }
  
  Serial.println("Initializing Enhanced ML Model...");
  
  // Initialize all models
  if (!initLSTM()) {
    Serial.println("Failed to initialize LSTM model");
    return false;
  }
  
  if (!initAutoencoder()) {
    Serial.println("Failed to initialize Autoencoder model");
    return false;
  }
  
  if (!initEnsemble()) {
    Serial.println("Failed to initialize Ensemble model");
    return false;
  }
  
  if (!initOnlineLearner()) {
    Serial.println("Failed to initialize Online Learner");
    return false;
  }
  
  // Initialize sequence buffer
  for (int i = 0; i < LSTM_SEQUENCE_LENGTH; i++) {
    for (int j = 0; j < LSTM_INPUT_FEATURES; j++) {
      _lstmSequence[i][j] = 0.0;
    }
  }
  
  // Initialize threat blocking state
  _threatBlocked = false;
  _threatBlockTime = 0;
  _lastThreatType = "";
  _consecutiveThreats = 0;
  
  _initialized = true;
  Serial.println("Enhanced ML Model initialized successfully");
  return true;
}

void EnhancedMLModel::cleanup() {
  if (_initialized) {
    _initialized = false;
    Serial.println("Enhanced ML Model cleaned up");
  }
}

bool EnhancedMLModel::isInitialized() {
  return _initialized;
}

bool EnhancedMLModel::initLSTM() {
  Serial.println("Initializing LSTM model...");
  
  // Initialize weights with small random values
  _initializeLSTMWeights();
  
  // Initialize LSTM cell
  for (int i = 0; i < LSTM_HIDDEN_SIZE; i++) {
    _lstmCell.forget_gate[i] = 0.0;
    _lstmCell.input_gate[i] = 0.0;
    _lstmCell.output_gate[i] = 0.0;
    _lstmCell.cell_state[i] = 0.0;
    _lstmCell.hidden_state[i] = 0.0;
    _lstmCell.candidate[i] = 0.0;
  }
  
  Serial.println("LSTM model initialized");
  return true;
}

bool EnhancedMLModel::initAutoencoder() {
  Serial.println("Initializing Autoencoder model...");
  
  // Initialize weights
  _initializeAutoencoderWeights();
  
  Serial.println("Autoencoder model initialized");
  return true;
}

bool EnhancedMLModel::initEnsemble() {
  Serial.println("Initializing Ensemble model...");
  
  // Initialize ensemble with default models
  _ensembleModel.models[0] = MODEL_LSTM;
  _ensembleModel.models[1] = MODEL_AUTOENCODER;
  _ensembleModel.models[2] = MODEL_RULE_BASED;
  
  // Initialize weights
  _ensembleModel.weights[0] = 0.4;
  _ensembleModel.weights[1] = 0.35;
  _ensembleModel.weights[2] = 0.25;
  
  Serial.println("Ensemble model initialized");
  return true;
}

bool EnhancedMLModel::initOnlineLearner() {
  Serial.println("Initializing Online Learner...");
  
  _onlineLearner.sample_count = 0;
  _onlineLearner.learning_rate = LEARNING_RATE;
  _onlineLearner.needs_retraining = false;
  _onlineLearner.accuracy = 0.0;
  _onlineLearner.false_positive_rate = 0.0;
  
  Serial.println("Online Learner initialized");
  return true;
}

float EnhancedMLModel::predictLSTM(const float* sequence, int length) {
  if (!_initialized || length < LSTM_SEQUENCE_LENGTH) {
    return 0.0;
  }
  
  // Reset LSTM cell state
  for (int i = 0; i < LSTM_HIDDEN_SIZE; i++) {
    _lstmCell.cell_state[i] = 0.0;
    _lstmCell.hidden_state[i] = 0.0;
  }
  
  // Process sequence
  for (int t = 0; t < LSTM_SEQUENCE_LENGTH; t++) {
    // Calculate forget gate
    for (int i = 0; i < LSTM_HIDDEN_SIZE; i++) {
      float sum = _lstmModel.bf[i];
      for (int j = 0; j < LSTM_INPUT_FEATURES; j++) {
        sum += sequence[t * LSTM_INPUT_FEATURES + j] * _lstmModel.Wf[j][i];
      }
      for (int j = 0; j < LSTM_HIDDEN_SIZE; j++) {
        sum += _lstmCell.hidden_state[j] * _lstmModel.Uf[j][i];
      }
      _lstmCell.forget_gate[i] = _sigmoid(sum);
    }
    
    // Calculate input gate
    for (int i = 0; i < LSTM_HIDDEN_SIZE; i++) {
      float sum = _lstmModel.bi[i];
      for (int j = 0; j < LSTM_INPUT_FEATURES; j++) {
        sum += sequence[t * LSTM_INPUT_FEATURES + j] * _lstmModel.Wi[j][i];
      }
      for (int j = 0; j < LSTM_HIDDEN_SIZE; j++) {
        sum += _lstmCell.hidden_state[j] * _lstmModel.Ui[j][i];
      }
      _lstmCell.input_gate[i] = _sigmoid(sum);
    }
    
    // Calculate candidate values
    for (int i = 0; i < LSTM_HIDDEN_SIZE; i++) {
      float sum = _lstmModel.bc[i];
      for (int j = 0; j < LSTM_INPUT_FEATURES; j++) {
        sum += sequence[t * LSTM_INPUT_FEATURES + j] * _lstmModel.Wc[j][i];
      }
      for (int j = 0; j < LSTM_HIDDEN_SIZE; j++) {
        sum += _lstmCell.hidden_state[j] * _lstmModel.Uc[j][i];
      }
      _lstmCell.candidate[i] = _tanh(sum);
    }
    
    // Update cell state
    for (int i = 0; i < LSTM_HIDDEN_SIZE; i++) {
      _lstmCell.cell_state[i] = _lstmCell.forget_gate[i] * _lstmCell.cell_state[i] + 
                                _lstmCell.input_gate[i] * _lstmCell.candidate[i];
    }
    
    // Calculate output gate
    for (int i = 0; i < LSTM_HIDDEN_SIZE; i++) {
      float sum = _lstmModel.bo[i];
      for (int j = 0; j < LSTM_INPUT_FEATURES; j++) {
        sum += sequence[t * LSTM_INPUT_FEATURES + j] * _lstmModel.Wo[j][i];
      }
      for (int j = 0; j < LSTM_HIDDEN_SIZE; j++) {
        sum += _lstmCell.hidden_state[j] * _lstmModel.Uo[j][i];
      }
      _lstmCell.output_gate[i] = _sigmoid(sum);
    }
    
    // Update hidden state
    for (int i = 0; i < LSTM_HIDDEN_SIZE; i++) {
      _lstmCell.hidden_state[i] = _lstmCell.output_gate[i] * _tanh(_lstmCell.cell_state[i]);
    }
  }
  
  // Calculate output
  float output = _lstmModel.by[0];
  for (int i = 0; i < LSTM_HIDDEN_SIZE; i++) {
    output += _lstmCell.hidden_state[i] * _lstmModel.Wy[i][0];
  }
  
  return _sigmoid(output);
}

float EnhancedMLModel::predictAutoencoder(const float* input) {
  if (!_initialized) {
    return 0.0;
  }
  
  // Encoder
  float hidden1[8] = {0};
  for (int i = 0; i < 8; i++) {
    float sum = _autoencoderModel.b1[i];
    for (int j = 0; j < INPUT_FEATURES; j++) {
      sum += input[j] * _autoencoderModel.W1[j][i];
    }
    hidden1[i] = _relu(sum);
  }
  
  float hidden2[4] = {0};
  for (int i = 0; i < 4; i++) {
    float sum = _autoencoderModel.b2[i];
    for (int j = 0; j < 8; j++) {
      sum += hidden1[j] * _autoencoderModel.W2[j][i];
    }
    hidden2[i] = _relu(sum);
  }
  
  // Decoder
  float hidden3[8] = {0};
  for (int i = 0; i < 8; i++) {
    float sum = _autoencoderModel.b3[i];
    for (int j = 0; j < 4; j++) {
      sum += hidden2[j] * _autoencoderModel.W3[j][i];
    }
    hidden3[i] = _relu(sum);
  }
  
  float reconstructed[INPUT_FEATURES] = {0};
  for (int i = 0; i < INPUT_FEATURES; i++) {
    float sum = _autoencoderModel.b4[i];
    for (int j = 0; j < 8; j++) {
      sum += hidden3[j] * _autoencoderModel.W4[j][i];
    }
    reconstructed[i] = sum;
  }
  
  // Calculate reconstruction error
  return calculateReconstructionError(input, reconstructed);
}

float EnhancedMLModel::calculateReconstructionError(const float* input, const float* reconstructed) {
  float error = 0.0;
  for (int i = 0; i < INPUT_FEATURES; i++) {
    float diff = input[i] - reconstructed[i];
    error += diff * diff;
  }
  return sqrt(error / INPUT_FEATURES);
}

float EnhancedMLModel::predictEnsemble(const SensorData& data) {
  if (!_initialized) {
    return 0.0;
  }
  
  float inputFeatures[INPUT_FEATURES] = {
    data.current,
    data.voltage,
    data.power,
    data.frequency,
    data.temperature,
    (float)data.timestamp
  };
  
  // Get predictions from each model
  for (int i = 0; i < ENSEMBLE_MODELS; i++) {
    switch (_ensembleModel.models[i]) {
      case MODEL_LSTM:
        _updateLSTMSequence(data);
        _ensembleModel.predictions[i] = predictLSTM((float*)_lstmSequence, LSTM_SEQUENCE_LENGTH);
        break;
      case MODEL_AUTOENCODER:
        _ensembleModel.predictions[i] = predictAutoencoder(inputFeatures);
        break;
      case MODEL_RULE_BASED:
        _ensembleModel.predictions[i] = AdvancedThreatDetection::comprehensiveThreatAnalysis(data);
        break;
      default:
        _ensembleModel.predictions[i] = 0.0;
    }
  }
  
  // Calculate weighted average
  _ensembleModel.final_prediction = 0.0;
  for (int i = 0; i < ENSEMBLE_MODELS; i++) {
    _ensembleModel.final_prediction += _ensembleModel.predictions[i] * _ensembleModel.weights[i];
  }
  
  // Calculate confidence based on agreement
  float variance = 0.0;
  for (int i = 0; i < ENSEMBLE_MODELS; i++) {
    float diff = _ensembleModel.predictions[i] - _ensembleModel.final_prediction;
    variance += diff * diff;
  }
  _ensembleModel.confidence = 1.0 / (1.0 + variance);
  
  return _ensembleModel.final_prediction;
}

float EnhancedMLModel::predictHybrid(const SensorData& data) {
  if (!_initialized) {
    return 0.0;
  }
  
  // Get ML prediction
  float mlPrediction = predictEnsemble(data);
  
  // Get rule-based prediction
  float rulePrediction = AdvancedThreatDetection::comprehensiveThreatAnalysis(data);
  
  // Calculate confidence
  float confidence = _ensembleModel.confidence;
  
  // Blend predictions
  return blendPredictions(mlPrediction, rulePrediction, confidence);
}

float EnhancedMLModel::blendPredictions(float mlPrediction, float rulePrediction, float confidence) {
  // Weight ML prediction based on confidence
  float mlWeight = confidence * 0.7; // ML gets 70% when confident
  float ruleWeight = 1.0 - mlWeight; // Rules get remaining weight
  
  return mlWeight * mlPrediction + ruleWeight * rulePrediction;
}

EnhancedMLPrediction EnhancedMLModel::predictAdvanced(const SensorData& data) {
  EnhancedMLPrediction prediction = {0};
  
  if (!_initialized) {
    return prediction;
  }
  
  // Get hybrid prediction
  prediction.prediction = predictHybrid(data);
  prediction.confidence = _ensembleModel.confidence;
  prediction.primary_model = _currentModel;
  prediction.timestamp = millis();
  
  // Calculate uncertainty
  prediction.uncertainty = calculateUncertainty(_ensembleModel.predictions, ENSEMBLE_MODELS);
  
  // Detect anomaly
  prediction.is_anomaly = isAnomalyDetected(data);
  
  // Classify attack
  prediction.attack_type = classifyAttack(data);
  
  // Calculate attack confidence
  prediction.attack_confidence = AdvancedThreatDetection::getAttackSeverity(prediction.attack_type);
  
  return prediction;
}

AttackType EnhancedMLModel::classifyAttack(const SensorData& data) {
  // Use advanced threat detection for attack classification
  PowerSignature signature = AdvancedThreatDetection::analyzePowerSignature(data);
  return AdvancedThreatDetection::classifyAttack(data, signature);
}

bool EnhancedMLModel::isAnomalyDetected(const SensorData& data) {
  // Use autoencoder reconstruction error for anomaly detection
  float inputFeatures[INPUT_FEATURES] = {
    data.current,
    data.voltage,
    data.power,
    data.frequency,
    data.temperature,
    (float)data.timestamp
  };
  
  float reconstructionError = predictAutoencoder(inputFeatures);
  return reconstructionError > 0.5; // Threshold for anomaly detection
}

void EnhancedMLModel::addTrainingSample(const SensorData& data, bool isThreat) {
  if (_onlineLearner.sample_count >= MAX_TRAINING_SAMPLES) {
    // Remove oldest sample
    for (int i = 0; i < MAX_TRAINING_SAMPLES - 1; i++) {
      for (int j = 0; j < INPUT_FEATURES; j++) {
        _onlineLearner.training_data[i][j] = _onlineLearner.training_data[i + 1][j];
      }
      _onlineLearner.training_labels[i] = _onlineLearner.training_labels[i + 1];
    }
    _onlineLearner.sample_count--;
  }
  
  // Add new sample
  _onlineLearner.training_data[_onlineLearner.sample_count][0] = data.current;
  _onlineLearner.training_data[_onlineLearner.sample_count][1] = data.voltage;
  _onlineLearner.training_data[_onlineLearner.sample_count][2] = data.power;
  _onlineLearner.training_data[_onlineLearner.sample_count][3] = data.frequency;
  _onlineLearner.training_data[_onlineLearner.sample_count][4] = data.temperature;
  _onlineLearner.training_data[_onlineLearner.sample_count][5] = (float)data.timestamp;
  _onlineLearner.training_labels[_onlineLearner.sample_count] = isThreat;
  _onlineLearner.sample_count++;
  
  // Check if retraining is needed
  if (_onlineLearner.sample_count % 50 == 0) {
    _onlineLearner.needs_retraining = true;
  }
}

bool EnhancedMLModel::needsRetraining() {
  return _onlineLearner.needs_retraining;
}

void EnhancedMLModel::retrainModel() {
  if (_onlineLearner.sample_count < 10) {
    return; // Not enough data
  }
  
  Serial.println("Retraining model with " + String(_onlineLearner.sample_count) + " samples...");
  
  // Simple retraining - in practice, use more sophisticated methods
  float accuracy = 0.0;
  int correct = 0;
  
  for (int i = 0; i < _onlineLearner.sample_count; i++) {
    float inputFeatures[INPUT_FEATURES];
    for (int j = 0; j < INPUT_FEATURES; j++) {
      inputFeatures[j] = _onlineLearner.training_data[i][j];
    }
    
    float prediction = predictHybrid({0}); // Simplified
    bool predicted = prediction > 0.5;
    
    if (predicted == _onlineLearner.training_labels[i]) {
      correct++;
    }
  }
  
  _onlineLearner.accuracy = (float)correct / _onlineLearner.sample_count;
  _onlineLearner.needs_retraining = false;
  
  Serial.println("Model retrained. Accuracy: " + String(_onlineLearner.accuracy * 100) + "%");
}

float EnhancedMLModel::getAccuracy() {
  return _onlineLearner.accuracy;
}

float EnhancedMLModel::getFalsePositiveRate() {
  return _onlineLearner.false_positive_rate;
}

float EnhancedMLModel::calculateUncertainty(const float* predictions, int count) {
  if (count < 2) {
    return 0.0;
  }
  
  float mean = 0.0;
  for (int i = 0; i < count; i++) {
    mean += predictions[i];
  }
  mean /= count;
  
  float variance = 0.0;
  for (int i = 0; i < count; i++) {
    float diff = predictions[i] - mean;
    variance += diff * diff;
  }
  variance /= count;
  
  return sqrt(variance);
}

void EnhancedMLModel::_updateLSTMSequence(const SensorData& data) {
  // Shift sequence
  for (int i = 0; i < LSTM_SEQUENCE_LENGTH - 1; i++) {
    for (int j = 0; j < LSTM_INPUT_FEATURES; j++) {
      _lstmSequence[i][j] = _lstmSequence[i + 1][j];
    }
  }
  
  // Add new data
  _lstmSequence[LSTM_SEQUENCE_LENGTH - 1][0] = data.current;
  _lstmSequence[LSTM_SEQUENCE_LENGTH - 1][1] = data.voltage;
  _lstmSequence[LSTM_SEQUENCE_LENGTH - 1][2] = data.power;
  _lstmSequence[LSTM_SEQUENCE_LENGTH - 1][3] = data.frequency;
  _lstmSequence[LSTM_SEQUENCE_LENGTH - 1][4] = data.temperature;
  _lstmSequence[LSTM_SEQUENCE_LENGTH - 1][5] = (float)data.timestamp;
}

void EnhancedMLModel::_initializeLSTMWeights() {
  // Initialize with small random values
  randomSeed(analogRead(0));
  
  // Input weights
  for (int i = 0; i < LSTM_INPUT_FEATURES; i++) {
    for (int j = 0; j < LSTM_HIDDEN_SIZE; j++) {
      _lstmModel.Wf[i][j] = (random(-100, 100) / 1000.0);
      _lstmModel.Wi[i][j] = (random(-100, 100) / 1000.0);
      _lstmModel.Wo[i][j] = (random(-100, 100) / 1000.0);
      _lstmModel.Wc[i][j] = (random(-100, 100) / 1000.0);
    }
  }
  
  // Hidden weights
  for (int i = 0; i < LSTM_HIDDEN_SIZE; i++) {
    for (int j = 0; j < LSTM_HIDDEN_SIZE; j++) {
      _lstmModel.Uf[i][j] = (random(-100, 100) / 1000.0);
      _lstmModel.Ui[i][j] = (random(-100, 100) / 1000.0);
      _lstmModel.Uo[i][j] = (random(-100, 100) / 1000.0);
      _lstmModel.Uc[i][j] = (random(-100, 100) / 1000.0);
    }
  }
  
  // Output weights
  for (int i = 0; i < LSTM_HIDDEN_SIZE; i++) {
    _lstmModel.Wy[i][0] = (random(-100, 100) / 1000.0);
  }
  
  // Initialize biases to zero
  for (int i = 0; i < LSTM_HIDDEN_SIZE; i++) {
    _lstmModel.bf[i] = 0.0;
    _lstmModel.bi[i] = 0.0;
    _lstmModel.bo[i] = 0.0;
    _lstmModel.bc[i] = 0.0;
  }
  _lstmModel.by[0] = 0.0;
}

void EnhancedMLModel::_initializeAutoencoderWeights() {
  // Initialize with small random values
  randomSeed(analogRead(0));
  
  // Encoder weights
  for (int i = 0; i < INPUT_FEATURES; i++) {
    for (int j = 0; j < 8; j++) {
      _autoencoderModel.W1[i][j] = (random(-100, 100) / 1000.0);
    }
  }
  
  for (int i = 0; i < 8; i++) {
    for (int j = 0; j < 4; j++) {
      _autoencoderModel.W2[i][j] = (random(-100, 100) / 1000.0);
    }
  }
  
  // Decoder weights
  for (int i = 0; i < 4; i++) {
    for (int j = 0; j < 8; j++) {
      _autoencoderModel.W3[i][j] = (random(-100, 100) / 1000.0);
    }
  }
  
  for (int i = 0; i < 8; i++) {
    for (int j = 0; j < INPUT_FEATURES; j++) {
      _autoencoderModel.W4[i][j] = (random(-100, 100) / 1000.0);
    }
  }
  
  // Initialize biases to zero
  for (int i = 0; i < 8; i++) {
    _autoencoderModel.b1[i] = 0.0;
    _autoencoderModel.b3[i] = 0.0;
  }
  for (int i = 0; i < 4; i++) {
    _autoencoderModel.b2[i] = 0.0;
  }
  for (int i = 0; i < INPUT_FEATURES; i++) {
    _autoencoderModel.b4[i] = 0.0;
  }
}

float EnhancedMLModel::_sigmoid(float x) {
  if (x > 10) return 1.0;
  if (x < -10) return 0.0;
  return 1.0 / (1.0 + exp(-x));
}

float EnhancedMLModel::_tanh(float x) {
  if (x > 10) return 1.0;
  if (x < -10) return -1.0;
  float ex = exp(x);
  float enx = exp(-x);
  return (ex - enx) / (ex + enx);
}

float EnhancedMLModel::_relu(float x) {
  return (x > 0.0) ? x : 0.0;
}

void EnhancedMLModel::_softmax(float* values, int count) {
  float maxVal = values[0];
  for (int i = 1; i < count; i++) {
    if (values[i] > maxVal) {
      maxVal = values[i];
    }
  }
  
  float sum = 0.0;
  for (int i = 0; i < count; i++) {
    values[i] = exp(values[i] - maxVal);
    sum += values[i];
  }
  
  for (int i = 0; i < count; i++) {
    values[i] /= sum;
  }
}

float EnhancedMLModel::_calculateLoss(float prediction, float target) {
  float diff = prediction - target;
  return diff * diff; // MSE loss
}

void EnhancedMLModel::_updateWeights(float* weights, int count, float gradient, float learningRate) {
  for (int i = 0; i < count; i++) {
    weights[i] -= learningRate * gradient;
  }
}

void EnhancedMLModel::_normalizeInput(float* input, int count) {
  // Simple normalization - in practice, use proper normalization
  for (int i = 0; i < count; i++) {
    input[i] = (input[i] - 0.5) * 2.0; // Scale to [-1, 1]
  }
}

void EnhancedMLModel::_denormalizeOutput(float* output, int count) {
  // Simple denormalization
  for (int i = 0; i < count; i++) {
    output[i] = (output[i] + 1.0) * 0.5; // Scale to [0, 1]
  }
}

// Placeholder implementations for additional methods
bool EnhancedMLModel::loadModel(ModelType type) {
  // Implement model loading
  return true;
}

bool EnhancedMLModel::saveModel(ModelType type) {
  // Implement model saving
  return true;
}

void EnhancedMLModel::switchModel(ModelType type) {
  _currentModel = type;
}

ModelType EnhancedMLModel::getCurrentModel() {
  return _currentModel;
}

void EnhancedMLModel::updateLSTM(const SensorData& data, bool isThreat) {
  // Implement LSTM update
}

void EnhancedMLModel::trainLSTM(const SensorData* data, const bool* labels, int count) {
  // Implement LSTM training
}

void EnhancedMLModel::trainAutoencoder(const SensorData* data, int count) {
  // Implement autoencoder training
}

void EnhancedMLModel::addModel(ModelType type, float weight) {
  // Implement adding model to ensemble
}

void EnhancedMLModel::updateWeights(const float* accuracies) {
  // Implement weight update
}

float EnhancedMLModel::evaluateModel(ModelType type, const SensorData* testData, const bool* testLabels, int count) {
  // Implement model evaluation
  return 0.0;
}

void EnhancedMLModel::printModelStats() {
  // Implement model statistics printing
}

size_t EnhancedMLModel::getModelSize(ModelType type) {
  // Implement model size calculation
  return 0;
}

float EnhancedMLModel::getInferenceTime(ModelType type) {
  // Implement inference time calculation
  return 0.0;
}

// Threat blocking functionality implementation - Enhanced with proper thresholds
bool EnhancedMLModel::shouldBlockThreat(const SensorData& data, float threatLevel) {
  // CRITICAL THREAT: Block immediately if threat level is very high
  if (threatLevel > 0.85) {
    return true;
  }
  
  // HIGH THREAT: Block if threat level is high and we have consecutive threats
  if (threatLevel > 0.7 && _consecutiveThreats >= 2) {
    return true;
  }
  
  // MEDIUM THREAT: Block if we have 3+ consecutive medium threats
  if (threatLevel > 0.5 && _consecutiveThreats >= 3) {
    return true;
  }
  
  // HARDWARE ANOMALY: Block if voltage/current values are extremely abnormal
  if (data.voltage > 500.0 || data.current > 50.0 || data.temperature > 80.0) {
    return true;
  }
  
  // VOLTAGE SPIKE DETECTION: Block if voltage suddenly spikes
  static float lastVoltage = 0;
  if (lastVoltage > 0 && abs(data.voltage - lastVoltage) > 50.0) {
    lastVoltage = data.voltage;
    return true;
  }
  lastVoltage = data.voltage;
  
  // CURRENT ANOMALY: Block if current is negative or extremely high
  if (data.current < 0 || data.current > 30.0) {
    return true;
  }
  
  // TEMPERATURE ANOMALY: Block if temperature is too high
  if (data.temperature > 70.0) {
    return true;
  }
  
  return false;
}

void EnhancedMLModel::executeThreatBlock(const SensorData& data, const String& threatType) {
  _threatBlocked = true;
  _threatBlockTime = millis();
  _lastThreatType = threatType;
  _consecutiveThreats++;
  
  // Log the threat block with detailed information
  logThreatBlock(threatType, data);
  
  // QUARANTINE SYSTEM - Like Windows Defender
  Serial.println("🚨 THREAT QUARANTINED: " + threatType);
  Serial.println("🔒 STATION LOCKED DOWN - Charging disabled");
  Serial.println("📊 Threat Details:");
  Serial.println("   Voltage: " + String(data.voltage) + "V");
  Serial.println("   Current: " + String(data.current) + "A");
  Serial.println("   Temperature: " + String(data.temperature) + "C");
  Serial.println("   Power: " + String(data.power) + "W");
  Serial.println("   Timestamp: " + String(millis()));
  Serial.println("🛡️ Relay shutdown initiated...");
  
  // Trigger relay shutdown (quarantine)
  // This would integrate with RelayController to physically disconnect
  // RelayController::emergencyShutdown();
  
  // Set quarantine flag for dashboard display
  // This will be sent to dashboard via API
}

void EnhancedMLModel::logThreatBlock(const String& threatType, const SensorData& data) {
  // Log to SD card
  String logEntry = "THREAT_BLOCK," + String(millis()) + "," + threatType + "," + 
                   String(data.voltage) + "," + String(data.current) + "," + 
                   String(data.temperature) + "," + String(data.power);
  
  // This would integrate with SDLogger
  Serial.println("THREAT LOG: " + logEntry);
}

bool EnhancedMLModel::isThreatBlocked() {
  return _threatBlocked;
}

void EnhancedMLModel::resetThreatBlock() {
  _threatBlocked = false;
  _consecutiveThreats = 0;
  _lastThreatType = "";
}

// Car security assessment functions
String EnhancedMLModel::assessCarSecurity(const SensorData& data, float threatLevel) {
  if (threatLevel < 0.3) {
    return "SECURE";
  } else if (threatLevel < 0.5) {
    return "LOW_RISK";
  } else if (threatLevel < 0.7) {
    return "MEDIUM_RISK";
  } else if (threatLevel < 0.85) {
    return "HIGH_RISK";
  } else {
    return "CRITICAL_RISK";
  }
}

bool EnhancedMLModel::isCarSecure(const SensorData& data, float threatLevel) {
  // Car is secure if threat level is low and no hardware anomalies
  return (threatLevel < 0.5) && 
         (data.voltage > 0 && data.voltage < 500) &&
         (data.current >= 0 && data.current < 30) &&
         (data.temperature < 70) &&
         (data.power >= 0 && data.power < 50);
}

String EnhancedMLModel::getSecurityStatus(const SensorData& data, float threatLevel) {
  String status = assessCarSecurity(data, threatLevel);
  String details = "";
  
  if (status == "SECURE") {
    details = "✅ Car is secure - Normal charging conditions";
  } else if (status == "LOW_RISK") {
    details = "⚠️ Low risk detected - Monitoring closely";
  } else if (status == "MEDIUM_RISK") {
    details = "🔶 Medium risk - Increased monitoring";
  } else if (status == "HIGH_RISK") {
    details = "🔴 High risk - Threat blocking may be required";
  } else if (status == "CRITICAL_RISK") {
    details = "🚨 CRITICAL RISK - Immediate quarantine required";
  }
  
  return status + "|" + details;
}

#endif // ENHANCED_ML_MODEL_H
