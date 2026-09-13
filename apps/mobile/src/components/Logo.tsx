import { useId } from "react";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

// SVG ids are document-global on web. Several logos can be mounted at once (stack screens stay
// mounted but hidden), and url(#id) resolves to the first — possibly hidden — match, so each
// instance needs its own gradient id or the mark renders blank.
export function useSvgId(prefix: string) {
  return `${prefix}${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

// Approximation of the mockup's brand mark: a teal speech-bubble shield with a 3D white window.
export function LogoMark({ size = 64 }: { size?: number }) {
  const fillId = useSvgId("logoFill");
  return (
    <Svg width={size} height={size * 1.15} viewBox="0 0 100 115">
      <Defs>
        <LinearGradient id={fillId} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#23A58B" />
          <Stop offset="1" stopColor="#0A5E63" />
        </LinearGradient>
      </Defs>
      <Path
        d="M22 6 H78 L94 24 V74 Q94 84 84 84 H60 L50 108 L40 84 H16 Q6 84 6 74 V22 Q6 6 22 6 Z"
        fill={`url(#${fillId})`}
      />
      <Path d="M30 24 H64 L72 32 V66 H26 V28 Z" fill="#FFFFFF" />
      <Path d="M64 24 L72 32 V66 L62 58 V30 Z" fill="#0A4A55" opacity={0.55} />
    </Svg>
  );
}
