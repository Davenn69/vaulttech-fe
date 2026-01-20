import localFont from "next/font/local";

export const font = localFont({
  src: [
    {
      path: "../../assets/fonts/Manrope-ExtraLight.ttf",
      weight: "300",
      style: "extralight",
    },
    {
      path: "../../assets/fonts/Manrope-Light.ttf",
      weight: "400",
      style: "light",
    },
    {
      path: "../../assets/fonts/Regular.ttf",
      weight: "500",
      style: "regular",
    },
    {
      path: "../../assets/fonts/Manrope-Medium.ttf",
      weight: "600",
      style: "medium",
    },
    {
      path: "../../assets/fonts/Manrope-SemiBold.ttf",
      weight: "700",
      style: "semibold",
    },
    {
      path: "../../assets/fonts/Manrope-Bold.ttf",
      weight: "800",
      style: "bold",
    },
    {
      path: "../../assets/fonts/Manrope-ExtraBold.ttf",
      weight: "900",
      style: "extrabold",
    },
  ],
  variable: "--font-manrope",
});
