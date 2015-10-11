#define rightEyeRed 7 // Define pinout for right eye
#define leftEyeRed 10 // Define pinout for left eye
#define led 13 // Define pinout for status

int alt = 0;
long previousMillis = 0;
long interval = 1000;
int ledState = LOW;
int binaural = 1;

void setup() {                
  pinMode(rightEyeRed, OUTPUT); // Pin output at rightEyeRed
  pinMode(leftEyeRed, OUTPUT); // Pin output at leftEyeRed 
  pinMode(led, OUTPUT);
  Serial.begin(115200);  
}

// the loop routine runs over and over again forever:
void loop() {
 
  if (Serial.available() > 0) {
    binaural = Serial.parseInt();
    interval = 1000 / (binaural*2);
    alt = Serial.parseInt();
    if (Serial.read() == '\n') {
      //Serial.println(interval);
      //Serial.println(alt);
    }
  }
 
  unsigned long currentMillis = millis();
  
  if(currentMillis - previousMillis > interval) {
    previousMillis = currentMillis;
    
    if (ledState == LOW)
      ledState = HIGH;
    else
      ledState = LOW;

   analogWrite(rightEyeRed, ledState); 
   analogWrite(leftEyeRed, ledState);
   analogWrite(led, ledState);
  
  }
 
}
