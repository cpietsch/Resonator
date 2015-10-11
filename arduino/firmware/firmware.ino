#define rightEyeRed 7 // Define pinout for right eye
#define leftEyeRed 10 // Define pinout for left eye
#define led 13 // Define pinout for status

int waittime = 100;
int alt = 0;

void setup() {                
  pinMode(rightEyeRed, OUTPUT); // Pin output at rightEyeRed
  pinMode(leftEyeRed, OUTPUT); // Pin output at leftEyeRed 
  Serial.begin(115200);  
}

// the loop routine runs over and over again forever:
void loop() {
  if (Serial.available() > 0) {
    waittime = Serial.parseInt();
    alt = Serial.parseInt();
    if (Serial.read() == '\n') {
      Serial.println(waittime);
      Serial.println(alt);

    }
  }
  if(waittime==0){
    analogWrite(rightEyeRed, 0); 
    analogWrite(leftEyeRed, 0);
    analogWrite(led, 0);
    delay(100); 
  } else if(alt==0){ // normal blink
    analogWrite(rightEyeRed, 0); 
    analogWrite(leftEyeRed, 0); 
    analogWrite(led, 0);
    delay(waittime); 
  
    analogWrite(rightEyeRed, 255);
    analogWrite(leftEyeRed, 255);
    analogWrite(led, 255);
    delay(waittime); 
  } else if(alt==1) { //alt blink
    analogWrite(rightEyeRed, 0); 
    analogWrite(leftEyeRed, 255);
    analogWrite(led, 0);   
    delay(waittime);     
  
    analogWrite(rightEyeRed, 255); 
    analogWrite(leftEyeRed, 0); 
    analogWrite(led, 255);
    delay(waittime); 
  } else {
    analogWrite(rightEyeRed, 255); 
    analogWrite(leftEyeRed, 255);
    analogWrite(led, 255); 
  }
   
}
