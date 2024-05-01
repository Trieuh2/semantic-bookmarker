"use client";

import { FullBookmarkType } from "@/app/types";
import Link from "next/link";
import { IoIosFolder } from "react-icons/io";
import { TbHash } from "react-icons/tb";
import FavIcon from "./FavIcon";
import { getDomainNameFromPageUrl } from "@/app/utils/urlActions";

interface BookmarkItemProps {
  data: FullBookmarkType;
}

const BookmarkItem: React.FC<BookmarkItemProps> = ({ data }) => {
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

  const mainContainerClasses = `
    flex
    flex-col
    gap-x-1
    px-6
    py-4
  `;

  const dividerClasses = `
    w-11/12
    h-px
    bg-zinc-700
    self-center
  `;

  const titleClasses = `
    inline-block
    max-w-screen-lg
    break-words
    text-white
    text-base
    font-bold
  `;

  const tagsClasses = `
    flex
    gap-2
    text-orange-300
    text-sm
    px-1
  `;

  const infoContainerClasses = `
    flex
    grow-0
    shrink-0
    max-w-md
    gap-x-2
    text-sm
    text-neutral-400
    p-1
  `;

  return (
    <div
      className="
        relative
        flex
        flex-col
        grow-0
        shrink-0
        h-30
        hover:bg-neutral-700
        hover:cursor-pointer
      "
    >
      <a className="absolute inset-0" href={data.page_url} target="_blank" />

      {/* Top Divider */}
      <div className={dividerClasses} />
      <div className="flex pl-2 justify-start items-center">
        <FavIcon domainName={domainName} />
        <div className={mainContainerClasses}>
          {/* Title */}
          <span className={titleClasses}>{data.title}</span>

          {/* Tags */}
          {data.tagToBookmarks && (
            <div className={tagsClasses}>
              {data.tagToBookmarks.map((tagToBookmark, index) => {
                const tagLink = "/home/tags/" + tagToBookmark.tagId;
                return (
                  <Link
                    key={`tagToBookmark-${tagToBookmark.tagId}-${index}`}
                    href={tagLink}
                    className="flex hover:underline items-center z-10"
                  >
                    <TbHash />
                    {tagToBookmark.tag?.name}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Information Container */}
          <div className={infoContainerClasses}>
            {/* Collection */}
            <Link
              href={`/home/collections/${data.collectionId}`}
              className="hover:underline z-10"
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
};

export default BookmarkItem;
