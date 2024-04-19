import React, { useEffect, useRef, useState } from "react";
import CollectionMenuOption from "./CollectionMenuOption";
import CollectionButton from "./CollectionButton";
import clsx from "clsx";

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

  // Side effect for hiding the collection menu when clicking outside of the container
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
    <div className="flex flex-col justify-center text-start bg-zinc-800">
      <div className="relative">
        <CollectionButton
          name={selectedCollection}
          onMouseUp={() => {
            setIsCollectionMenuOpen(true);
          }}
        />
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
