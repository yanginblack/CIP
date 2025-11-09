interface ErrorMessageProps {
  error: string;
  onDismiss: () => void;
}

export function ErrorMessage({ error, onDismiss }: ErrorMessageProps) {
  return (
    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      {error}
      <button
        onClick={onDismiss}
        className="ml-2 text-red-500 hover:text-red-700"
      >
        ×
      </button>
    </div>
  );
}