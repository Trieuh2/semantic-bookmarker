import React from "react";
import { useBookmarks } from "../../../../context/BookmarkContext";

interface RemoveBookmarkButtonProps {}

const RemoveBookmarkButton: React.FC<RemoveBookmarkButtonProps> = () => {
  const { deleteBookmark } = useBookmarks();
  const handleRemoveBookmark = () => {
    deleteBookmark();
    window.close();
  };

  const buttonClasses =
    "font-bold text-red-400 hover:bg-zinc-600 py-1.5 px-2 rounded-md transition";

  return (
    <div className="w-full px-4 flex justify-end bg-zinc-800">
      <button className={buttonClasses} onMouseUp={handleRemoveBookmark}>
        Remove
      </button>
    </div>
  );
};

export default RemoveBookmarkButton;
