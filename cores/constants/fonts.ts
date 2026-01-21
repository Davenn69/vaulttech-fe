import localFont from "next/font/local";

export const font = localFont({
  src: [
    {
      path: "../../assets/fonts/Manrope-ExtraLight.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../assets/fonts/Manrope-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../assets/fonts/Manrope-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../assets/fonts/Manrope-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../assets/fonts/Manrope-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../assets/fonts/Manrope-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../assets/fonts/Manrope-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-manrope",
});
