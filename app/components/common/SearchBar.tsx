// components/SearchBar.tsx

import { FC } from "react";

const SearchBar: FC = (): JSX.Element => {
  return (
    <input
      placeholder="Search..."
      type="text"
      className="
        border-2 
        bg-transparent 
        border-gray-400 
        p-2 
        text-white 
        placeholder-gray-300 
        rounded 
        focus:border-blue-500 
        outline-none 
        transition 
        duration-200 
        ease-in-out
      "
    />
  );
};

export default SearchBar;
