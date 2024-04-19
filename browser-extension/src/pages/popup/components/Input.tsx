import React, { useEffect, useRef } from "react";
import clsx from "clsx";

interface InputProps {
  id: string;
  type?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  value?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

const Input: React.FC<InputProps> = ({
  id,
  type,
  onChange,
  onKeyDown,
  onBlur,
  value,
  disabled = false,
  autoFocus = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const inputClasses = clsx(
    `
    form-input
    block
    w-full
    h-8
    rounded-md
    border
    border-transparent
    py-2
    px-2
    shadow-sm
    bg-zinc-900
    text-white
    text-sm
    focus:outline-none
    focus:ring-2
    focus:ring-orange-300
    focus:bg-transparent
    transition`
  );

  // Effect to handle focusing logic based on autoFocus prop
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div className="w-full h-full bg-zinc-800">
      <input
        ref={inputRef}
        id={id}
        type={type}
        className={inputClasses}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        value={value}
        disabled={disabled}
        autoFocus={autoFocus}
      ></input>
    </div>
  );
};

export default Input;
