import React, { useState } from "react";
import clsx from "clsx";
import { FaSearch } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface SearchBarProps {}

const SearchBar: React.FC<SearchBarProps> = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const router = useRouter();

  const divClasses = `
    relative
    flex
    items-center
    w-1/3
    px-2
  `;

  const iconClasses = `
    absolute
    left-4
  `;

  const inputClasses = clsx(
    `
    form-input
    w-full
    rounded-md
    border
    border-transparent
    py-1
    px-8
    shadow-sm
    bg-zinc-900
    text-white
    text-sm
    focus:outline-none
    focus:ring-2
    focus:ring-orange-300
    focus:bg-transparent
    transition-colors
    duration-100`
  );

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      router.push(`/home/bookmarks/search/?q=${searchValue}`);
    }
  };

  return (
    <div className={divClasses}>
      <FaSearch className={iconClasses} />
      <input
        className={inputClasses}
        placeholder="Search"
        onKeyDown={(event) => handleKeyDown(event)}
        onChange={(event) => setSearchValue(event.currentTarget.value)}
      ></input>
    </div>
  );
};

export default SearchBar;
