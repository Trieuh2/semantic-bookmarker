import clsx from "clsx";
import React from "react";
import { FaBoxArchive } from "react-icons/fa6";
import { IoIosFolder, IoMdArrowDropdown } from "react-icons/io";

interface CollectionMenuOptionProps {
  name: string;
  onMouseUp: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  isCollectionMenuScrollable?: boolean;
}

const CollectionMenuOption: React.FC<CollectionMenuOptionProps> = ({
  name,
  onMouseUp,
  isFirst = false,
  isLast = false,
  isCollectionMenuScrollable = false,
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
    isFirst && isCollectionMenuScrollable && "rounded-tl-md",
    isFirst && !isCollectionMenuScrollable && "rounded-t-md",
    isLast && isCollectionMenuScrollable && "rounded-bl-md",
    isLast && !isCollectionMenuScrollable && "rounded-b-md"
  );

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
