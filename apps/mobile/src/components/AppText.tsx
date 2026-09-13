import { Text, type TextProps, type TextStyle } from "react-native";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";

type Weight = "regular" | "medium" | "bold";

interface AppTextProps extends TextProps {
  weight?: Weight;
  size?: number;
  color?: string;
  align?: TextStyle["textAlign"];
  direction?: "rtl" | "ltr"; // use "ltr" for signed numbers like "-45%"
}

export function AppText({
  weight = "regular",
  size = 14,
  color = colors.textPrimary,
  align = "right",
  direction = "rtl",
  style,
  ...rest
}: AppTextProps) {
  // `dir` is honored by react-native-web so mixed Arabic/number strings order correctly.
  const webProps = { dir: direction } as Record<string, string>;
  return (
    <Text
      {...webProps}
      style={[
        { fontFamily: fonts[weight], fontSize: size, color, textAlign: align, writingDirection: direction },
        style,
      ]}
      {...rest}
    />
  );
}
