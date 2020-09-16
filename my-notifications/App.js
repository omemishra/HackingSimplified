import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  TextInput,
  ToastAndroid,
  Clipboard,
  StyleSheet,
} from "react-native";
import * as Notifications from "expo-notifications";
import * as Permissions from "expo-permissions";
import { create } from "apisauce";

function App() {
  const [token, setToken] = useState(false);
  const [serverValue, onChangeserverValue] = useState("");

  useEffect(() => {
    getToken();
  }, []);

  const getToken = async () => {
    const ans = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    const { status: existingStatus } = ans;
    let finalStatus = existingStatus;
    try {
      /* only ask if permissions have not already been determined, because
    iOS won't necessarily prompt the user a second time.*/
      if (existingStatus !== "granted") {
        /* Android remote notification permissions are granted during the app
      install, so this will only ask on iOS*/
        const { status } = await Permissions.askAsync(
          Permissions.NOTIFICATIONS
        );
        finalStatus = status;
      }
      /* Stop here if the user did not grant permissions*/
      /* if (finalStatus !== 'granted') {
      return;
    }*/
      let token;
      /* Get the token that uniquely identifies this device*/
      try {
        token = await Notifications.getExpoPushTokenAsync();
        setToken(token);
      } catch (err) {
        console.log(err);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const sendTokenToServer = async () => {
    const apiClient = create({
      baseURL: serverValue,
    });
    const response = await apiClient.post("/", { expo_token: token });

    if (response.ok) {
      ToastAndroid.show("Token sent to server", ToastAndroid.SHORT);
    } else {
      ToastAndroid.show(response.problem, ToastAndroid.SHORT);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        alignContent: "center",
        padding: 10,
      }}
    >
      <Text style={{ marginBottom: 10 }}>
        This is your expo token : {"\n\n" + token.data}
      </Text>
      <Button
        onPress={() => {
          Clipboard.setString(token);
          ToastAndroid.show("Token copied to clipboard", ToastAndroid.SHORT);
        }}
        title="Click to copy token to clipboard"
      />

      <TextInput
        placeholder="Enter server address to send the expo token to"
        value={serverValue}
        onChangeText={(text) => onChangeserverValue(text)}
        style={{ margin: 20 }}
      />
      <Button onPress={sendTokenToServer} title="Send to server" />
      <View style={styles.bottomView}>
        <Text style={styles.bottomView}>Made with ❤ in India 🌏</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomView: {
    alignItems: "center",
    position: "absolute", //Here is the trick
    bottom: 10, //Here is the trick
  },
});

export default App;
