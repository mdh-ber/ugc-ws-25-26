function Button({ text, onClick, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
    >
      {text}
    </button>
  );
}

export default Button;
