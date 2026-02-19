import { useState } from "react"

// HEllooooo
export function Button() {
  const [value, setValue] = useState(false);

  return <button onClick={() => setValue(!value)}>Hellooooo</button>
}