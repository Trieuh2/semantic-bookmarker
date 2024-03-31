import clsx from "clsx";
import { FieldValues, UseFormRegister } from "react-hook-form";

interface InputProps {
  label: string;
  id: string;
  type?: string;
  required?: boolean;
  register: UseFormRegister<FieldValues>;
  disabled?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  id,
  type,
  required,
  register,
  disabled,
}) => {
  const labelClasses = `
    block
    text-sm
    text-gray-400
  `;

  const inputClasses = clsx(
    `
    form-input
    block
    w-full
    rounded-md
    border
    border-transparent
    py-1
    px-2
    shadow-sm
    bg-zinc-900
    text-white
    text-sm
    focus:outline-none
    focus:ring-2
    focus:ring-orange-300
    focus:bg-transparent
    transition-colors
    duration-100`,
    disabled && "opacity-50 cursor-default"
  );

  return (
    <div>
      <label className={labelClasses}>{label}</label>
      <div className="mt-1">
        <input
          id={id}
          type={type}
          {...register(id, { required })}
          className={inputClasses}
          disabled={disabled}
        ></input>
      </div>
    </div>
  );
};

export default Input;
