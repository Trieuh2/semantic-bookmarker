"use client";

import React from "react";
import clsx from "clsx";
import { HiEllipsisHorizontal } from "react-icons/hi2";

interface OverflowMenuButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const OverflowMenuButton: React.FC<OverflowMenuButtonProps> = ({ onClick }) => {
  const buttonClasses = clsx(`
    flex
    grow-0
    shrink-0
    py-1
    px-2
    items-center
    justify-center
    text-center
    rounded-md
    hover:bg-neutral-500
    font-medium
    transition-colors
    duration-100
  `);

  return (
    <button
      className={buttonClasses}
      onMouseUp={onClick}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <HiEllipsisHorizontal />
    </button>
  );
};

export default OverflowMenuButton;
