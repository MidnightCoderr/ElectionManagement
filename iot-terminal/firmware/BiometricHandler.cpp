#include "BiometricHandler.h"
#include "config.h"

BiometricHandler::BiometricHandler(uint8_t rxPin, uint8_t txPin,
                                   uint32_t baudrate) {
  serialPort = new HardwareSerial(2);
  serialPort->begin(baudrate, SERIAL_8N1, rxPin, txPin);
  finger = new Adafruit_Fingerprint(serialPort, FINGERPRINT_PASSWORD);
}

BiometricHandler::~BiometricHandler() {
  delete finger;
  delete serialPort;
}

bool BiometricHandler::begin() {
  Serial.println("🔍 Initializing fingerprint sensor...");

  if (finger->verifyPassword()) {
    Serial.println("✅ Fingerprint sensor connected!");
    Serial.print("   Sensor contains ");
    Serial.print(finger->templateCount);
    Serial.println(" templates");
    return true;
  } else {
    Serial.println("❌ Fingerprint sensor not found!");
    return false;
  }
}

bool BiometricHandler::isConnected() { return finger->verifyPassword(); }

/**
 * Capture fingerprint and return SHA-256 hash
 */
String BiometricHandler::captureAndHash() {
  Serial.println("\n👆 Place finger on sensor...");

  // Wait for finger
  uint8_t p = -1;
  unsigned long startTime = millis();

  while (p != FINGERPRINT_OK) {
    p = finger->getImage();

    if (millis() - startTime > FINGERPRINT_TIMEOUT_MS) {
      Serial.println("⏱️ Timeout waiting for finger");
      return "";
    }

    if (p == FINGERPRINT_NOFINGER) {
      delay(50);
      continue;
    } else if (p == FINGERPRINT_OK) {
      Serial.println("✅ Image captured");
      break;
    } else {
      Serial.print("❌ Error capturing image: ");
      Serial.println(p);
      return "";
    }
  }

  // Convert image to template
  p = finger->image2Tz();
  if (p != FINGERPRINT_OK) {
    Serial.print("❌ Error converting image: ");
    Serial.println(p);
    return "";
  }

  Serial.println("✅ Image converted to template");

  // Get template hash
  return getTemplateHash();
}

uint8_t BiometricHandler::getImage() { return finger->getImage(); }

uint8_t BiometricHandler::convertImage() { return finger->image2Tz(); }

/**
 * Get SHA-256 hash of fingerprint template
 * This ensures no raw biometric data is stored
 */
String BiometricHandler::getTemplateHash() {
  uint8_t templateBuffer[512];
  uint16_t templateLength = 512;

  // Download template from buffer 1
  uint8_t p = finger->getModel();
  if (p != FINGERPRINT_OK) {
    Serial.print("❌ Error getting template model: ");
    Serial.println(p);
    return "";
  }

  p = finger->downloadModel(1, templateBuffer, &templateLength);
  if (p != FINGERPRINT_OK) {
    Serial.print("❌ Error downloading template: ");
    Serial.println(p);
    return "";
  }

  Serial.print("Template length: ");
  Serial.println(templateLength);

  // Hash the template using SHA-256
  sha256.reset();
  sha256.update(templateBuffer, templateLength);

  uint8_t hash[32];
  sha256.finalize(hash, 32);

  // Convert hash to hex string
  String hashString = bytesToHex(hash, 32);

  Serial.print("🔐 SHA-256 Hash: ");
  Serial.println(hashString);

  return hashString;
}

void BiometricHandler::clearBuffer() { finger->emptyDatabase(); }

/**
 * Convert byte array to hex string
 */
String BiometricHandler::bytesToHex(uint8_t *data, size_t length) {
  String hexString = "";
  for (size_t i = 0; i < length; i++) {
    if (data[i] < 0x10) {
      hexString += "0";
    }
    hexString += String(data[i], HEX);
  }
  hexString.toLowerCase();
  return hexString;
}
