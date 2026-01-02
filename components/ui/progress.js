// components/ui/progress.js
export function Progress({ value = 0, className = '', ...props }) {
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-gray-200 ${className}`} {...props}>
      <div
        className="h-full w-full flex-1 bg-blue-600 transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export default Progress;
