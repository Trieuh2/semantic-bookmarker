import React from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaBoxArchive } from "react-icons/fa6";

interface CollectionButtonProps {
  name: string;
  onMouseUp: () => void;
}

const CollectionButton: React.FC<CollectionButtonProps> = ({
  name,
  onMouseUp,
}) => {
  const buttonClasses = `
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
    transition
    ease-in-out
    duration-150
    `;

  const iconClasses = `
    self-center
    mx-2
  `;

  return (
    <button className={buttonClasses} onMouseUp={() => onMouseUp()}>
      <FaBoxArchive className={iconClasses} />
      {name}
      <IoMdArrowDropdown className={iconClasses} />
    </button>
  );
};

export default CollectionButton;
