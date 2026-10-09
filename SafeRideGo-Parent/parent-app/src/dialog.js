import { Alert, Platform } from 'react-native';

// Alert.alert does not work in Chrome (web), so these helpers use window.alert / window.confirm there.
export const notify = (title, message) => {
  if (Platform.OS === 'web') window.alert(message ? `${title}\n${message}` : title);
  else Alert.alert(title, message);
};

export const confirmBox = (title, message, onYes, yesLabel = 'OK') => {
  if (Platform.OS === 'web') {
    if (window.confirm(message ? `${title}\n${message}` : title)) onYes();
  } else {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: yesLabel, style: 'destructive', onPress: onYes },
    ]);
  }
};
