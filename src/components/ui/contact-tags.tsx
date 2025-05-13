
interface ContactTagsProps {
  tags: string[];
}

export const ContactTags = ({ tags }: ContactTagsProps) => {
  // Make sure we handle undefined or null tags
  const safeTags = Array.isArray(tags) ? tags : [];
  
  if (safeTags.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {safeTags.slice(0, 3).map((tag, index) => (
        <span
          key={`${tag}-${index}`}
          className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs"
        >
          {tag}
        </span>
      ))}
      {safeTags.length > 3 && (
        <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs">
          +{safeTags.length - 3}
        </span>
      )}
    </div>
  );
};
