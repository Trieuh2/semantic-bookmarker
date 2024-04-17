import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";

interface TextAreaProps {
  value?: string;
  useBackground?: boolean;
  useUnderline?: boolean;
  onTextChange: (value: string) => void;
  onBlur: () => void;
}

const TextArea: React.FC<TextAreaProps> = ({
  value = "",
  useBackground,
  useUnderline,
  onTextChange,
  onBlur,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [text, setText] = useState<string>(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    if (textareaRef.current) {
      if (isFocused) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      } else {
        textareaRef.current.style.height = "2rem";
      }
    }
  }, [isFocused, text]);

  const textAreaClasses = clsx(
    `
    w-full
    box-border
    py-2
    px-2
    mx-2
    rounded-md
    resize-none
    border-transparent
    bg-transparent
    text-start
    overflow-auto
    break-words
    outline-none
    transition`,
    useBackground && "bg-zinc-900",
    !useUnderline && "focus:ring-2 focus:ring-orange-300 focus:bg-transparent"
  );

  return (
    <div className="w-full flex text-white items-center justify-center relative bg-zinc-800">
      <textarea
        ref={textareaRef}
        className={textAreaClasses}
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        onBlur={() => {
          setIsFocused(false);
          onBlur();
        }}
        onFocus={() => setIsFocused(true)}
        rows={1}
        style={{
          overflowY: isFocused ? "auto" : "hidden",
        }}
      ></textarea>
      {/* Underline element */}
      {useUnderline && isFocused && (
        <div
          className={clsx(
            "absolute bottom-0 left-0 right-0 h-0.5 mx-2",
            isFocused && "bg-orange-300"
          )}
        ></div>
      )}
    </div>
  );
};

export default TextArea;
