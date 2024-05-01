import React from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaBoxArchive } from "react-icons/fa6";
import clsx from "clsx";
import { useBookmarks } from "../../../../../context/BookmarkContext";

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
  const { state } = useBookmarks();
  const buttonClasses = clsx(
    `
    flex
    text-start
    rounded-md
    p-1
    mx-2
    border
    border-transparent
    bg-zinc-900
    hover:bg-zinc-800
    hover:border-orange-300
    transition-opacity
    duration-75`,
    isInputFieldOpen ? "opacity-0" : "opacity-100 z-10",
    state.isLoading && "pointer-events-none opacity-25"
  );

  const iconClasses = `
    self-center
    mx-2`;
  return (
    <button
      className={buttonClasses}
      disabled={isInputFieldOpen || state.isLoading}
      onMouseUp={() => onMouseUp()}
    >
      <FaBoxArchive className={iconClasses} />
      {name}
      <IoMdArrowDropdown className={iconClasses} />
    </button>
  );
};

export default CollectionButton;
