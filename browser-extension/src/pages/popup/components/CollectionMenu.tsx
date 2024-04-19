import React, { useEffect, useRef, useState } from "react";
import CollectionMenuOption from "./CollectionMenuOption";
import CollectionButton from "./CollectionButton";
import clsx from "clsx";
import NewCollectionButton from "./NewCollectionButton";
import Input from "./Input";

interface CollectionMenuProps {
  collectionOptions: Set<string>;
  selectedCollection: string;
  setCollectionName: (value: string) => void;
}

const CollectionMenu: React.FC<CollectionMenuProps> = ({
  collectionOptions,
  selectedCollection,
  setCollectionName,
}) => {
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

  const collectionMenuClasses = clsx(`
    absolute 
    left-0 
    top-0 
    z-20
    mx-2
    rounded-md
    border
    border-orange-300
  `);

  return (
    <div className="flex flex-col w-full justify-center text-start bg-zinc-800">
      <div className="relative">
        <div className="flex w-full relative" ref={inputFieldParentRef}>
          <CollectionButton
            name={selectedCollection}
            onMouseUp={() => {
              setIsCollectionMenuOpen(true);
            }}
            isInputFieldOpen={isInputFieldOpen}
          />

          {/* Input field for a new Collection name */}
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
                if (event.key === "Enter") {
                  const newCollectionName = inputFieldValue.trim();
                  if (newCollectionName) {
                    setCollectionName(newCollectionName);
                  }
                  setInputFieldValue("");
                  setIsInputFieldOpen(false);
                  event.preventDefault();
                }
              }}
              onBlur={() => setIsInputFieldOpen(false)}
              disabled={!isInputFieldOpen}
              autoFocus={isInputFieldOpen}
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

        {isCollectionMenuOpen && (
          <div ref={collectionMenuRef}>
            <ul className={collectionMenuClasses}>
              <CollectionMenuOption
                key={selectedCollection}
                name={selectedCollection}
                isFirst={true}
                onMouseUp={() => {
                  setCollectionName(selectedCollection);
                  setIsCollectionMenuOpen(false);
                }}
              />
              {Array.from(collectionOptions)
                .filter((name) => name !== selectedCollection)
                .map((name, index) => {
                  return (
                    <CollectionMenuOption
                      key={name}
                      name={name}
                      isLast={collectionOptions.size - 2 === index}
                      onMouseUp={() => {
                        setCollectionName(name);
                        setIsCollectionMenuOpen(false);
                      }}
                    />
                  );
                })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionMenu;
