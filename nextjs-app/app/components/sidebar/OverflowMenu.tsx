"use client";

import clsx from "clsx";
import React, { ForwardedRef, forwardRef } from "react";

interface OverflowOption {
  label: string;
  action: () => void;
}

interface OverflowMenuProps {
  isOpen: boolean;
  closeMenu: () => void;
  menuOptions: OverflowOption[];
}

const OverflowMenu = forwardRef<HTMLDivElement, OverflowMenuProps>(
  ({ isOpen, closeMenu, menuOptions }, ref: ForwardedRef<HTMLDivElement>) => {
    const divClasses = clsx(
      `
      z-50
      absolute
      right-0
      top-full
      rounded-md
      bg-stone-800
      border
      border-stone-700
      shadow-md
      transition-opacity
      duration-300
      ease-in-out`,
      isOpen ? "opacity-100" : "opacity-0"
    );
    const listItemClasses = `
      px-4
      py-1
      cursor-pointer
      text-white
      text-sm
      hover:bg-neutral-700
      transition
      `;

    return (
      <div
        ref={ref}
        className={divClasses}
        style={{ pointerEvents: isOpen ? "auto" : "none" }}
      >
        <ul>
          {menuOptions.map((option, index) => (
            <li
              key={`overflowmenu-${option.label}-${index}`}
              className={listItemClasses}
              onMouseUp={(event) => {
                event.preventDefault();
                option.action();
                closeMenu();
              }}
              onClick={(event) => {
                event.preventDefault();
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      </div>
    );
  }
);

export default OverflowMenu;
