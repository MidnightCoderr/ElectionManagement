#ifndef BIOMETRIC_HANDLER_H
#define BIOMETRIC_HANDLER_H

#include <Adafruit_Fingerprint.h>
#include <HardwareSerial.h>
#include <SHA256.h>

class BiometricHandler {
private:
  Adafruit_Fingerprint *finger;
  HardwareSerial *serialPort;
  SHA256 sha256;

public:
  BiometricHandler(uint8_t rxPin, uint8_t txPin, uint32_t baudrate);
  ~BiometricHandler();

  bool begin();
  bool isConnected();
  String captureAndHash();
  uint8_t getImage();
  uint8_t convertImage();
  String getTemplateHash();
  void clearBuffer();

private:
  String bytesToHex(uint8_t *data, size_t length);
};

#endif // BIOMETRIC_HANDLER_H
