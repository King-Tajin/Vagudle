import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Crown } from "lucide-react";

type Props = {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  handleClose: () => void;
};

export const BaseModal = ({ title, children, isOpen, handleClose }: Props) => {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-[60] inset-0 overflow-y-auto"
        onClose={handleClose}
      >
        <div className="flex items-center justify-center min-h-screen py-10 px-4 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay
              className="fixed inset-0 transition-opacity"
              style={{ background: "rgba(0,0,0,0.88)" }}
            />
          </Transition.Child>

          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-250"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div
              className="inline-block align-bottom text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full"
              style={{
                background: "#0a0014",
                border: "4px solid",
                borderImageSlice: 1,
                borderImageSource:
                  "linear-gradient(180deg, #5000aa 0%, #28007c 100%)",
              }}
            >
              <div
                className="flex items-center justify-between px-5 py-4 border-b-2 border-obsidian-700"
                style={{ background: "rgba(10,0,20,0.97)" }}
              >
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-crown-gold" />
                  <Dialog.Title
                    as="h3"
                    className="font-pixel text-sm text-crown-amber tracking-widest"
                  >
                    {title.toUpperCase()}
                  </Dialog.Title>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 bg-obsidian-700 hover:bg-obsidian-600 text-gray-400 hover:text-white transition-colors pixel-border-sm"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-5 py-5">{children}</div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
