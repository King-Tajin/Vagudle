import { Fragment } from "react";
import { Transition } from "@headlessui/react";
import classNames from "classnames";
import { useAlert } from "../context/alert-context";

type Props = {
  isOpen: boolean;
  message: string;
  variant?: "success" | "error";
};

const Alert = ({ isOpen, message, variant = "error" }: Props) => {
  const classes = classNames(
    "fixed z-[9999] left-1/2 transform -translate-x-1/2 w-auto max-w-[26rem] shadow-lg rounded-xl pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden",
    {
      "bg-rose-500 text-white": variant === "error",
      "bg-blue-500 text-white": variant === "success",
    }
  );

  return (
    <Transition
      show={isOpen}
      as={Fragment}
      enter="ease-out duration-300 transition"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div
        className={classes}
        style={{ top: "calc(3.5rem + env(safe-area-inset-top))" }}
      >
        <div className="px-4 py-3">
          <p className="text-lg leading-tight text-center font-medium">
            {message}
          </p>
        </div>
      </div>
    </Transition>
  );
};

export const AlertContainer = () => {
  const { message, status, isVisible } = useAlert();
  return (
    <>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {isVisible ? message : ""}
      </div>
      <Alert isOpen={isVisible} message={message || ""} variant={status} />
    </>
  );
};
