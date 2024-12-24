import { ReactNode, useState } from "react";


export type dropDownOptions = { label: string; onClick(): void }[];

interface Props {
  head: ReactNode;
  options: { label: string; onClick: () => any }[];
}

export default function DropdownOptions({ head, options }: Props): JSX.Element {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <button
      onBlur={() => setShowOptions(false)}
      onMouseDown={() => setShowOptions(!showOptions)}
      className="flex space-x-2 items-center relative"
    >
      {head}
      {showOptions && (
        <span className="dark:text-high-contrast-dark 
        text-low-contrast min-w-max border-2 dark:border-low-contrast-dark 
        border-low-contrast rounded absolute top-full mt-4 right-2 z-10 bg-primary 
        dark:bg-primary-dark text-left">
          <ul className="p-3 space-y-3">
            {options.map(({ label, onClick }, index) => (
              <li key={label + index} onMouseDown={onClick}>               
                  {label}               
              </li>
            ))}
          </ul>
        </span>
      )}
    </button>
  );
}
