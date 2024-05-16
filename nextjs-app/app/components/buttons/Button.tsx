import clsx from "clsx";

interface ButtonProps {
  type?: "button" | "submit" | "reset" | undefined;
  fullWidth?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  classNames?: string;
}

const Button: React.FC<ButtonProps> = ({
  type,
  fullWidth,
  children,
  onClick,
  disabled,
  classNames,
}) => {
  const buttonClasses = clsx(
    `
    flex
    justify-center
    rounded-md
    px-2
    py-1
    font-medium
    transition-colors
    duration-150
    `,
    fullWidth && "w-full",
    disabled
      ? "opacity-50 cursor-default bg-zinc-900 outline-0"
      : "bg-orange-300 hover:bg-orange-200 active:bg-orange-400",
    classNames
  );

  return (
    <button
      className={buttonClasses}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
