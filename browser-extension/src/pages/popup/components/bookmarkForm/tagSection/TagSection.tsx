import React from "react";
import Input from "../Input";
import TagButton from "./TagButton";

interface TagSectionProps {
  tagFieldValue: string;
  setTagFieldValue: (value: string) => void;
  tagSet: Set<string>;
  setTagSet: (tagSet: Set<string>) => void;
}

const TagSection: React.FC<TagSectionProps> = ({
  tagFieldValue,
  setTagFieldValue,
  tagSet,
  setTagSet,
}) => {
  return (
    <div className="w-full flex bg-zinc-800">
      <div className="min-w-20 p-2 text-end bg-zinc-800">Tags</div>
      <div className="w-full flex flex-col mx-2">
        <Input
          id="tags"
          value={tagFieldValue}
          onChange={(event) => setTagFieldValue(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              const newTag = tagFieldValue.trim();
              if (newTag !== "") {
                setTagSet(new Set([...tagSet, newTag]));
              }
              setTagFieldValue("");
              event.preventDefault();
            }
          }}
        />

        {/* Tag buttons */}
        {tagSet && tagSet.size > 0 && (
          <div className="flex flex-wrap w-full gap-1 mt-2">
            {Array.from(tagSet).map((tagName, index) => {
              return (
                <TagButton
                  key={index}
                  name={tagName}
                  onClick={(name) => {
                    const updatedTagSet = new Set(tagSet);
                    updatedTagSet.delete(name);
                    setTagSet(updatedTagSet);
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TagSection;
