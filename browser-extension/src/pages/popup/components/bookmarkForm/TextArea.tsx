import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import { useBookmarks } from "../../../../context/BookmarkContext";

interface TextAreaProps {
  useBackground?: boolean;
  isTitle?: boolean;
  field: "title" | "page_url" | "note";
}

const TextArea: React.FC<TextAreaProps> = ({
  useBackground,
  isTitle,
  field,
}) => {
  const { state, dispatch } = useBookmarks();
  const [isFocused, setIsFocused] = useState(false);
  const textRef = useRef<string>("");
  const [text, setText] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textRef.current = state[field];
    setText(state[field]);
  }, [state.title, state.page_url, state.note]);

  useEffect(() => {
    if (textareaRef.current) {
      if (isTitle || isFocused) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      } else {
        textareaRef.current.style.height = "2rem";
      }
    }
  }, [isTitle, isFocused, text]);

  const handleTextAreaOnChange = (
    field: "title" | "page_url" | "note",
    value: string
  ) => {
    textRef.current = value;
    setText(value);
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

  const divContainerClasses = clsx(
    `
    w-full
    max-w-[305px]
    max-h-[168px]
    h-15
    flex
    flex-col
    mx-2
    items-center
    justify-center
    relative
    bg-zinc-800
    `
  );

  const scrollbarClasses = clsx(
    `
    scrollbar-thin
    scrollbar-thumb-rounded-md
    scrollbar-thumb-neutral-600
    scrollbar-track-rounded-md
    scrollbar-track-neutral-500
    overflow-y-scroll
  `
  );

  const textAreaClasses = clsx(
    `
    w-full
    box-border
    py-1.5
    px-2
    rounded-md
    resize-none
    bg-transparent
    text-white
    text-sm
    break-all
    focus:outline-none
    transition`,
    scrollbarClasses,
    useBackground && "bg-zinc-900",
    isTitle && "outline-none",
    !isTitle && "focus:ring-2 focus:ring-orange-300 focus:bg-transparent",
    !isTitle && !isFocused && "leading-relaxed",
    !isTitle && isFocused && "leading-normal",
    state.isLoading && "opacity-25 pointer-events-none"
  );

  return (
    <div className={divContainerClasses}>
      <textarea
        disabled={state.isLoading}
        ref={textareaRef}
        className={textAreaClasses}
        value={text}
        onChange={(e) => handleTextAreaOnChange(field, e.target.value)}
        onBlur={() => {
          if (textareaRef.current) {
            textareaRef.current.scrollTop = 0;
          }
          setIsFocused(false);
          handleTextAreaOnBlur(field);
        }}
        rows={1}
        onFocus={() => setIsFocused(true)}
        style={{
          overflowY: isFocused ? "auto" : "hidden",
        }}
      ></textarea>
      {/* Underline element */}
      {isTitle && (
        <div
          className={clsx(
            "absolute bottom-0 left-0 right-0 h-0.5 mx-2 bg-orange-300"
          )}
        ></div>
      )}
    </div>
  );
};

export default TextArea;
