// components/ui/progress.js
export function Progress({ value = 0, className = '', ...props }) {
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-secondary ${className}`} {...props}>
      <div
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export default Progress;
