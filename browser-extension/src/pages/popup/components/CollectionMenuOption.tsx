import clsx from "clsx";
import React from "react";
import { FaBoxArchive } from "react-icons/fa6";
import { IoMdArrowDropdown } from "react-icons/io";

interface CollectionMenuOption {
  name: string;
  onMouseUp: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

const CollectionMenuOption: React.FC<CollectionMenuOption> = ({
  name,
  onMouseUp,
  isFirst = false,
  isLast = false,
}) => {
  const listItemClasses = clsx(
    `
    p-1
    text-nowrap
    bg-zinc-900
    border
    border-transparent
    hover:cursor-pointer
    hover:bg-zinc-600
    transition
    ease-in-out
    `,
    isFirst && "rounded-t-md",
    isLast && "rounded-b-md"
  );

  const iconClasses = `
    self-center
    mx-2
  `;

  return (
    <li className={listItemClasses} onMouseUp={() => onMouseUp()}>
      {isFirst ? (
        <div className="flex">
          <FaBoxArchive className={iconClasses} />
          {name}
          <IoMdArrowDropdown className={iconClasses} />
        </div>
      ) : (
        <>{name}</>
      )}
    </li>
  );
};

export default CollectionMenuOption;
