unsigned char data;

void setup() {
  Serial.begin(115200);  //initial the Serial
}

void loop() 
{
  
  if (Serial.available())  
  {
    data = Serial.read();
    
    
    Serial.write(data);//send what has been received
   // Serial.println();
    
    if (data == 'a')
    {
      Serial.write(" Acknowledgement");
    }
    
    Serial.println();   //print line feed character
  }
}

