import { forwardRef, useState } from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";
import { s } from "../theme/spacing";
import { type } from "../theme/typography";
import { useTheme } from "../theme/ThemeProvider";

type Props = TextInputProps & {
  label?: string;
  error?: string;
  secureToggle?: boolean;
};

const TextField = forwardRef<TextInput, Props>(({ label, error, secureTextEntry, secureToggle, onFocus, onBlur, ...rest }, ref) => {
  const { theme } = useTheme();
  const [hidden, setHidden] = useState(!!secureTextEntry);
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ width: "100%", marginBottom: s.lg }}>
      {!!label && <Text style={{ color: theme.textSecondary, marginBottom: 8, ...type.label }}>{label}</Text>}

      <View
        style={{
          backgroundColor: theme.inputBg,
          borderWidth: 1,
          borderColor: error ? theme.error : focused ? theme.accent : theme.inputBorder,
          borderRadius: 14,
          height: 52,
          paddingHorizontal: s.lg,
          alignItems: "center",
          flexDirection: "row"
        }}
      >
        <TextInput
          ref={ref}
          placeholderTextColor={theme.inputPlaceholder}
          secureTextEntry={hidden}
          style={{ flex: 1, color: theme.textPrimary, ...type.body }}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {secureToggle && (
          <Text onPress={() => setHidden((v) => !v)} style={{ color: theme.accent, ...type.label }}>
            {hidden ? "Show" : "Hide"}
          </Text>
        )}
      </View>

      {!!error && <Text style={{ color: theme.error, marginTop: 6, ...type.small }}>{error}</Text>}
    </View>
  );
});
TextField.displayName = "TextField";
export default TextField;
