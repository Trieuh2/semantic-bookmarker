import React from "react";
import clsx from "clsx";

interface InputProps {
  id: string;
  type?: string;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({
  id,
  type,
  required,
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
    <div className="w-full h-full">
      <input
        id={id}
        type={type}
        className={inputClasses}
      ></input>
    </div>
  );
};

export default Input;
