import { BrowserRouter, Routes, Route } from "react-router-dom";
import Public from "./pages/Public";
import Admin from "./pages/Admin";
import RouteHelp from "./pages/RouteHelp";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RouteHelp />} />
        <Route path="/:restaurantId/facturar" element={<Public />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<RouteHelp />} />
      </Routes>
    </BrowserRouter>
  );
}
