// components/SafeContent.tsx
import React from "react";
import DOMPurify from "isomorphic-dompurify";
import parse from "html-react-parser";

interface SafeContentProps {
  content: string;
}

const SafeContent: React.FC<SafeContentProps> = ({ content }) => {
  const sanitized = DOMPurify.sanitize(content);
  return (
    <div
      className="
        property-description   /* <<< sua classe personalizada */
        prose prose-lg dark:prose-invert
        max-w-full mx-auto
      "
    >
      {parse(sanitized)}
    </div>
  );
};

export default SafeContent;
