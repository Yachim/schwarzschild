import { BrowserRouter, Route, Routes } from "react-router-dom"
import TwoD from "./pages/TwoD"
import ThreeD from "./pages/ThreeD"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="2d" element={<TwoD />} />
        <Route path="3d" element={<ThreeD />} />
      </Routes>
    </BrowserRouter>
  )
}
