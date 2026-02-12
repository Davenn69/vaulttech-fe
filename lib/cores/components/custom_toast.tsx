import { Toaster, ToastPosition } from "react-hot-toast";

export type ToastProps = {
  position?: ToastPosition;
};

const Toast = ({ position = "bottom-right" }: ToastProps) => {
  return (
    <Toaster
      position={position}
      toastOptions={{
        icon: null,
        error: {
          style: {
            background: "#ef5350",
            color: "#eeeeee",
          },
        },
      }}
    />
  );
};

export default Toast;
