/* File name: main.cpp
 *
 * Description: send data from esp8266 to Firebase and display to oled
 *
 *
 * Last Changed By:  $Author: Thang Nguyen$
 * Revision:         $Revision: $
 * Last Changed:     $Date: $Oct 11, 2024
 *
 ******************************************************************************/
/*                              INCLUDE FILES                                 */
/******************************************************************************/
#include <Arduino.h>
#include <ESP8266WiFi.h>
// #include <WiFi.h>
#include <Hash.h>
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <LittleFS.h>
#include <FS.h>
#include <Wire.h>
#include <Adafruit_MLX90614.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "MAX30105.h"
#include "spo2_algorithm.h"
#include <WiFiUdp.h>
#include <NTPClient.h>
// #include <FirebaseESP8266.h>
#include <Firebase_ESP_Client.h>

/******************************************************************************/
/*                     PRIVATE TYPES and DEFINITIONS                         */
/******************************************************************************/
// định nghĩa các chân I2C
#define SDA_PIN 4        // D2
#define SCL_PIN 5        // D1
#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 64 // OLED display height, in pixels

// Declaration for an SSD1306 display connected to I2C (SDA, SCL pins)
#define OLED_RESET -1 // Reset pin # (or -1 if sharing Arduino reset pin)

// Khai báo SSID và mật khẩu cho chế độ AP
const char *ssid = "PTIT.HCM_CanBo";
const char *password = ""; // Đảm bảo mật khẩu có ít nhất 8 ký tự
// Khai báo Firebase
#define FIREBASE_HOST "https://tkt1-15e2-default-rtdb.firebaseio.com/" 
#define FIREBASE_AUTH "aNjO01miLRKcv88d1bheYWArXunrqo1b1LVmRiqo"       
// Thông tin Firebase
#define API_KEY "AIzaSyCo8OPFkNwVBfNjs6uCNac5GqOeuG83_I0"
#define DATABASE_URL "https://tkt1-15e42-default-rtdb.firebaseio.com/"
/******************************************************************************/
/*                     EXPORTED TYPES and DEFINITIONS                         */
/******************************************************************************/

/******************************************************************************/
/*                              PRIVATE DATA                                  */
/******************************************************************************/
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
Adafruit_MLX90614 mlx = Adafruit_MLX90614();
MAX30105 particleSensor;
// FirebaseData firebaseData;
// Đối tượng Firebase
FirebaseData firebaseData;
FirebaseAuth auth;
FirebaseConfig config;
// thời gian thực
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 25200); // UTC+7 time offset (7*3600 = 25200 seconds)
String weekDays[7] = {"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"};
String months[12] = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
unsigned long sendDataPrevMillis = 0;
int interval = 500;
int dataState = 0; // Trạng thái dữ liệu để gửi
bool signupOK = false;

uint32_t irBuffer[100];  // dữ liệu cảm biến LED hồng ngoại
uint32_t redBuffer[100]; // dữ liệu cảm biến LED đỏ

int32_t bufferLength;  // độ dài dữ liệu
int32_t spo2;          // giá trị SpO2
int8_t validSPO2;      // chỉ báo cho biết phép tính SpO2 có hợp lệ không
int32_t heartRate;     // giá trị nhịp tim
int8_t validHeartRate; // chỉ báo cho biết phép tính nhịp tim có hợp lệ không
/******************************************************************************/
/*                              EXPORTED DATA                                 */
/******************************************************************************/

/******************************************************************************/
/*                            PRIVATE FUNCTIONS                               */
/******************************************************************************/
String readMLXTempBody(bool sendToFb);
// Đọc 100 mẫu đầu tiên, và xác định phạm vi tín hiệu
void readSamples();
// Tính toán nhịp tim và SpO2 sau 100 mẫu đầu tiên (4 giây đầu tiên của mẫu)
void calculateHeartRateAndSpO2();
// Xóa 25 bộ mẫu đầu tiên trong bộ nhớ và dịch 75 bộ mẫu cuối cùng lên trên
void shiftSamples();
// Lấy 25 bộ mẫu trước khi tính toán nhịp tim
void readNewSamples();
// Hiển thị thông tin lên màn hình OLED
void displayInfo();
void getHeartRateAndSpO2(int32_t *heartRate, int32_t *spo2, int8_t *validHeartRate, int8_t *validSPO2);
void heartRateAndSpO2(bool sendToFb, int32_t &resSpo2, int32_t &resHeartRate);

/******************************************************************************/

void setup()
{
    // Cổng Serial để debug
    Serial.begin(115200);
    // Khởi tạo I2C cho ESP8266 D1 Mini
    Wire.begin(SDA_PIN, SCL_PIN);
    // Connect to Wi-Fi
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(1000);
        Serial.println("Connecting to WiFi..");
    }
    Serial.println(WiFi.localIP());
    // // Thiết lập ESP8266 ở chế độ Access Point
    // WiFi.softAP(ssid, password);

    // // In địa chỉ IP của ESP8266 khi ở chế độ Access Point
    // Serial.print("AP IP address: ");
    // Serial.println(WiFi.softAPIP());

    // Khởi tạo cảm biến MLX90614
    if (!mlx.begin())
    {
        Serial.println("Error connecting to MLX90614 sensor. Check your wiring!");
        while (1)
            ;
        delay(500);
    }
    // Initialize the OLED display
    if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C))
    {
        Serial.println(F("SSD1306 allocation failed"));
        for (;;)
            ; // Don't proceed, loop forever
    }
    // Initialize the MAX30105 sensor
    if (!particleSensor.begin(Wire, I2C_SPEED_FAST))
    {
        Serial.println(F("MAX30105 not found. Check your wiring/power."));
        while (1)
            ;
    }
    // Cấu hình Firebase
    config.api_key = API_KEY;
    config.database_url = DATABASE_URL;

    // Đăng ký
    if (Firebase.signUp(&config, &auth, "", ""))
    {
        Serial.println("Signup successful");
        signupOK = true;
    }
    else
    {
        Serial.printf("Signup failed: %s\n", config.signer.signupError.message.c_str());
    }
    // Bắt đầu Firebase
    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);
    byte ledBrightness = 60; // Tùy chọn: 0=Off đến 255=50mA
    byte sampleAverage = 4;  // Tùy chọn: 1, 2, 4, 8, 16, 32
    byte ledMode = 2;        // Tùy chọn: 1 = Chỉ đỏ, 2 = Đỏ + IR, 3 = Đỏ + IR + Xanh
    byte sampleRate = 100;   // Tùy chọn: 50, 100, 200, 400, 800, 1000, 1600, 3200
    int pulseWidth = 411;    // Tùy chọn: 69, 118, 215, 411
    int adcRange = 4096;     // Tùy chọn: 2048, 4096, 8192, 16384
    particleSensor.setup(ledBrightness, sampleAverage, ledMode, sampleRate, pulseWidth, adcRange);
    // Clear the buffer
    // display.clearDisplay();
    // display.display();

    // Khởi tạo LittleFS
    if (!LittleFS.begin())
    {
        Serial.println("An Error has occurred while mounting LittleFS");
        return;
    }
    timeClient.begin();
}
void loop()
{
    int32_t resSpo2, resHeartRate;
    if (Firebase.ready() && signupOK && (millis() - sendDataPrevMillis > interval || sendDataPrevMillis == 0))
    {
        sendDataPrevMillis = millis();
        // Gọi hàm để đọc và gửi nhiệt độ
        readMLXTempBody(true);
        heartRateAndSpO2(true, resSpo2, resHeartRate);

    }
    displayInfo();
}

void heartRateAndSpO2(bool sendToFb, int32_t &resSpo2, int32_t &resHeartRate)
{
    bufferLength = 100; // độ dài bộ đệm 100 lưu trữ 4 giây mẫu chạy ở 25sps

    // Đọc 100 mẫu đầu tiên, và xác định phạm vi tín hiệu
    readSamples();
    // Tính toán nhịp tim và SpO2 sau 100 mẫu đầu tiên (4 giây đầu tiên của mẫu)
    calculateHeartRateAndSpO2();

    // Liên tục lấy mẫu từ MAX30102. Nhịp tim và SpO2 được tính toán mỗi giây
    // Xóa 25 bộ mẫu đầu tiên trong bộ nhớ và dịch 75 bộ mẫu cuối cùng lên trên
    shiftSamples();
    // Lấy 25 bộ mẫu trước khi tính toán nhịp tim
    readNewSamples();
    // Tính toán nhịp tim và SpO2
    calculateHeartRateAndSpO2();
    resSpo2 = spo2;
    resHeartRate = heartRate;
    // gửi nhịp tim lên firebase
    if (sendToFb)
    {
        if (Firebase.RTDB.setFloat(&firebaseData, "sensor/heartRate", heartRate))
        {
            Serial.println("Heart Rate sent to Firebase: " + String(heartRate));
        }
        else
        {
            Serial.println("Failed to send Heart Rate to Firebase");
            Serial.println("REASON: " + firebaseData.errorReason());
        }
        // gửi spO2 lên firebase
        if (Firebase.RTDB.setFloat(&firebaseData, "sensor/spO2", spo2))
        {
            Serial.println("SpO2 sent to Firebase: " + String(spo2));
        }
        else
        {
            Serial.println("Failed to send SpO2 to Firebase");
            Serial.println("REASON: " + firebaseData.errorReason());
        }
    }
    delay(0);
}
String readMLXTempBody(bool sendToFb)
{
    // Đọc nhiệt độ của vật thể từ cảm biến MLX90614
    float objectTempC = mlx.readObjectTempC();
    if (isnan(objectTempC))
    {
        Serial.println("Failed to read from MLX90614 sensor!");
        return "";
    }
    else
    {
        if (sendToFb)
        {
            // Gửi dữ liệu lên Firebase
            if (Firebase.RTDB.setFloat(&firebaseData, "sensor/objectTemp", objectTempC))
            {
                Serial.println("objectTemp sent to Firebase: " + String(objectTempC));
            }
            else
            {
                Serial.println("Failed to send temperature to Firebase");
                Serial.println("REASON: " + firebaseData.errorReason());
            }
        }
        return String(objectTempC);
    }
}
// Hàm lấy thông tin nhịp tim và SpO2
void getHeartRateAndSpO2(int32_t *heartRate, int32_t *spo2, int8_t *validHeartRate, int8_t *validSPO2)
{
    // Đọc 100 mẫu đầu tiên
    for (byte i = 0; i < bufferLength; i++)
    {
        while (!particleSensor.available())
        {                           // Kiểm tra có dữ liệu mới không?
            particleSensor.check(); // Kiểm tra cảm biến xem có dữ liệu mới không
        }

        redBuffer[i] = particleSensor.getRed();
        irBuffer[i] = particleSensor.getIR();
        particleSensor.nextSample(); // Chuyển đến mẫu tiếp theo
    }

    // Tính toán nhịp tim và SpO2 sau khi đã đọc 100 mẫu đầu tiên
    maxim_heart_rate_and_oxygen_saturation(irBuffer, bufferLength, redBuffer, spo2, validSPO2, heartRate, validHeartRate);
}

void readSamples()
{
    for (byte i = 0; i < bufferLength; i++)
    {
        while (particleSensor.available() == false) // có dữ liệu mới không?
            particleSensor.check();                 // Kiểm tra cảm biến xem có dữ liệu mới không

        redBuffer[i] = particleSensor.getRed();
        irBuffer[i] = particleSensor.getIR();
        particleSensor.nextSample(); // Chúng tôi đã xong với mẫu này, vì vậy chuyển đến mẫu tiếp theo
    }
}

void calculateHeartRateAndSpO2()
{
    maxim_heart_rate_and_oxygen_saturation(irBuffer, bufferLength, redBuffer, &spo2, &validSPO2, &heartRate, &validHeartRate);
}

void shiftSamples()
{
    for (byte i = 25; i < 100; i++)
    {
        redBuffer[i - 25] = redBuffer[i];
        irBuffer[i - 25] = irBuffer[i];
        delay(0);
    }
}

void readNewSamples()
{
    for (byte i = 75; i < 100; i++)
    {
        while (particleSensor.available() == false) // có dữ liệu mới không?
            particleSensor.check();                 // Kiểm tra cảm biến xem có dữ liệu mới không

        redBuffer[i] = particleSensor.getRed();
        irBuffer[i] = particleSensor.getIR();
        particleSensor.nextSample(); // Chúng tôi đã xong với mẫu này, vì vậy chuyển đến mẫu tiếp theo
    }
}
void displayInfo()
{
    String bodyTemp = readMLXTempBody(false);
    int32_t resSpo2, resHeartRate;
    heartRateAndSpO2(false, resSpo2, resHeartRate);
    delay(1000);
    display.clearDisplay();

    // display.display();
    timeClient.update();
    // Get current time
    int currentHour = timeClient.getHours();
    int currentMinute = timeClient.getMinutes();

    String am_pm = (currentHour < 12) ? "AM" : "PM";

    if (currentHour == 0)
    {
        currentHour = 12; // 12 AM
    }
    else if (currentHour > 12)
    {
        currentHour -= 12; // Convert to 12-hour format
    }

    // Format the time as "9:08 AM"
    String timeStr = String(currentHour) + ":" + (currentMinute < 10 ? "0" : "") + String(currentMinute) + " " + am_pm;
    display.setTextSize(2);
    display.clearDisplay();
    display.setCursor(20, 20);
    display.print(timeStr);

    // Get current date
    String weekDay = weekDays[timeClient.getDay()];
    time_t epochTime = timeClient.getEpochTime();
    struct tm *ptm = gmtime(&epochTime);
    int monthDay = ptm->tm_mday;
    int currentMonth = ptm->tm_mon + 1; // Month is 0-based
    String currentMonthName = months[currentMonth - 1];
    int currentYear = ptm->tm_year + 1900; // Year since 1900

    // Format the date string
    String dateStr = String(weekDay) + ", " + String(monthDay) + "-" + String(currentMonthName);

    // Calculate width of the date text for centering
    display.setTextSize(1);    // Smaller size for date
    display.setCursor(20, 40); // Center horizontally, adjust Y as needed
    display.println(dateStr);
    display.setTextSize(1);
    display.setTextColor(WHITE);

    // Hiển thị dữ liệu lên màn hình OLED
    display.setCursor(0, 0);
    display.print("Bpm: " + String(resHeartRate));
    display.setCursor(0, 10);
    display.print("SpO2: " + String(resSpo2));
    display.setCursor(60, 0);
    display.print("T*: " + String(bodyTemp));
    // thiết kế
    display.setCursor(35, 55);
    display.print(F("Designed by TKT"));
    display.display();
    delay(1000);
}