// components/ui/textarea.js
export default function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={className}
      style={{
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        width: '100%',
        minHeight: '100px',
        fontSize: '14px',
        resize: 'vertical'
      }}
      {...props}
    />
  );
}
