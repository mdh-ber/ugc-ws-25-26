function Card({ title, content, children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition ${className}`}>
      {title && <h3 className="text-lg font-bold mb-2">{title}</h3>}
      {content && <p className="text-gray-600">{content}</p>}
      {children}

      {!children && !title && !content && (
        <div className="mt-4 flex justify-between text-sm text-gray-500">
          <span>👍 120</span>
          <span>💬 34</span>
          <span>🔁 Share</span>
        </div>
      )}
    </div>
  );
}

export default Card;
