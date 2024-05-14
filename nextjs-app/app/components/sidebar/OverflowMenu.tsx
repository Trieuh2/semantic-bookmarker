"use client";

import clsx from "clsx";
import React, { ForwardedRef, forwardRef, useEffect, useState } from "react";

interface OverflowOption {
  label: string;
  action: () => void;
}

interface OverflowMenuProps {
  isOpen: boolean;
  menuOptions: OverflowOption[];
  onClickOutside?: () => void;
}

const OverflowMenu = forwardRef<HTMLDivElement, OverflowMenuProps>(
  (
    { isOpen, menuOptions, onClickOutside },
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    // Side effect to close overflow menu when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          isOpen &&
          onClickOutside &&
          ref &&
          "current" in ref &&
          ref.current &&
          !ref.current.contains(event.target as Node)
        ) {
          onClickOutside();
        }
      };
      document.addEventListener("mouseup", handleClickOutside);

      return () => {
        document.removeEventListener("mouseup", handleClickOutside);
      };
    }, [isOpen, ref, onClickOutside]);

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
      isOpen
        ? "opacity-100 pointer-events-auto"
        : "opacity-0 pointer-events-none"
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
      <div ref={ref} className={divClasses}>
        <ul>
          {menuOptions.map((option, index) => (
            <li
              key={`overflowmenu-${option.label}-${index}`}
              className={listItemClasses}
              onMouseUp={(event) => {
                event.preventDefault();
                event.stopPropagation();
                option.action();
              }}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
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

OverflowMenu.displayName = "OverflowMenu";
export default OverflowMenu;
