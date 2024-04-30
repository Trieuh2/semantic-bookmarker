import React from "react";
import TextArea from "../TextArea";
import FavIcon from "./FavIcon";

interface TitleSectionProps {}

const TitleSection: React.FC<TitleSectionProps> = ({}) => {
  return (
    <div className="w-full flex bg-zinc-800">
      <FavIcon />
      <div className="w-full h-full font-bold text-sm bg-zinc-800">
        <TextArea field="title" isTitle />
      </div>
    </div>
  );
};

export default TitleSection;
