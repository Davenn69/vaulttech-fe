"use client";

import { Toaster, ToastPosition } from "react-hot-toast";

export type ToastProps = {
  position?: ToastPosition;
};

const Toast = ({ position = "bottom-right" }: ToastProps) => {
  return (
    <Toaster
      position={position}
      gutter={12}
      reverseOrder={false}
      containerStyle={{
        inset: 16,
      }}
      toastOptions={{
        duration: 3600,
        className:
          "rounded-2xl border border-white/10 bg-[#0f1726]/92 px-4 py-3 text-sm text-white shadow-[0_20px_60px_rgba(0,0,0,0.38)] backdrop-blur-xl",
        style: {
          maxWidth: "420px",
          padding: "14px 16px",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(15, 23, 38, 0.92)",
          color: "#eeeeee",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.38)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        },
        success: {
          style: {
            borderLeft: "4px solid #33c481",
          },
          iconTheme: {
            primary: "#08111f",
            secondary: "#33c481",
          },
        },
        error: {
          style: {
            borderLeft: "4px solid #ef5350",
          },
          iconTheme: {
            primary: "#08111f",
            secondary: "#ef5350",
          },
        },
      }}
    />
  );
};

export default Toast;
