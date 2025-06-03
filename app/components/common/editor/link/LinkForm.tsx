import { FC, useEffect, useState } from "react";
import { validateUrl } from "../EditorUtils";

interface Props {
  visible: boolean;
  initialState?: linkOpition;
  onSubmit(link: linkOpition): void;
  onRemove?(): void;
}

export type linkOpition = {
  url: string;
  openInNewTab: boolean;
};

const defaultLink = {
  url: "",
  openInNewTab: false,
};

const LinkForm: FC<Props> = ({
  visible,
  initialState,
  onSubmit,
}): JSX.Element | null => {
  const [link, setLink] = useState<linkOpition>(defaultLink);

  const handleSubmit = () => {
    onSubmit({ ...link, url: validateUrl(link.url) });
    resetForm();
  };

  const resetForm = () => {
    setLink({ ...defaultLink });
  };

  useEffect(() => {
    if (initialState) setLink({ ...initialState });
  }, [initialState]);

  if (!visible) return null;

  return (
    <div
      className="rounded text-left bg-primary dark:bg-primary-dark 
    animate-reveal z-50 dark:shadow-secondary-dark shadow-md p-2"
    >
      <div className="flex items-center space-x-2">
        <input
          autoFocus
          type="text"
          className="rounded bg-transparent focus:ring-0 focus:border-primary-dark 
          dark:focus:border-primary transition dark:text-primary text-primary-dark"
          placeholder="https://example.com"
          value={link.url}
          onChange={({ target }) => setLink({ ...link, url: target.value })}
        />
      </div>

      <div
        className="mt-2 flex items-center space-x-1 text-sm select-none 
      text-secondary-dark dark:text-secondary-light"
      >
        <input
          className="focus:ring-0 rounded-sm w-3 h-3 outline-none"
          type="checkbox"
          id="checkbox"
          checked={link.openInNewTab}
          onChange={({ target }) =>
            setLink({ ...link, openInNewTab: target.checked })
          }
        />
        <label htmlFor="checkbox">open in new tab</label>

        <div className="text-right flex-1">
          <button
            onClick={handleSubmit}
            className="bg-action text-primary text-sm px-2 py-1 rounded"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkForm;
