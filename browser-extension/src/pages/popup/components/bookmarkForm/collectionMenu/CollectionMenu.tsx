import React, { useEffect, useRef, useState } from "react";
import CollectionButton from "./CollectionButton";
import clsx from "clsx";
import NewCollectionButton from "./NewCollectionButton";
import Input from "../Input";
import CollectionMenuOption from "./CollectionMenuOption";
import { useBookmarks } from "../../../../../context/BookmarkContext";

interface CollectionMenuProps {}

const CollectionMenu: React.FC<CollectionMenuProps> = ({}) => {
  const { state, dispatch } = useBookmarks();
  const collectionMenuRef = useRef<HTMLDivElement>(null);
  const [isCollectionMenuOpen, setIsCollectionMenuOpen] =
    useState<boolean>(false);

  const [inputFieldValue, setInputFieldValue] = useState<string>("");
  const [isInputFieldOpen, setIsInputFieldOpen] = useState<boolean>(false);
  const inputFieldParentRef = useRef<HTMLDivElement>(null);

  // Effect for hiding the collection menu when clicking outside of the container
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        collectionMenuRef.current &&
        !collectionMenuRef.current.contains(event.target as Node)
      ) {
        setIsCollectionMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputOnKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      const newCollectionName = inputFieldValue.trim();
      if (newCollectionName) {
        dispatch({
          type: "SET_STATE",
          variable: "selectedCollection",
          payload: newCollectionName,
        });

        // Update collection options state
        const updatedOptions = new Set(state.collectionOptions);
        updatedOptions.add(newCollectionName);

        dispatch({
          type: "SET_STATE",
          variable: "collectionOptions",
          payload: updatedOptions,
        });
      }
      setInputFieldValue("");
      setIsInputFieldOpen(false);
      event.preventDefault();
    }
  };

  const handleOptionBtnOnMouseUp = () => {
    dispatch({
      type: "SET_STATE",
      variable: "selectedCollection",
      payload: state.selectedCollection,
    });
    setIsCollectionMenuOpen(false);
  };

  const scrollbarClasses = `
    scrollbar-thin
    scrollbar-thumb-rounded-md
    scrollbar-thumb-neutral-600
    scrollbar-track-rounded-md
    scrollbar-track-neutral-500
    overflow-y-scroll
  `;

  const collectionMenuClasses = clsx(
    `
    absolute 
    left-0
    top-0
    z-20
    max-h-[180px]
    mx-2
    rounded-md
    drop-shadow
    transition-opacity
    duration-200
    `,
    state.collectionOptions.size >= 7 && scrollbarClasses,
    isCollectionMenuOpen
      ? "ring-2 ring-orange-300 opacity-100"
      : "ring-2 ring-transparent opacity-0 pointer-events-none"
  );

  return (
    <div className="w-full flex bg-zinc-800">
      <div className="min-w-20 p-2 text-end bg-zinc-800">Collection</div>
      <div className="flex flex-col w-full justify-center text-start bg-zinc-800">
        <div className="relative">
          {/* Input field for a new Collection name */}
          <div className="flex w-full relative" ref={inputFieldParentRef}>
            <CollectionButton
              name={state.selectedCollection}
              onMouseUp={() => {
                setIsCollectionMenuOpen(true);
              }}
              isInputFieldOpen={isInputFieldOpen}
            />

            <div
              className={clsx(
                "absolute w-full px-2 transition-opacity",
                isInputFieldOpen ? "opacity-100" : "opacity-0"
              )}
            >
              <Input
                id={"newCollectionField"}
                onChange={(event) =>
                  setInputFieldValue(event.currentTarget.value)
                }
                onKeyDown={(event) => {
                  handleInputOnKeyDown(event);
                }}
                onBlur={() => {
                  setIsInputFieldOpen(false);
                  setInputFieldValue("");
                }}
                disabled={!isInputFieldOpen}
                autoFocus={isInputFieldOpen}
                value={inputFieldValue}
              />
            </div>

            <NewCollectionButton
              onMouseUp={() => {
                setIsInputFieldOpen(!isInputFieldOpen);
              }}
              isInputOpen={isInputFieldOpen}
              parentRef={inputFieldParentRef}
            />
          </div>

          {/* Collection Options to select from */}
          <div ref={collectionMenuRef} className={collectionMenuClasses}>
            <ul>
              <CollectionMenuOption
                key={state.selectedCollection}
                name={state.selectedCollection}
                isFirst={true}
                onMouseUp={() => handleOptionBtnOnMouseUp()}
              />
              {Array.from(state.collectionOptions)
                .filter((name) => name !== state.selectedCollection)
                .map((name, index) => {
                  return (
                    <CollectionMenuOption
                      key={name}
                      name={name}
                      isLast={state.collectionOptions.size - 2 === index}
                      onMouseUp={() => {
                        dispatch({
                          type: "SET_STATE",
                          variable: "selectedCollection",
                          payload: name,
                        });
                        setIsCollectionMenuOpen(false);
                      }}
                    />
                  );
                })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionMenu;
