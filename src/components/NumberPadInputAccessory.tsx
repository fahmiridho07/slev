import React, { memo } from "react";
import { InputAccessoryView, Keyboard, Platform, Pressable, Text, View } from "react-native";
import { useTheme } from "../hooks/useTheme";

export const NUMBER_PAD_INPUT_ACCESSORY_ID = "slev-number-pad";

export const numberPadInputAccessoryProps =
  Platform.OS === "ios" ? { inputAccessoryViewID: NUMBER_PAD_INPUT_ACCESSORY_ID } : {};

function NumberPadInputAccessoryComponent() {
  const { componentStyles, strings } = useTheme();

  if (Platform.OS !== "ios") {
    return null;
  }

  return (
    <InputAccessoryView nativeID={NUMBER_PAD_INPUT_ACCESSORY_ID}>
      <View style={componentStyles.numberPadAccessoryBar}>
        <Pressable
          accessibilityLabel={strings.common.done}
          accessibilityRole="button"
          onPress={() => Keyboard.dismiss()}
          style={componentStyles.numberPadAccessoryDoneButton}
        >
          <Text style={componentStyles.numberPadAccessoryDoneText}>{strings.common.done}</Text>
        </Pressable>
      </View>
    </InputAccessoryView>
  );
}

export const NumberPadInputAccessory = memo(NumberPadInputAccessoryComponent);