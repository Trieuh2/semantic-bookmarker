"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import Button from "../buttons/Button";
import clsx from "clsx";

interface ConfirmModalProps {
  title: string;
  description: string;
  isOpen: boolean;
  handleConfirmAction: () => void;
  handleCancelAction: () => void;
  danger?: boolean;
  children?: React.ReactNode;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  description,
  isOpen,
  handleConfirmAction,
  handleCancelAction,
  danger = false,
  children,
}) => {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        onClose={handleCancelAction}
        className="fixed inset-0 z-50 overflow-y-auto shadow-md"
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true"></div>
        </Transition.Child>

        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="fixed inset-0 flex items-center justify-center">
            <Dialog.Panel className="relative mx-auto rounded-md bg-zinc-800 p-5 w-96 border border-zinc-700">
              <Dialog.Title className="text-2xl text-stone-100">
                {title}
              </Dialog.Title>
              <Dialog.Description className="text-neutral-400">
                {description}
              </Dialog.Description>

              {children}

              <div className="mt-4 flex justify-between gap-4">
                <Button
                  onClick={handleConfirmAction}
                  classNames={
                    danger
                      ? "text-white bg-red-600 hover:bg-red-500 active:bg-red-600"
                      : "text-white bg-green-600 hover:bg-green-500 active:bg-green-600"
                  }
                >
                  Confirm
                </Button>
                <Button
                  onClick={handleCancelAction}
                  classNames="text-white bg-gray-600 hover:bg-gray-500 active:bg-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </Dialog.Panel>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};

export default ConfirmModal;
