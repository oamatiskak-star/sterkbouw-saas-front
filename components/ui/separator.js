// components/ui/separator.js
export default function Separator({ className = '', orientation = 'horizontal' }) {
  return orientation === 'horizontal' ? (
    <div className={`h-px w-full bg-gray-200 ${className}`} />
  ) : (
    <div className={`h-full w-px bg-gray-200 ${className}`} />
  );
}
