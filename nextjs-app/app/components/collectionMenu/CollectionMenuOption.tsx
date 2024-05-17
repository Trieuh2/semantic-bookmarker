import clsx from "clsx";
import React from "react";
import { FaBoxArchive } from "react-icons/fa6";
import { IoIosFolder, IoMdArrowDropdown } from "react-icons/io";

interface CollectionMenuOptionProps {
  name: string;
  onMouseUp: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

const CollectionMenuOption: React.FC<CollectionMenuOptionProps> = ({
  name,
  onMouseUp,
  isFirst = false,
  isLast = false,
}) => {
  const listItemClasses = clsx(
    `
    max-w-44
    p-1
    bg-zinc-900
    border
    border-transparent
    hover:cursor-pointer
    hover:bg-zinc-600
    text-white
    text-sm
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
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center text-orange-300">
            {name === "Unsorted" ? (
              <FaBoxArchive className="mx-2" />
            ) : (
              <IoIosFolder className="mx-2" />
            )}
            <span className="text-start text-ellipsis overflow-hidden text-nowrap">
              {name}
            </span>
          </div>
          <IoMdArrowDropdown className="mx-2 text-orange-300" />
        </div>
      ) : (
        <>{name}</>
      )}
    </li>
  );
};

export default CollectionMenuOption;
