import { useState } from "react"

// HEllooooo
// world
export function Button() {
  const [value, setValue] = useState(false);

  return <button onClick={() => setValue(!value)}>Hellooooo world</button>
}