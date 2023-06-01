import "react-native-gesture-handler";
import { BarCodeScanner } from "expo-barcode-scanner";
import { StatusBar } from "expo-status-bar";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Linking,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { Updates } from "expo";
import BottomSheet, {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";

import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  const [scan, setScan] = useState(false);
  const [cameraType, setCameraType] = useState(true);
  const [cameraPermission, setCameraPermission] = useState();
  const [loading, setLoading] = useState(false);
  const [scanData, setScanData] = useState();
  const [dataType, setDataType] = useState();
  const [viewRowData, setViewRowData] = useState(false);

  const bottomSheetModalRef = useRef(null);

  const snapPoints = useMemo(() => ["50%", "80%"], []);

  const handleSheetChanges = useCallback((index) => {
    console.log("handleSheetChanges", index);
    if (index == -1) {
      setScan(false);
      setScanData();
      setDataType();
      setViewRowData(false);
    }
  }, []);

  const barcodeScan = ({ data }) => {
    setScan(true);
    handlePresentModalPress();

    setScanData(data);

    if (
      data.toLowerCase().startsWith("http") ||
      data.toLowerCase().startsWith("mailto:") ||
      data.toLowerCase().startsWith("tel:") ||
      data.toLowerCase().startsWith("smsto:")
    ) {
      setDataType("url");
    } else {
      setDataType("row");
    }
  };

  const closeApp = async () => {
    await Updates.reloadAsync(); // Reload the app to simulate close
  };

  const getBarCodeScannerPermissions = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    console.log("getBarCodeScannerPermissions-------------", status);

    if (status === "granted") {
      setCameraPermission(status);
    }

    if (status === "denied") {
      setCameraPermission(status);
      Alert.alert(
        "Open Settings",
        "Go to app settings and allow camera permission",
        [
          {
            text: "Close App",
            style: "cancel",
            onPress: () => closeApp(),
          },
          {
            text: "Open",
            onPress: () => Linking.openSettings(),
          },
        ]
      );
    }
    setLoading(false);
  };

  const handleClosePress = () => bottomSheetModalRef.current.close();

  const handleLinkPress = async (scanData) => {
    const supported = await Linking.canOpenURL(scanData);

    if (supported) {
      await Linking.openURL(scanData);
    } else {
      console.error("Cannot open URL:", scanData);
    }
  };

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  useEffect(() => {
    getBarCodeScannerPermissions();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView
          style={[
            styles.container,
            {
              justifyContent:
                cameraPermission != "granted" ? "center" : "flex-start",
              alignItems: cameraPermission != "granted" ? "center" : "stretch",
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator size="large" color="#ccdad1" />
          ) : (
            <>
              {cameraPermission != "granted" ? (
                <TouchableOpacity
                  style={styles.btnBackStyle}
                  onPress={() => {
                    getBarCodeScannerPermissions();
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: scale(20) }}>
                    Allow Camera Access
                  </Text>
                </TouchableOpacity>
              ) : (
                <>
                  <BarCodeScanner
                    style={{
                      height: moderateScale(505),
                      marginTop: verticalScale(20),
                    }}
                    type={cameraType ? "back" : "front"}
                    onBarCodeScanned={scan ? undefined : barcodeScan}
                  />

                  <View
                    style={{
                      flexDirection: "row",
                      // backgroundColor: "pink",
                      position: "absolute",
                      justifyContent: "space-between",
                      bottom: verticalScale(25),
                      paddingHorizontal: scale(10),
                      paddingVertical: verticalScale(10),
                      width: "100%",
                    }}
                  >
                    <TouchableOpacity
                      style={{ alignContent: "center", alignItems: "center" }}
                      onPress={() => {
                        setCameraType(!cameraType);
                      }}
                    >
                      <Image
                        source={require("./assets/cameraswitch_img.png")}
                        style={{ height: 50, width: 50, tintColor: "#fff" }}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{
                        alignContent: "center",
                        alignItems: "center",
                      }}
                      onPress={() => {
                        closeApp();
                      }}
                    >
                      <Image
                        source={require("./assets/close_img.png")}
                        style={{ height: 50, width: 50, tintColor: "#fff" }}
                      />
                    </TouchableOpacity>
                  </View>

                  <BottomSheetModal
                    ref={bottomSheetModalRef}
                    index={0}
                    snapPoints={snapPoints}
                    onChange={handleSheetChanges}
                    enableOverDrag={true}
                  >
                    <View style={styles.contentContainer}>
                      <TouchableOpacity
                        style={{ paddingHorizontal: 20, alignSelf: "flex-end" }}
                        onPress={() => {
                          handleClosePress();
                        }}
                      >
                        <Image
                          source={require("./assets/close_img.png")}
                          style={{ height: 30, width: 30, tintColor: "#000" }}
                        />
                      </TouchableOpacity>
                      <View
                        style={{ alignItems: "center", marginVertical: 10 }}
                      >
                        <Text
                          style={{
                            fontSize: 25,
                            color: "#000",
                            fontWeight: "bold",
                            marginBottom: 10,
                          }}
                        >
                          QR Data
                        </Text>

                        {dataType === "url" ? (
                          <TouchableOpacity
                            onPress={() => {
                              handleLinkPress(scanData);
                            }}
                          >
                            <Text
                              style={{
                                color: "blue",
                                fontSize: 20,
                                marginVertical: 20,
                              }}
                            >
                              {scanData}
                            </Text>
                          </TouchableOpacity>
                        ) : null}

                        {!viewRowData && dataType == "url" ? (
                          <TouchableOpacity
                            onPress={() => {
                              setViewRowData(true);
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 15,
                                color: "#000",
                                marginVertical: 20,
                              }}
                            >
                              View Row Data
                            </Text>
                          </TouchableOpacity>
                        ) : (
                          <Text
                            style={{
                              fontSize: 15,
                              color: "#000",
                              marginVertical: 20,
                            }}
                          >
                            Row Data : {scanData}
                          </Text>
                        )}
                      </View>
                    </View>
                  </BottomSheetModal>
                </>
              )}
            </>
          )}
        </SafeAreaView>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  btnBackStyle: {
    backgroundColor: "#2E2E2E",
    alignContent: "center",
    borderRadius: 10,
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(5),
  },
});
