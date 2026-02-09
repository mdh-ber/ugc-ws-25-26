function Avatar({ name }) {
  const initials = name
    ? name.split(" ").map(n => n[0]).join("").toUpperCase()
    : "U";

  return (
    <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold">
      {initials}
    </div>
  );
}

export default Avatar;
