"use client";

import clsx from "clsx";
import React, { ForwardedRef, forwardRef, useEffect, useState } from "react";

interface SidebarInputProps {
  id: string;
  isOpen: boolean;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onClickOutside?: () => void;
  nested?: boolean;
}

const SidebarInput = forwardRef<HTMLInputElement, SidebarInputProps>(
  (
    { id, value, isOpen, onChange, onKeyDown, onClickOutside, nested },
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    // Side effect to close rename field when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
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
    }, [isOpen, onClickOutside, ref]);

    const inputClasses = clsx(
      `
      absolute
      py-0.5
      px-1
      rounded-md
      outline-0
      focused:outline
      bg-stone-900
      text-sm
      text-orange-300
      transition-opacity
      ease-in-out
    `,
      isOpen
        ? "opacity-100 pointer-events-auto"
        : "opacity-0 pointer-events-none",
      nested ? "w-52 left-[52px]" : "w-56 left-9"
    );

    return (
      <input
        id={id}
        className={inputClasses}
        ref={ref}
        value={value}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
    );
  }
);

export default SidebarInput;
