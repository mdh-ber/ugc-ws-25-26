function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
        {children}
        <button
          onClick={onClose}
          className="mt-4 text-red-500 font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default Modal;
