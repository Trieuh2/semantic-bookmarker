import clsx from "clsx";
import React, { useState } from "react";
import { HiMiniHashtag, HiXMark } from "react-icons/hi2";

interface TagButtonProps {
  name: string;
  onClick: (name: string) => void;
}

const TagButton: React.FC<TagButtonProps> = ({ name, onClick }) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const buttonClasses = clsx(
    `
    px-1
    py-0.5
    rounded-md
    border
    border-orange-300
    text-xs
    text-left
    text-center
    text-orange-300
    text-ellipsis
    hover:border-red-500
    hover:text-red-500
    transition-colors
    duration-150
    flex
    items-center`
  );

  const divClasses = "h-full inline-flex justify-end items-center";

  return (
    <button
      className={buttonClasses}
      onMouseUp={() => onClick(name)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={divClasses}>
        {isHovered ? <HiXMark /> : <HiMiniHashtag />}
      </div>
      <span>{name}</span>
    </button>
  );
};

export default TagButton;
