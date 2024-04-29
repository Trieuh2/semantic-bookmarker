import React from "react";

import Footer from "../Footer";
import TextArea from "./TextArea";
import CollectionMenu from "./collectionMenu/CollectionMenu";
import RemoveBookmarkButton from "./RemoveBookmarkButton";
import BookmarkFormHeader from "./BookmarkFormHeader";
import TagSection from "./tagSection/TagSection";

import { useBookmarks } from "../../../../context/BookmarkContext";

interface BookmarkFormProps {}

const BookmarkForm: React.FC<BookmarkFormProps> = () => {
  const { state, dispatch } = useBookmarks();

  const handleTextAreaOnChange = (
    field: "title" | "page_url" | "note",
    value: string
  ) => {
    dispatch({
      type: "SET_STATE",
      variable: field as "title" | "note" | "page_url",
      payload: value,
    });
  };

  // Reset the textArea to initial values if the field becomes empty
  const handleTextAreaOnBlur = (field: "title" | "page_url" | "note") => {
    if (
      (field === "title" || field === "page_url") &&
      !state[field] &&
      state.initialValues
    ) {
      dispatch({
        type: "SET_STATE",
        variable: field,
        payload: state.initialValues[field],
      });
    }
  };

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
        gap-1.5
      "
    >
      <BookmarkFormHeader />

      {/* Title */}
      <div className="w-full flex bg-zinc-800">
        <div className="min-w-20 p-2 text-end bg-zinc-800">Title</div>
        <div className="w-full h-full font-bold text-sm bg-zinc-800">
          <TextArea
            value={state.title}
            useUnderline
            onTextChange={(value) => {
              handleTextAreaOnChange("title", value);
            }}
            onBlur={() => handleTextAreaOnBlur("title")}
          />
        </div>
      </div>

      {/* Note */}
      <div className="w-full flex bg-zinc-800">
        <div className="min-w-20 p-2 text-end bg-zinc-800">Note</div>
        <TextArea
          value={state.note}
          useBackground
          onTextChange={(value) => {
            handleTextAreaOnChange("note", value);
          }}
          onBlur={() => handleTextAreaOnBlur("note")}
        />
      </div>

      <CollectionMenu />
      <TagSection />

      {/* URL */}
      <div className="w-full flex bg-zinc-800">
        <div className="min-w-20 p-2 text-end bg-zinc-800">URL</div>
        <TextArea
          value={state.page_url}
          useBackground
          onTextChange={(value) => {
            handleTextAreaOnChange("page_url", value);
          }}
          onBlur={() => handleTextAreaOnBlur("page_url")}
        />
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
