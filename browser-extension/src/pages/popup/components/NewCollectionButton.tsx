import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import { IoMdAddCircle } from "react-icons/io";
import { MdCancel } from "react-icons/md";

interface NewCollectionButtonProps {
  onMouseUp: () => void;
  isInputOpen: boolean;
  parentRef?: React.RefObject<HTMLDivElement>;
}

const NewCollectionButton: React.FC<NewCollectionButtonProps> = ({
  onMouseUp,
  isInputOpen,
  parentRef,
}) => {
  const [buttonTransitionStyle, setButtonTransitionStyle] =
    useState<string>("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const transitionTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (parentRef?.current && buttonRef.current) {
      const rootRect = parentRef.current.getBoundingClientRect();
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const spaceToRight = isInputOpen
        ? rootRect.right - buttonRect.right - 8
        : 0;

      if (buttonTransitionStyle !== `translateX(${spaceToRight}px)`) {
        setIsTransitioning(true); // Start the transition only if the state changes
        setButtonTransitionStyle(`translateX(${spaceToRight}px)`);

        if (transitionTimeout.current) {
          clearTimeout(transitionTimeout.current);
        }

        transitionTimeout.current = setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
      }
    }

    return () => {
      if (transitionTimeout.current) {
        clearTimeout(transitionTimeout.current);
      }
    };
  }, [isInputOpen, parentRef]);

  const handleMouseUp = () => {
    if (!isTransitioning) {
      onMouseUp();
    }
  };

  const buttonClasses = clsx(
    `
    flex
    text-start
    rounded-md
    p-1
    ring-2
    ring-transparent
    hover:ring-orange-300
    bg-zinc-800
    transition-opacity
    duration-100`,
    isInputOpen && "z-10 py-2",
    !isTransitioning && "hover:bg-zinc-600"
  );

  const buttonStyle = {
    transition: "transform 0.2s ease-in-out",
    transform: isInputOpen ? buttonTransitionStyle : "translateX(0%)",
  };

  const iconClasses = `
    justify-self-end
    self-center
    mx-1`;

  return (
    <button
      className={buttonClasses}
      onMouseUp={handleMouseUp}
      ref={buttonRef}
      style={buttonStyle}
      disabled={isTransitioning}
    >
      {!isInputOpen ? (
        <IoMdAddCircle className={iconClasses} />
      ) : (
        <MdCancel className={iconClasses} style={{ color: "red" }} />
      )}
    </button>
  );
};

export default NewCollectionButton;
