import React from "react";
import clsx from "clsx";

interface InputProps {
  id: string;
  type?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  value?: string;
}

const Input: React.FC<InputProps> = ({
  id,
  type,
  onChange,
  onKeyDown,
  value,
}) => {
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

  return (
    <div className="w-full h-full bg-zinc-800">
      <input
        id={id}
        type={type}
        className={inputClasses}
        onChange={onChange}
        onKeyDown={onKeyDown}
        value={value}
      ></input>
    </div>
  );
};

export default Input;
