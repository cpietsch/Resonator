#include <Adafruit_NeoPixel.h>
#include <avr/power.h> // Comment out this line for non-AVR boards (Arduino Due, etc.)

#define PIN 6


Adafruit_NeoPixel strip = Adafruit_NeoPixel(166, PIN, NEO_GRB + NEO_KHZ800);

int alt = 0;
long previousMillis = 0;
long interval = 1000;
int binaural = 1;
long lastInterval = interval;
int ledState = 0;


void setup() {                
 
  Serial.begin(115200);  

  strip.begin();
  for(uint16_t i=0; i<strip.numPixels(); i++) {
    strip.setPixelColor(i, strip.Color(255, 0, 0));
  }
  strip.show();
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

  if(lastInterval != interval){
    lastInterval = interval;
    changeRingColor();
  }
  
 
}

void changeRingColor(){

  uint32_t c = Wheel(binaural*4);
  
  for(uint16_t i=0; i<strip.numPixels(); i++) {
    strip.setPixelColor(i, c);
  }
  strip.show();
}

uint32_t Wheel(byte WheelPos) {
  WheelPos = 255 - WheelPos;
  if(WheelPos < 85) {
    return strip.Color(255 - WheelPos * 3, 0, WheelPos * 3);
  }
  if(WheelPos < 170) {
    WheelPos -= 85;
    return strip.Color(0, WheelPos * 3, 255 - WheelPos * 3);
  }
  WheelPos -= 170;
  return strip.Color(WheelPos * 3, 255 - WheelPos * 3, 0);
}
