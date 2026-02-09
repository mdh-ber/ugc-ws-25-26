function FormInput({ label, type = "text", value, onChange }) {
  return (
    <div className="flex flex-col mb-4">
      <label className="mb-2 font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}

export default FormInput;
