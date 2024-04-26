import React, { useEffect, useState } from "react";
import SearchBar from "./SearchBar";
import { IoIosFolder } from "react-icons/io";
import { useBookmarks } from "@/app/context/BookmarkContext";
import { usePathname, useRouter } from "next/navigation";

interface HeaderProps {}

const Header: React.FC<HeaderProps> = React.memo(() => {
  const { collections } = useBookmarks();
  const [headerTitle, setHeaderTitle] = useState<string>("");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchHeaderTitle = () => {
      const pathSegments = pathname.split("/");
      const resourceType = pathSegments[2];
      const resourceIdentifier = pathSegments[3];

      if (resourceType !== "collections") {
        setHeaderTitle("");
      }

      const collection = collections.filter(
        (collection) => collection.id === resourceIdentifier
      )[0];
      setHeaderTitle(collection?.name ?? "");
    };
    fetchHeaderTitle();
  }, [pathname, router, headerTitle]);

  const divClasses = `
    flex
    flex-col
    grow-0
    shrink-0
    w-full
    h-24
    bg-neutral-800
    p-2
    text-white
    border-b
    border-neutral-700
  `;

  const titleClasses = `
    flex
    items-center
    gap-2
    px-2
    pt-4
    text-xl
    font-bold
  `;

  return (
    <div className={divClasses}>
      <SearchBar />
      <div className={titleClasses}>
        {headerTitle && <IoIosFolder />}
        <span>{headerTitle}</span>
      </div>
    </div>
  );
});

export default Header;
