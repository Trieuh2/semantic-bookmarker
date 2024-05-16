"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import Button from "../buttons/Button";

interface ConfirmModalProps {
  title: string;
  description: string;
  isOpen: boolean;
  handleConfirmAction: () => void;
  handleCancelAction: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  description,
  isOpen,
  handleConfirmAction,
  handleCancelAction,
}) => {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={() => {}}>
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
            <Dialog.Panel className="relative mx-auto rounded bg-zinc-800 p-4 w-96">
              <Dialog.Title className="text-2xl text-stone-100">
                {title}
              </Dialog.Title>
              <Dialog.Description className="text-neutral-400">
                {description}
              </Dialog.Description>

              <div className="mt-4 flex justify-between gap-4">
                <Button
                  onClick={handleConfirmAction}
                  classNames="bg-red-500 hover:bg-red-400 active:bg-red-500"
                >
                  Confirm
                </Button>
                <Button
                  onClick={handleCancelAction}
                  classNames="bg-gray-500 hover:bg-gray-400 active:bg-gray-500"
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
