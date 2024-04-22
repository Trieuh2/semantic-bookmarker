import React from "react";

interface RemoveBookmarkButtonProps {
  onClick?: () => void;
  isLoading?: () => void;
}

const RemoveBookmarkButton: React.FC<RemoveBookmarkButtonProps> = ({
  onClick,
  isLoading,
}) => {
  const buttonClasses =
    "font-bold text-red-400 hover:bg-zinc-600 py-1.5 px-2 rounded-md transition";

  return (
    <div className="w-full px-4 flex justify-end bg-zinc-800">
      <button className={buttonClasses} onMouseUp={onClick}>
        Remove
      </button>
    </div>
  );
};

export default RemoveBookmarkButton;
