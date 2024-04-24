"use client";

import { FullBookmarkType } from "@/app/types";
import Link from "next/link";
import { IoIosFolder } from "react-icons/io";
import { TbHash } from "react-icons/tb";

interface BookmarkItemProps {
  data: FullBookmarkType;
}

const BookmarkItem: React.FC<BookmarkItemProps> = ({ data }) => {
  const formatPageUrl = (page_url: string) => {
    try {
      const url = new URL(page_url);
      const urlHostName = url.hostname;
      return urlHostName.replace("www.", "");
    } catch (error) {
      console.error("Error parsing hostName from page_url", error);
      return "";
    }
  };

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
    <a href={data.page_url} target="_blank">
      <div
        className="
        flex
        flex-col
        grow-0
        shrink-0
        h-30
        hover:bg-neutral-700
        hover:cursor-pointer
      "
      >
        {/* Top Divider */}
        <div className={dividerClasses} />
        <div className={mainContainerClasses}>
          {/* Title */}
          <div className={titleClasses}>{data.title}</div>

          {/* Tags */}
          {data.tagToBookmarks && (
            <div className={tagsClasses}>
              {data.tagToBookmarks.map((tagToBookmark) => {
                const tagLink = "/home/tags/" + tagToBookmark.tagId;
                return (
                  <Link
                    key={tagToBookmark.tagId}
                    href={tagLink}
                    className="flex hover:underline items-center"
                  >
                    <TbHash />
                    {tagToBookmark.tag_name}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Information Container */}
          <div className={infoContainerClasses}>
            {/* Collection */}
            <Link
              href={`/home/collections/${encodeURIComponent(
                data.collection_name.toLowerCase()
              )}`}
              className="hover:underline"
            >
              <span className="flex gap-2 items-center">
                <IoIosFolder />
                {data.collection_name}
              </span>
            </Link>
            <span>·</span>
            {/* Page URL */}
            <span>{formatPageUrl(data.page_url)}</span>
            <span>·</span>
            {/* Friendly Date */}
            <span>{formatDate(data.createdAt)}</span>
          </div>
        </div>
      </div>
    </a>
  );
};

export default BookmarkItem;
