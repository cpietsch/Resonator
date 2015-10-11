const int ledPin =  13;      // the number of the LED pin
const int ledRight = 3;
const int ledLeft = 2;

// Variables will change:
int ledState = LOW;             // ledState used to set the LED
long previousMillis = 0;        // will store last time LED was updated

// the follow variables is a long because the time, measured in miliseconds,
// will quickly become a bigger number than can be stored in an int.
           // interval at which to blink (milliseconds)
int alt = 0;
long binaural = 20;
long interval = (1000)/(binaural*2);
long curInterval = interval;

void setup() {
  // set the digital pin as output:
  pinMode(ledPin, OUTPUT); 
  pinMode(ledRight, OUTPUT); 
  pinMode(ledLeft, OUTPUT); 
  Serial.begin(115200);      
}



void loop()
{
  if (Serial.available() > 0) {
    binaural = Serial.parseInt();
    alt = Serial.parseInt();
    interval = (1000)/(binaural*2);
    if (Serial.read() == '\n') {
      
    }
  }
  
  
  unsigned long currentMillis = millis();
 
  if(currentMillis - previousMillis > interval) {
    previousMillis = currentMillis;   

    // if the LED is off turn it on and vice-versa:
    if (ledState == LOW)
      ledState = HIGH;
    else
      ledState = LOW;
    
    if (alt == 0){
      ledState = LOW;
    }
    // set the LED with the ledState of the variable:
    digitalWrite(ledPin, ledState);
    digitalWrite(ledRight, ledState);
    digitalWrite(ledLeft, ledState);
  }
}

