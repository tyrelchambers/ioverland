export const Themes = [
  "blue",
  "red",
  "green",
  "purple",
  "orange",
  "yellow",
  "default",
] as const;
type ThemeMap = {
  [key in (typeof Themes)[number]]: {
    gradientClass: string;
    color: string;
  };
};

const themeMap: ThemeMap = {
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

export const getTheme = (theme: (typeof Themes)[number]) => {
  return themeMap[theme];
};
