import React from "react";
import { useBookmarks } from "../../../../../context/BookmarkContext";
import { CgWebsite } from "react-icons/cg";

interface FavIconProps {}

const FavIcon: React.FC<FavIconProps> = ({}) => {
  const { state } = useBookmarks();
  const favIconUrl = state.currentTab?.favIconUrl;

  const divClasses = `
    flex
    w-24
    h-16
    p-0.5
    bg-zinc-800
    justify-end
    items-start
  `;

  const imgContainerClasses = `
    flex
    grow-0
    shrink-0
    h-12
    w-12
    justify-center
    items-center
    rounded-md
    border
    border-neutral-700
    bg-stone-800
  `;

  const imgClasses = `
    h-8
    w-8
  `;

  return (
    <div className={divClasses}>
      <div className={imgContainerClasses}>
        {favIconUrl ? (
          <img className={imgClasses} src={favIconUrl}></img>
        ) : (
          <CgWebsite className={imgClasses} />
        )}
      </div>
    </div>
  );
};

export default FavIcon;
