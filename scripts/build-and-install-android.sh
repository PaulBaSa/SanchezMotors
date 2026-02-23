#!/bin/bash

# Build and install Android app
# Follows the same steps as GitHub Actions build-android.yml
# Usage: npm run build:android:debug [debug|release]
# Examples:
#   npm run build:android:debug debug      (default)
#   npm run build:android:debug release

set -e

# Get build type from parameter, default to debug
BUILD_TYPE="${1:-release}"

# Validate build type
if [[ "$BUILD_TYPE" != "debug" && "$BUILD_TYPE" != "release" ]]; then
  echo "Invalid build type: $BUILD_TYPE"
  echo "Usage: $0 [debug|release]"
  exit 1
fi

BUILD_TYPE_UPPER=$(echo "$BUILD_TYPE" | tr '[:lower:]' '[:upper:]')

echo "🏗️  SanchezMotors - Android $BUILD_TYPE_UPPER Build & Install"
echo "=============================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Install dependencies
echo -e "${YELLOW}Step 1: Installing dependencies...${NC}"
npm install --legacy-peer-deps

# Step 2: Generate native Android project
echo -e "${YELLOW}Step 2: Generating native Android project...${NC}"
npx expo prebuild --platform android --clean

# Add the ext block to build.gradle if it doesn't exist
if ! grep -q "minSdkVersion = findProperty" android/build.gradle; then
  # Create temporary file with ext block inserted before plugin declarations
  tmpfile=$(mktemp)

  awk '
    /^apply plugin: "expo-root-project"/ && !inserted {
      print "// Define Android SDK versions from gradle.properties"
      print "ext {"
      print "  minSdkVersion = findProperty(\"android.minSdkVersion\")?.toInteger() ?: 24"
      print "  compileSdkVersion = findProperty(\"android.compileSdkVersion\")?.toInteger() ?: 35"
      print "  targetSdkVersion = findProperty(\"android.targetSdkVersion\")?.toInteger() ?: 35"
      print "  ndkVersion = findProperty(\"android.ndkVersion\") ?: \"27.0.12077973\""
      print "  buildToolsVersion = findProperty(\"android.buildToolsVersion\") ?: \"35.0.0\""
      print "}"
      print ""
      inserted = 1
    }
    { print }
  ' android/build.gradle > "$tmpfile"

  mv "$tmpfile" android/build.gradle
fi


# Step 3: Check if adb is available
echo -e "${YELLOW}Step 3: Checking Android setup...${NC}"
if ! command -v adb &> /dev/null; then
  echo -e "${RED}❌ adb not found. Please ensure Android SDK is installed and adb is in your PATH.${NC}"
  exit 1
fi

# Step 4: Check if a device is connected
echo -e "${YELLOW}Step 4: Checking for connected devices...${NC}"
adb devices
echo ""

DEVICES=$(adb devices | grep -v "^$" | tail -n +2 | grep -v "^List" | awk '{print $1}' | grep -v "device")
DEVICE_COUNT=$(echo "$DEVICES" | grep -c . || echo 0)

if [ "$DEVICE_COUNT" -eq 0 ]; then
  echo -e "${RED}❌ No connected Android devices found.${NC}"
  echo -e "${YELLOW}Please:${NC}"
  echo "  1. Connect an Android device via USB"
  echo "  2. Enable USB debugging on your device"
  echo "  3. Run this script again"
  exit 1
fi

DEVICE_COUNT=$(echo "$DEVICES" | wc -l)
if [ "$DEVICE_COUNT" -gt 1 ]; then
  echo -e "${YELLOW}⚠️  Multiple devices found:${NC}"
  adb devices
  echo ""
  read -p "Using first device. Press Enter to continue or Ctrl+C to cancel."
fi

# Step 5: Build APK
echo -e "${YELLOW}Step 5: Building $BUILD_TYPE APK...${NC}"
cd android

# Pass Android SDK versions as Gradle properties to override rootProject.ext defaults
if [ "$BUILD_TYPE" = "debug" ]; then
  ./gradlew assembleDebug --stacktrace
  APK_OUTPUT_DIR="debug"
  APK_FILENAME="app-debug.apk"
else
  ./gradlew assembleRelease --stacktrace
  APK_OUTPUT_DIR="release"
  APK_FILENAME="app-release.apk"
fi

echo -e "${GREEN}✓ Build complete${NC}"

# Step 6: Install on device
echo -e "${YELLOW}Step 6: Installing on device...${NC}"

# Get the APK path
APK_PATH="app/build/outputs/apk/$APK_OUTPUT_DIR/$APK_FILENAME"

if [ ! -f "$APK_PATH" ]; then
  echo -e "${RED}❌ APK not found at expected path: $APK_PATH${NC}"
  echo -e "${RED}Available APK files:${NC}"
  find app/build/outputs -name "*.apk" 2>/dev/null || echo "No APKs found"
  exit 1
fi

echo -e "${YELLOW}APK Size: $(du -h "$APK_PATH" | cut -f1)${NC}"
adb install -r "$APK_PATH"

echo -e "${GREEN}✓ Installation complete!${NC}"
echo ""
echo -e "${GREEN}🎉 SanchezMotors ($BUILD_TYPE_UPPER) is ready to use on your device!${NC}"
