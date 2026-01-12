export function keyboard(callback: (key: string, type: "down" | "up") => void) {
  let keys: string[] = [];
  const keydown = (e: KeyboardEvent) => {
    const key = (e.code == "Space" ? "space" : e.key).toLowerCase();
    if (!keys.includes(key)) keys.push(key);
    callback(keys.join("+"), "down");
    e.preventDefault();
  };

  const keyup = (e: KeyboardEvent) => {
    const key = (e.code == "Space" ? "space" : e.key).toLowerCase();
    keys = keys.filter((k) => k != key);
    callback(keys.join("+"), "up");
  };

  document.addEventListener("keydown", keydown);
  document.addEventListener("keyup", keyup);

  return () => {
    document.removeEventListener("keydown", keydown);
    document.removeEventListener("keyup", keyup);
  };
}
