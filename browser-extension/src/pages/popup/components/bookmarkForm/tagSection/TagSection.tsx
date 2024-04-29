import React from "react";
import Input from "../Input";
import TagButton from "./TagButton";
import { useBookmarks } from "../../../../../context/BookmarkContext";

interface TagSectionProps {}

const TagSection: React.FC<TagSectionProps> = ({}) => {
  const { state, dispatch } = useBookmarks();

  const handleInputOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: "SET_STATE",
      variable: "tagFieldValue",
      payload: event.currentTarget.value,
    });
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const newTag = state.tagFieldValue.trim();
      if (newTag !== "") {
        dispatch({
          type: "SET_STATE",
          variable: "tagSet",
          payload: new Set([...state.tagSet, newTag]),
        });
      }

      dispatch({
        type: "SET_STATE",
        variable: "tagFieldValue",
        payload: "",
      });
      event.preventDefault();
    }
  };

  const handleTagBtnOnClick = (name: string) => {
    const updatedTagSet = new Set(state.tagSet);
    updatedTagSet.delete(name);
    dispatch({
      type: "SET_STATE",
      variable: "tagSet",
      payload: updatedTagSet,
    });
  };

  return (
    <div className="w-full flex bg-zinc-800">
      <div className="min-w-20 p-2 text-end bg-zinc-800">Tags</div>
      <div className="w-full flex flex-col mx-2">
        <Input
          id="tags"
          value={state.tagFieldValue}
          onChange={(event) => handleInputOnChange(event)}
          onKeyDown={(event) => handleInputKeyDown(event)}
        />

        {/* Tag buttons */}
        {state.tagSet && state.tagSet.size > 0 && (
          <div className="flex flex-wrap w-full gap-1 mt-2">
            {Array.from(state.tagSet).map((tagName, index) => {
              return (
                <TagButton
                  key={index}
                  name={tagName}
                  onClick={(name) => handleTagBtnOnClick(name)}
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
