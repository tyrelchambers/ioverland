export const groupThemes = {
  blue: "blue",
  red: "red",
  green: "green",
  purple: "purple",
  orange: "orange",
  yellow: "yellow",
  default: "default",
} as const;

export type ThemeMap = {
  [key in keyof typeof groupThemes]: {
    gradientClass: string;
    color: string;
  };
};

export const themeMap: ThemeMap = {
  blue: {
    gradientClass: "gradient-blue",
    color: "#5a78d4",
  },
  red: {
    gradientClass: "gradient-red",
    color: "#8f3a3a",
  },
  green: {
    gradientClass: "gradient-green",
    color: "#0e3a0a",
  },
  purple: {
    gradientClass: "gradient-purple",
    color: "#6f3a8f",
  },
  orange: {
    gradientClass: "gradient-orange",
    color: "#bd914b",
  },
  yellow: {
    gradientClass: "gradient-yellow",
    color: "#bdbd4b",
  },
  default: {
    gradientClass: "gradient-default",
    color: "#3a8f8f",
  },
};

export const getTheme = (
  theme: keyof typeof groupThemes
): ThemeMap[keyof ThemeMap] => {
  return themeMap[theme];
};
