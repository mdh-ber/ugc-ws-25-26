// Added 'name' and '...props' to ensure all data is passed correctly
function FormInput({ label, type = "text", value, onChange, name, placeholder, required }) {
  return (
    <div className="flex flex-col mb-4">
      {label && (
        <label className="mb-2 font-bold text-sm text-gray-900">
          {label}
        </label>
      )}
      <input
        type={type}
        name={name} // <--- THIS WAS LIKELY MISSING
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="border border-gray-300 rounded-lg py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

export default FormInput;