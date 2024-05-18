import React from "react";
import { IoIosFolder, IoMdArrowDropdown } from "react-icons/io";
import { FaBoxArchive } from "react-icons/fa6";
import clsx from "clsx";

interface CollectionButtonProps {
  name: string;
  onMouseUp: () => void;
  isInputFieldOpen: boolean;
}

const CollectionButton: React.FC<CollectionButtonProps> = ({
  name,
  onMouseUp,
  isInputFieldOpen,
}) => {
  const buttonClasses = clsx(
    `
    flex
    w-full
    max-w-44
    max-h-8
    p-1
    rounded-md
    border
    border-transparent
    bg-zinc-900
    hover:bg-zinc-800
    ring-2
    ring-stone-700
    text-white
    text-sm
    overflow-hidden
    hover:text-orange-300
    transition
    duration-200`,
    isInputFieldOpen ? "opacity-0" : "opacity-100 z-10"
  );

  return (
    <button className={buttonClasses} onMouseUp={() => onMouseUp()}>
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center">
          {name === "Unsorted" ? (
            <FaBoxArchive className="mx-2" />
          ) : (
            <IoIosFolder className="mx-2" />
          )}
          <span className="text-start overflow-hidden text-nowrap">
            {name}
          </span>
        </div>
        <IoMdArrowDropdown className="mx-2" />
      </div>
    </button>
  );
};

export default CollectionButton;
