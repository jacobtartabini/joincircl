
interface ContactTagsProps {
  tags: string[];
}

export const ContactTags = ({ tags }: ContactTagsProps) => {
  if (!tags || tags.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {tags.slice(0, 3).map((tag) => (
        <span
          key={tag}
          className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs"
        >
          {tag}
        </span>
      ))}
      {tags.length > 3 && (
        <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs">
          +{tags.length - 3}
        </span>
      )}
    </div>
  );
};
