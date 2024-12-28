// components/SafeContent.tsx

import React from 'react';
import DOMPurify from 'isomorphic-dompurify';
import parse from 'html-react-parser';

interface SafeContentProps {
  content: string;
}

const SafeContent: React.FC<SafeContentProps> = ({ content }) => {
  const sanitizedContent = DOMPurify.sanitize(content);
  const parsedContent = parse(sanitizedContent);

  return (
    <div className="prose prose-lg dark:prose-invert max-w-full mx-auto">
      {parsedContent}
    </div>
  );
};

export default SafeContent;
