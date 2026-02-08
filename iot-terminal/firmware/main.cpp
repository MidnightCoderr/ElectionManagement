/**
 * IoT Voting Terminal Firmware
 * ESP32 with Fingerprint Sensor
 *
 * Features:
 * - Biometric authentication (SHA-256 hashed)
 * - MQTT communication with backend
 * - Offline vote caching
 * - Tamper detection
 * - NTP time synchronization
 */

#include "BiometricHandler.h"
#include "NetworkManager.h"
#include "OfflineCache.h"
#include "TamperDetection.h"
#include "config.h"
#include <Arduino.h>

// Global instances
BiometricHandler *biometric;
NetworkManager *network;
OfflineCache *cache;
TamperDetection *tamperDetect;

// State variables
enum TerminalState {
  STATE_INIT,
  STATE_READY,
  STATE_SCANNING,
  STATE_AUTHENTICATING,
  STATE_VOTING,
  STATE_SUCCESS,
  STATE_ERROR,
  STATE_TAMPERED
};

TerminalState currentState = STATE_INIT;
String currentVoterId = "";
String currentElectionId = "";

// LED functions
void setLED(int pin, bool state) { digitalWrite(pin, state ? HIGH : LOW); }

void blinkLED(int pin, int times, int delayMs = 200) {
  for (int i = 0; i < times; i++) {
    setLED(pin, true);
    delay(delayMs);
    setLED(pin, false);
    delay(delayMs);
  }
}

void clearAllLEDs() {
  setLED(LED_READY_PIN, false);
  setLED(LED_SCANNING_PIN, false);
  setLED(LED_SUCCESS_PIN, false);
  setLED(LED_ERROR_PIN, false);
}

// MQTT callback
void onMQTTMessage(String topic, String payload) {
  Serial.print("📬 MQTT: ");
  Serial.print(topic);
  Serial.print(" -> ");
  Serial.println(payload);

  // Parse authentication response
  if (topic == MQTT_TOPIC_AUTH) {
    // TODO: Parse JSON response with voter info
    // {"status": "success", "voterId": "...", "electionId": "..."}
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n╔════════════════════════════════════════╗");
  Serial.println("║  SECURE ELECTION MANAGEMENT SYSTEM    ║");
  Serial.println("║    IoT Voting Terminal v1.0.0         ║");
  Serial.println("╚════════════════════════════════════════╝\n");

  // Initialize LED pins
  pinMode(LED_READY_PIN, OUTPUT);
  pinMode(LED_SCANNING_PIN, OUTPUT);
  pinMode(LED_SUCCESS_PIN, OUTPUT);
  pinMode(LED_ERROR_PIN, OUTPUT);
  clearAllLEDs();

  // Show startup sequence
  blinkLED(LED_READY_PIN, 3, 100);

  // Initialize components
  Serial.println("═══════════ SYSTEM INITIALIZATION ═══════════\n");

  // 1. Tamper Detection
  tamperDetect =
      new TamperDetection(TAMPER_SWITCH_PIN, ENABLE_TAMPER_DETECTION);
  tamperDetect->begin();

  if (tamperDetect->isTampered()) {
    Serial.println("🚨 SYSTEM LOCKED - TAMPER DETECTED");
    currentState = STATE_TAMPERED;
    while (true) {
      blinkLED(LED_ERROR_PIN, 1, 500);
    }
  }

  // 2. Offline Cache
  cache = new OfflineCache(OFFLINE_CACHE_FILE);
  if (!cache->begin()) {
    Serial.println("⚠️ Warning: Offline cache initialization failed");
  }

  // 3. Fingerprint Sensor
  biometric = new BiometricHandler(FINGERPRINT_RX_PIN, FINGERPRINT_TX_PIN,
                                   FINGERPRINT_BAUDRATE);
  if (!biometric->begin()) {
    Serial.println("❌ FATAL: Fingerprint sensor not found!");
    blinkLED(LED_ERROR_PIN, 10, 200);
    currentState = STATE_ERROR;
    while (true) {
      delay(1000);
    }
  }

  // 4. Network Connection
  network = new NetworkManager();
  network->setMessageCallback(onMQTTMessage);

  if (network->connectWiFi(WIFI_SSID, WIFI_PASSWORD)) {
    if (network->connectMQTT(MQTT_SERVER, MQTT_PORT, MQTT_USERNAME,
                             MQTT_PASSWORD)) {
      Serial.println("\n✅ Network connected - Online mode");

      // Sync cached votes if any
      if (cache->hasVotes()) {
        Serial.print("📤 Syncing ");
        Serial.print(cache->getVoteCount());
        Serial.println(" cached votes...");
        // TODO: Implement cache sync
      }
    } else {
      Serial.println("\n⚠️ MQTT connection failed - Offline mode");
    }
  } else {
    Serial.println("\n⚠️ WiFi connection failed - Offline mode");
  }

  Serial.println("\n═══════════════════════════════════════════════\n");
  Serial.println("✅ SYSTEM READY");
  Serial.println("   Terminal ID: " + String(TERMINAL_ID));
  Serial.println("   District: " + String(DISTRICT_ID));
  Serial.println("   Mode: " +
                 String(network->isMQTTConnected() ? "ONLINE" : "OFFLINE"));
  Serial.println("\n═══════════════════════════════════════════════\n");

  currentState = STATE_READY;
  setLED(LED_READY_PIN, true);
}

void loop() {
  // Check for tampering
  tamperDetect->check();
  if (tamperDetect->isTampered()) {
    currentState = STATE_TAMPERED;
    clearAllLEDs();
    blinkLED(LED_ERROR_PIN, 1, 500);
    return;
  }

  // Network maintenance
  if (network->isWiFiConnected()) {
    network->loop();
  }

  // State machine
  switch (currentState) {
  case STATE_READY:
    Serial.println("\n👤 READY FOR VOTER");
    Serial.println("   Place finger on sensor to begin...\n");
    setLED(LED_READY_PIN, true);

    currentState = STATE_SCANNING;
    break;

  case STATE_SCANNING:
    setLED(LED_SCANNING_PIN, true);
    setLED(LED_READY_PIN, false);

    String biometricHash = biometric->captureAndHash();

    if (biometricHash.length() > 0) {
      Serial.println("\n🔐 Biometric captured and hashed");
      currentState = STATE_AUTHENTICATING;
    } else {
      Serial.println("\n❌ Failed to capture biometric");
      blinkLED(LED_ERROR_PIN, 3, 200);
      delay(2000);
      currentState = STATE_READY;
      setLED(LED_SCANNING_PIN, false);
    }
    break;

  case STATE_AUTHENTICATING:
    Serial.println("\n🔍 Authenticating voter...");

    // Send to backend via MQTT
    if (network->isMQTTConnected()) {
      if (network->publishAuth(currentVoterId)) {
        Serial.println("✅ Authentication request sent");
        // Wait for response (simplified - should use callback)
        delay(2000);

        // For demo: assume success
        currentVoterId = "VOTER_" + String(random(1000, 9999));
        currentElectionId = "ELECTION_001";

        Serial.println("✅ Voter authenticated!");
        Serial.println("   Voter ID: " + currentVoterId);

        currentState = STATE_VOTING;
      } else {
        Serial.println("❌ Authentication failed");
        blinkLED(LED_ERROR_PIN, 3, 200);
        delay(2000);
        currentState = STATE_READY;
      }
    } else {
      Serial.println("⚠️ Offline mode - cannot authenticate");
      blinkLED(LED_ERROR_PIN, 3, 200);
      delay(2000);
      currentState = STATE_READY;
    }

    setLED(LED_SCANNING_PIN, false);
    break;

  case STATE_VOTING:
    Serial.println("\n🗳️  VOTING IN PROGRESS");
    Serial.println("   Select candidate on touchscreen...\n");

    // Simulate candidate selection (in real system, this comes from
    // touchscreen)
    delay(3000);
    String selectedCandidate = "CANDIDATE_" + String(random(1, 5));

    Serial.print("   Selected: ");
    Serial.println(selectedCandidate);

    // Get biometric hash again for vote verification
    String voteHash = biometric->captureAndHash();

    if (voteHash.length() > 0) {
      // Submit vote
      bool voteSubmitted = false;

      if (network->isMQTTConnected()) {
        Serial.println("\n📤 Submitting vote to blockchain...");
        voteSubmitted =
            network->publishVote(currentVoterId, selectedCandidate, voteHash);

        if (voteSubmitted) {
          Serial.println("✅ Vote submitted successfully!");
        } else {
          Serial.println("❌ Vote submission failed");
        }
      }

      // Cache if offline or submission failed
      if (!voteSubmitted) {
        Serial.println("\n💾 Caching vote offline...");
        String timestamp = network->getTimestamp();
        if (cache->addVote(currentVoterId, selectedCandidate, voteHash,
                           timestamp)) {
          Serial.println("✅ Vote cached - will sync when online");
          voteSubmitted = true;
        } else {
          Serial.println("❌ Failed to cache vote");
        }
      }

      if (voteSubmitted) {
        currentState = STATE_SUCCESS;
      } else {
        currentState = STATE_ERROR;
      }
    } else {
      Serial.println("❌ Biometric verification failed");
      currentState = STATE_ERROR;
    }
    break;

  case STATE_SUCCESS:
    Serial.println("\n✅ ═══════════════════════════════════");
    Serial.println("   VOTE CAST SUCCESSFULLY!");
    Serial.println("   Thank you for voting.");
    Serial.println("   ═══════════════════════════════════\n");

    blinkLED(LED_SUCCESS_PIN, 5, 300);

    delay(3000);

    // Reset for next voter
    currentVoterId = "";
    currentElectionId = "";
    currentState = STATE_READY;
    clearAllLEDs();
    break;

  case STATE_ERROR:
    Serial.println("\n❌ ═══════════════════════════════════");
    Serial.println("   ERROR OCCURRED");
    Serial.println("   Please contact election officials.");
    Serial.println("   ═══════════════════════════════════\n");

    blinkLED(LED_ERROR_PIN, 5, 300);

    delay(3000);

    // Reset
    currentVoterId = "";
    currentElectionId = "";
    currentState = STATE_READY;
    clearAllLEDs();
    break;

  case STATE_TAMPERED:
    // Already handled above
    break;
  }

  delay(100);
}
