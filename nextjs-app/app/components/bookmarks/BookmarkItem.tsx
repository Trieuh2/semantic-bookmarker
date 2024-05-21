"use client";

import { FullBookmarkType } from "@/app/types";
import Link from "next/link";
import { IoIosFolder } from "react-icons/io";
import { TbHash } from "react-icons/tb";
import FavIcon from "./FavIcon";
import { getDomainNameFromPageUrl } from "@/app/utils/urlActions";
import React, { useEffect, useState } from "react";
import { useBookmarks } from "@/app/context/BookmarkContext";
import clsx from "clsx";

interface BookmarkItemProps {
  index: Number;
  data: FullBookmarkType;
  inDetailedBookmarkPanel?: boolean;
}

const BookmarkItem: React.FC<BookmarkItemProps> = React.memo(
  ({ index, data, inDetailedBookmarkPanel }) => {
    const { state, dispatch } = useBookmarks();
    const [isHovered, setIsHovered] = useState<boolean>(false);

    const domainName = getDomainNameFromPageUrl(data.page_url);
    const formatDate = (date: Date) => {
      const dateObj = new Date(date);
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
      };
      const friendlyDate = dateObj.toLocaleDateString("en-US", options);

      // Only include year if it is not current year
      const currentYear = new Date().getFullYear().toString();

      if (friendlyDate.endsWith(currentYear)) {
        const end = friendlyDate.length - 6; // 4 chars for year, 2 chars for comma and space
        return friendlyDate.slice(0, end);
      }
      return friendlyDate;
    };

    const handleItemClick = () => {
      if (state.activeBookmark?.id === data.id) {
        dispatch({
          type: "TOGGLE_DETAILED_PANEL_WITH_BOOKMARK",
          payload: {
            isShowing: !state.isShowingDetailedPanel,
            activeBookmark: data,
          },
        });
      } else {
        dispatch({
          type: "SHOW_DETAILED_PANEL_WITH_BOOKMARK",
          payload: {
            activeBookmark: data,
          },
        });
      }
    };

    return (
      <div
        className={clsx(
          `
          relative
          flex
          flex-col
          grow-0
          shrink-0
          min-h-24
          transition
          duration-200
          hover:cursor-pointer
        `,
          (state.activeBookmark?.id !== data.id || inDetailedBookmarkPanel) &&
            isHovered &&
            "bg-neutral-700 ",
          state.activeBookmark?.id === data.id &&
            state.isShowingDetailedPanel &&
            !inDetailedBookmarkPanel &&
            "bg-neutral-600"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Top Divider */}
        {index !== 0 && <div className="w-full h-px bg-zinc-700 self-center" />}
        <div
          className="flex pl-2 justify-start items-center"
          onClick={(event) => {
            handleItemClick();
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <FavIcon domainName={domainName} />
          <div className="flex flex-col gap-x-1 px-6 py-4">
            {/* Title */}
            <a
              className="inline-block max-w-screen-lg break-words text-white text-base font-bold hover:underline underline-offset-2 z-10"
              href={data.page_url}
              target="_blank"
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              {data.title}
            </a>

            {/* Tags */}
            {data.tagToBookmarks && (
              <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-orange-300 text-sm px-1">
                {data.tagToBookmarks.map((tagToBookmark, index) => {
                  const tagLink = "/home/tags/" + tagToBookmark.tagId;
                  return (
                    <Link
                      key={`tagToBookmark-${tagToBookmark.tagId}-${index}`}
                      href={tagLink}
                      className="flex hover:underline items-center z-10"
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                    >
                      <TbHash />
                      {tagToBookmark.tag?.name}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Information Container */}
            <div className="flex grow-0 shrink-0 max-w-md gap-x-2 text-sm text-neutral-400 p-1">
              {/* Collection */}
              <Link
                href={`/home/collections/${data.collectionId}`}
                className="hover:underline z-10"
                onClick={(event) => event.stopPropagation()}
              >
                <span className="flex gap-2 items-center">
                  <IoIosFolder />
                  {data.collection?.name ?? "Unsorted"}
                </span>
              </Link>
              <span>·</span>

              {/* Page URL */}
              <span>{domainName}</span>
              <span>·</span>

              {/* Friendly Date */}
              <span>{formatDate(data.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

BookmarkItem.displayName = "BookmarkItem";
export default BookmarkItem;
