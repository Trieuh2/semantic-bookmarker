import React from "react";

import Footer from "../Footer";
import TextArea from "./TextArea";
import CollectionMenu from "./collectionMenu/CollectionMenu";
import RemoveBookmarkButton from "./RemoveBookmarkButton";
import BookmarkFormHeader from "./BookmarkFormHeader";
import TagSection from "./tagSection/TagSection";

import { useBookmarks } from "../../../../context/BookmarkContext";
import TitleSection from "./titleSection/TitleSection";

interface BookmarkFormProps {}

const BookmarkForm: React.FC<BookmarkFormProps> = () => {
  const { state } = useBookmarks();

  const formatDate = (date: string): string => {
    const dateObj = new Date(date);
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();

    let hour = dateObj.getHours();
    const mins = ("0" + dateObj.getMinutes()).slice(-2); // Ensure two digit mins

    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    hour = hour ? hour : 12; // Convert 0 to 12 for 12 AM

    return `${month}/${day}/${year} ${hour}:${mins} ${ampm}`;
  };

  return (
    <div
      className="
        w-[400px]
        flex
        flex-col
        items-start
        text-start
        bg-zinc-800
        gap-1
      "
    >
      <BookmarkFormHeader />
      <TitleSection />

      {/* Note */}
      <div className="w-full flex bg-zinc-800">
        <div className="min-w-20 p-2 text-end bg-zinc-800">Note</div>
        <TextArea field="note" useBackground />
      </div>

      <CollectionMenu />
      <TagSection />

      {/* URL */}
      <div className="w-full flex bg-zinc-800">
        <div className="min-w-20 p-2 text-end bg-zinc-800">URL</div>
        <TextArea field="page_url" useBackground />
      </div>

      {/* Created At */}
      <div className="w-full py-2 px-4 flex bg-zinc-800">
        <div className="min-w-20 h-full flex-none bg-zinc-800" />
        <div className="w-full h-full flex-none bg-zinc-800">
          {state.bookmarkServerRecord ? (
            "Saved " + formatDate(state.bookmarkServerRecord?.createdAt ?? "")
          ) : (
            <>&nbsp;</>
          )}
        </div>
      </div>

      <RemoveBookmarkButton />
      <Footer />
    </div>
  );
};

export default BookmarkForm;
