import { HashRouter, Route, Routes } from "react-router-dom"
import TwoD from "./pages/TwoD"
import ThreeD from "./pages/ThreeD"

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="2d" element={<TwoD />} />
        <Route path="3d" element={<ThreeD />} />
      </Routes>
    </HashRouter>
  )
}
